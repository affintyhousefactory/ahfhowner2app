const BREVO_API = "https://api.brevo.com/v3/smtp/email";
const BREVO_CONTACTS_API = "https://api.brevo.com/v3/contacts";
const BREVO_DOI_API = "https://api.brevo.com/v3/contacts/doubleOptinConfirmation";

// Brevo exige un attribut SMS au format international (ex: +33612345678) — un numéro
// français saisi au format national (ex: "06 12 34 56 78") est rejeté tel quel (400
// Invalid phone number). On ne normalise que le cas français courant ; les formats déjà
// internationaux ou inconnus sont laissés tels quels pour que Brevo valide/rejette lui-même.
function normalizePhoneFr(tel: string | null | undefined): string | undefined {
  if (!tel) return undefined;
  const digits = tel.replace(/[\s.\-()]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.startsWith("0") && digits.length === 10) return `+33${digits.slice(1)}`;
  if (digits.startsWith("33") && digits.length === 11) return `+${digits}`;
  return digits;
}

function normalizeAttrs(
  attrs: Record<string, string | null | undefined>,
): Record<string, string | null | undefined> {
  if (!("SMS" in attrs)) return attrs;
  return { ...attrs, SMS: normalizePhoneFr(attrs.SMS) };
}

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
  options?: { emailBlacklisted?: boolean },
): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.warn("[email] BREVO_API_KEY manquant — contact non ajouté.");
    return;
  }
  const res = await fetch(BREVO_CONTACTS_API, {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-key": apiKey },
    body: JSON.stringify({
      email,
      attributes: normalizeAttrs(attrs),
      listIds,
      updateEnabled: true,
      ...(options?.emailBlacklisted !== undefined ? { emailBlacklisted: options.emailBlacklisted } : {}),
    }),
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
      attributes: normalizeAttrs(attrs),
      includeListIds: [listId],
      templateId,
      redirectionUrl,
    }),
  });
  if (!res.ok && res.status !== 204) {
    console.warn(`[email] addBrevoContactDOI ${res.status}:`, await res.text());
  }
}
