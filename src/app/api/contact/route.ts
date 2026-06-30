import { NextRequest, NextResponse } from "next/server";
import { sendBrevoTemplate, addBrevoContactDOI } from "@/shared/lib/email";

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

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Payload;
  const { prenom, nom, email, tel, produit, message, captchaToken, optIn } = body;

  if (!prenom || !nom || !email || !message) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
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
      console.error("[contact] Supabase error:", await res.text());
    }
  } else {
    console.warn("[contact] Supabase non configuré — contact non persisté.");
  }

  const templateId = parseInt(process.env.BREVO_TEMPLATE_CONTACT ?? "0");
  const toAhf = process.env.EMAIL_TO_AHF ?? process.env.BREVO_TO_AHF ?? "";

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
  }).catch((err) => console.error("[contact] Brevo error:", err));

  // Opt-in newsletter prospects (DOI — list 8)
  if (optIn) {
    const doiTemplateId = parseInt(process.env.BREVO_DOI_TEMPLATE_ID ?? "0");
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://howner.fr";
    await addBrevoContactDOI(
      email,
      { PRENOM: prenom, NOM: nom, SMS: tel ?? undefined },
      parseInt(process.env.BREVO_LIST_PROSPECTS ?? "8"),
      doiTemplateId,
      `${siteUrl}/confirmation-inscription`,
    ).catch((err) => console.error("[contact] Brevo DOI error:", err));
  }

  return NextResponse.json({ success: true });
}
