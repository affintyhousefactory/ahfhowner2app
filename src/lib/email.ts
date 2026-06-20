import { render } from "@react-email/render";
import type { ReactElement } from "react";

const BREVO_API = "https://api.brevo.com/v3/smtp/email";

export async function sendEmail({
  to,
  subject,
  template,
}: {
  to: string[];
  subject: string;
  template: ReactElement;
}): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.BREVO_SENDER_EMAIL ?? process.env.EMAIL_FROM ?? "contact@affinityhousefactory.com";
  const fromName = process.env.BREVO_SENDER_NAME ?? "Affinity House Factory";

  if (!apiKey) {
    console.warn("[email] BREVO_API_KEY manquant — email non envoyé.");
    return;
  }

  const htmlContent = await render(template);

  const res = await fetch(BREVO_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: { name: fromName, email: fromEmail },
      to: to.map((email) => ({ email })),
      subject,
      htmlContent,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`[email] Brevo error ${res.status}: ${err}`);
  }
}
