import { NextRequest, NextResponse } from "next/server";
import { sendBrevoTemplate, addBrevoContact } from "@/shared/lib/email";
import { signalerPanne } from "@/shared/lib/panne";

const PRODUIT_LABELS: Record<string, string> = {
  one: "Arko One (20 m²)",
  max: "Arko Max (40 m²)",
  autre: "Autre demande",
};

type Payload = {
  prenom: string;
  nom: string;
  email: string;
  tel?: string | null;
  produit?: string | null;
  message: string;
  captchaToken?: string | null;
  optIn?: boolean;
};

const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Payload;
  const { prenom, nom, tel, produit, message, captchaToken, optIn } = body;
  const email = body.email?.trim();

  if (!prenom?.trim() || !nom?.trim() || !email || !message?.trim()) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }
  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  // Vérification Turnstile (obligatoire en production)
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  let turnstileOk = false;

  if (turnstileSecret && captchaToken) {
    const check = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: turnstileSecret, response: captchaToken }),
      }
    );
    const result = (await check.json()) as { success: boolean };
    turnstileOk = result.success;
    if (!turnstileOk) {
      return NextResponse.json({ error: "captcha_failed" }, { status: 400 });
    }
  } else if (turnstileSecret && !captchaToken) {
    return NextResponse.json({ error: "captcha_required" }, { status: 400 });
  } else {
    turnstileOk = false;
  }

  // Persist Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Non bloquant par choix, comme sur `/api/reservation` : l'email Brevo part
  // même si le stockage échoue. `persisted` porte l'autre moitié de la vérité
  // jusqu'à la réponse — voir `shared/lib/panne.ts`.
  let persisted = true;

  if (supabaseUrl && serviceRole) {
    const res = await fetch(`${supabaseUrl}/rest/v1/contacts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceRole,
        Authorization: `Bearer ${serviceRole}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ prenom, nom, email, tel, produit, message, turnstile_ok: turnstileOk }),
    });
    if (!res.ok) {
      persisted = false;
      signalerPanne("contact/supabase", `HTTP ${res.status} — ${await res.text()}`);
    }
  } else {
    // Variables absentes : le contact n'est pas stocké non plus. C'était un
    // `console.warn`, donc encore plus discret qu'une erreur.
    persisted = false;
    signalerPanne("contact/supabase", "variables Supabase absentes de l'environnement");
  }

  const templateId = parseInt(process.env.BREVO_TEMPLATE_CONTACT ?? "0");
  const toAhf = process.env.EMAIL_TO_AHF ?? process.env.BREVO_TO_AHF ?? "";

  // L'email est le **second** canal : si le stockage a échoué, c'est le seul
  // qui reste. Son échec était lui aussi avalé — les deux pouvant tomber
  // ensemble, le visiteur voyait alors un succès pour une demande qui
  // n'existait nulle part. `notified` le dit désormais.
  let notified = true;
  await sendBrevoTemplate({
    templateId,
    to: [
      { email, name: `${prenom} ${nom}` },
      ...(toAhf ? [{ email: toAhf, name: "Affinity House Factory" }] : []),
    ],
    params: {
      prenom,
      nom,
      produit_label: produit ? (PRODUIT_LABELS[produit] ?? produit) : null,
      message,
    },
  }).catch((err) => {
    notified = false;
    signalerPanne("contact/brevo", err);
  });

  // Contact CRM Brevo : toujours créé. Pas de flux double opt-in sur ce formulaire —
  // l'utilisateur est directement inscrit (SUBSCRIBED, liste prospects) si la case est
  // cochée, ou créé blocklisté sinon (traçabilité de la demande sans communication marketing).
  await addBrevoContact(
    email,
    { PRENOM: prenom, NOM: nom, SMS: tel ?? undefined },
    optIn ? [parseInt(process.env.BREVO_LIST_PROSPECTS ?? "8")] : [],
    { emailBlacklisted: !optIn },
  ).catch((err) => console.error("[contact] Brevo contact error:", err));

  // Trois faits distincts, trois champs. `success` dit que la demande a été
  // reçue et traitée ; `persisted` dit si elle est en base ; `notified` si
  // l'email est parti. Les confondre en un seul booléen est ce qui a rendu
  // une base en pause invisible pendant des semaines.
  //
  // `success` reste vrai même si les deux ont échoué : la requête a bien été
  // reçue et validée (Turnstile compris), et un `false` ici ferait réessayer
  // le visiteur sans rien changer au problème. La vérité est dans les deux
  // autres champs et dans les journaux `[PANNE]`.
  return NextResponse.json({ success: true, persisted, notified });
}
