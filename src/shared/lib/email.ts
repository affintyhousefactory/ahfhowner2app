const BREVO_API = "https://api.brevo.com/v3/smtp/email";
const BREVO_CONTACTS_API = "https://api.brevo.com/v3/contacts";
const BREVO_DOI_API = "https://api.brevo.com/v3/contacts/doubleOptinConfirmation";

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

export async function addBrevoContact(
  email: string,
  attrs: Record<string, string | null | undefined>,
  listIds: number[],
): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.warn("[email] BREVO_API_KEY manquant — contact non ajouté.");
    return;
  }
  const res = await fetch(BREVO_CONTACTS_API, {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-key": apiKey },
    body: JSON.stringify({ email, attributes: attrs, listIds, updateEnabled: true }),
  });
  if (!res.ok && res.status !== 204) {
    console.warn(`[email] addBrevoContact ${res.status}:`, await res.text());
  }
}

export async function addBrevoContactDOI(
  email: string,
  attrs: Record<string, string | null | undefined>,
  listId: number,
  templateId: number,
  redirectionUrl: string,
): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey || !templateId) {
    console.warn("[email] BREVO_API_KEY ou templateId manquant — DOI non envoyé.");
    return;
  }
  const res = await fetch(BREVO_DOI_API, {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-key": apiKey },
    body: JSON.stringify({
      email,
      attributes: attrs,
      includeListIds: [listId],
      templateId,
      redirectionUrl,
    }),
  });
  if (!res.ok && res.status !== 204) {
    console.warn(`[email] addBrevoContactDOI ${res.status}:`, await res.text());
  }
}
