const BREVO_API = "https://api.brevo.com/v3/smtp/email";

export async function sendBrevoTemplate({
  templateId,
  to,
  params,
}: {
  templateId: number;
  to: { email: string; name?: string }[];
  params: Record<string, string | number | null | undefined>;
}): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.warn("[email] BREVO_API_KEY manquant — email non envoyé.");
    return;
  }
  if (!templateId) {
    console.warn("[email] templateId manquant — email non envoyé.");
    return;
  }

  const res = await fetch(BREVO_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({ templateId, to, params }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`[email] Brevo error ${res.status}: ${err}`);
  }
}
