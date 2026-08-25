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

// Un numéro de téléphone rejeté par Brevo (format invalide ou numéro inexistant, ex:
// "0101010101") fait échouer toute la requête, pas seulement l'attribut SMS — sans ce
// contrôle, un contact ne serait jamais créé (même en blocklist) à cause d'un simple
// numéro de test malformé saisi par l'utilisateur.
function isPhoneRejection(status: number, bodyText: string): boolean {
  return status === 400 && /phone/i.test(bodyText);
}

function withoutSms(
  attrs: Record<string, string | null | undefined>,
): Record<string, string | null | undefined> {
  const rest = { ...attrs };
  delete rest.SMS;
  return rest;
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
  /* ⚠ Ces deux défauts **lèvent**, ils ne se contentent plus d'un `console.warn`
     suivi d'un `return`.

     Motif, constaté en production le 2026-08-25 : une configuration manquante
     sortait d'ici sans erreur, donc sans exception à attraper, donc avec un
     `notified: true` renvoyé par des routes qui n'avaient rien envoyé. Trois
     leads du configurateur sont restés trois jours sans récapitulatif, et le
     triptyque `ok`/`persisted`/`notified` — écrit précisément pour ne pas
     mentir — affirmait le contraire.

     Un chemin qui ne jette pas ne se rattrape pas : tout appelant doit donc
     entourer cet appel d'un `catch` qui bascule son propre `notified`. */
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error("[email] BREVO_API_KEY manquant — email non envoyé.");
  }
  if (!templateId) {
    throw new Error("[email] templateId manquant (0 ou NaN) — email non envoyé.");
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
  const buildBody = (a: Record<string, string | null | undefined>) =>
    JSON.stringify({
      email,
      attributes: normalizeAttrs(a),
      listIds,
      updateEnabled: true,
      ...(options?.emailBlacklisted !== undefined ? { emailBlacklisted: options.emailBlacklisted } : {}),
    });

  const res = await fetch(BREVO_CONTACTS_API, {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-key": apiKey },
    body: buildBody(attrs),
  });
  if (!res.ok && res.status !== 204) {
    const errText = await res.text();
    if (isPhoneRejection(res.status, errText) && "SMS" in attrs) {
      console.warn("[email] addBrevoContact : téléphone rejeté, nouvelle tentative sans SMS.");
      const retry = await fetch(BREVO_CONTACTS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json", "api-key": apiKey },
        body: buildBody(withoutSms(attrs)),
      });
      if (!retry.ok && retry.status !== 204) {
        console.warn(`[email] addBrevoContact (retry) ${retry.status}:`, await retry.text());
      }
      return;
    }
    console.warn(`[email] addBrevoContact ${res.status}:`, errText);
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
  const buildBody = (a: Record<string, string | null | undefined>) =>
    JSON.stringify({
      email,
      attributes: normalizeAttrs(a),
      includeListIds: [listId],
      templateId,
      redirectionUrl,
    });

  const res = await fetch(BREVO_DOI_API, {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-key": apiKey },
    body: buildBody(attrs),
  });
  if (!res.ok && res.status !== 204) {
    const errText = await res.text();
    if (isPhoneRejection(res.status, errText) && "SMS" in attrs) {
      console.warn("[email] addBrevoContactDOI : téléphone rejeté, nouvelle tentative sans SMS.");
      const retry = await fetch(BREVO_DOI_API, {
        method: "POST",
        headers: { "Content-Type": "application/json", "api-key": apiKey },
        body: buildBody(withoutSms(attrs)),
      });
      if (!retry.ok && retry.status !== 204) {
        console.warn(`[email] addBrevoContactDOI (retry) ${retry.status}:`, await retry.text());
      }
      return;
    }
    console.warn(`[email] addBrevoContactDOI ${res.status}:`, errText);
  }
}
