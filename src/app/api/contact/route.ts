import { NextRequest, NextResponse } from "next/server";
import { createElement } from "react";
import ContactConfirmation from "../../../../emails/contact-confirmation";
import { sendEmail } from "@/lib/email";

type Payload = {
  prenom: string;
  nom: string;
  email: string;
  tel?: string | null;
  produit?: string | null;
  message: string;
  captchaToken?: string | null;
};

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Payload;
  const { prenom, nom, email, tel, produit, message, captchaToken } = body;

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
    // Pas de secret configuré (dev local) — on laisse passer
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

  // Envoi email Brevo
  const toAhf = process.env.EMAIL_TO_AHF ?? "";
  const recipients = [email, ...(toAhf ? [toAhf] : [])].filter(Boolean);

  await sendEmail({
    to: recipients,
    subject: "Votre message a bien été reçu — Affinity House Factory",
    template: createElement(ContactConfirmation, { prenom, nom, produit, message }),
  });

  return NextResponse.json({ success: true });
}
