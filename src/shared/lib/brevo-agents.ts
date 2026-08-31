/**
 * Lecture de la liste Brevo « Agents » — le vivier de prospection (ADR-044 §2).
 *
 * Les 167 contacts ne sont **pas copiés en base**. Brevo reste le fichier ;
 * `agents_immo` ne porte que les agences prises en suivi. Cette fonction fait
 * la soustraction, à la volée.
 *
 * ⚠ **L'API Brevo v3 n'a pas de recherche de contacts** — le paramètre `search`
 * est ignoré, constat déjà porté par `api/admin/leads/recherche/route.ts`
 * (vérifié le 2026-08-27). On charge donc la liste et l'écran filtre ce qu'il a
 * reçu. C'est tenable parce que la liste se compte en centaines ; si elle
 * passait le millier il faudrait un index local, donc une copie — et l'ADR
 * devrait être amendée avant, pas après.
 *
 * ⚠ **Elle vit ici et non dans la route** parce que deux appelants la veulent :
 * la page du vivier, qui la rend côté serveur, et la route d'API, qui sert le
 * rafraîchissement. Importer un handler de route depuis une page marcherait —
 * et serait un piège : la garde d'admin lit les cookies, pas la requête, si
 * bien que la `NextRequest` fabriquée pour l'occasion ne servirait à rien.
 */

import { getSupabaseAdmin } from "@/shared/lib/supabase";
import { signalerPanne } from "@/shared/lib/panne";
import { ATTRIBUTS_BREVO, BREVO_LIST_AGENTS } from "@/lib/agents";

/** Brevo plafonne `limit` à 500. */
const PAGE = 500;
/**
 * Borne du nombre de tours. Sans elle, une réponse inattendue — offset ignoré,
 * page toujours pleine — ferait boucler jusqu'au délai d'exécution. Mieux vaut
 * rendre une liste tronquée **et le dire** que ne rien rendre du tout.
 */
const PAGES_MAX = 10;

export type ContactVivier = {
  brevo_contact_id: number;
  email: string;
  agence: string | null;
  prenom: string | null;
  nom: string | null;
  fonction: string | null;
  tel: string | null;
  tel_fixe: string | null;
  adresse: string | null;
  code_postal: string | null;
  commune: string | null;
  departement: string | null;
  siren: string | null;
  siret: string | null;
  naf: string | null;
  site_web: string | null;
  linkedin: string | null;
  source_contact: string | null;
  url_source: string | null;
  /** Statut de prospection porté par Brevo — la valeur que le CRM recopiera. */
  statut_brevo: string | null;
  /** Désinscrit chez Brevo : suivable, mais on ne pourra jamais lui écrire. */
  desinscrit: boolean;
};

export type Vivier = {
  vivier: ContactVivier[];
  /** Contacts lus dans la liste Brevo, suivis compris. */
  total: number;
  dejaSuivis: number;
  /** La liste n'a pas pu être lue en entier — l'écran doit le dire. */
  tronque: boolean;
  liste: number;
};

type BrevoContact = {
  id: number;
  email: string;
  emailBlacklisted?: boolean;
  attributes?: Record<string, string | number | null>;
};

function texte(v: string | number | null | undefined): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

/**
 * `ATTRIBUTS_BREVO` est écrit dans le sens Brevo → colonne, parce que c'est
 * ainsi qu'on le lit en regardant un contact. Ici c'est le sens inverse qui
 * sert — d'où cette table, construite une fois au chargement du module.
 */
const PAR_COLONNE: Record<string, string> = Object.fromEntries(
  Object.entries(ATTRIBUTS_BREVO).map(([attr, col]) => [col, attr]),
);

export async function lireVivierBrevo(): Promise<Vivier | { error: string }> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    signalerPanne("admin/agents/brevo", "BREVO_API_KEY manquant — vivier non consultable.");
    return { error: "BREVO_API_KEY absente de cet environnement — le vivier ne peut pas être lu." };
  }

  const contacts: BrevoContact[] = [];
  let tronque = false;

  try {
    for (let page = 0; page < PAGES_MAX; page++) {
      const url =
        `https://api.brevo.com/v3/contacts?listIds=${BREVO_LIST_AGENTS}` +
        `&limit=${PAGE}&offset=${page * PAGE}`;
      const res = await fetch(url, { headers: { "api-key": apiKey }, cache: "no-store" });
      if (!res.ok) {
        signalerPanne("admin/agents/brevo", `${res.status}: ${await res.text()}`);
        /* Une page déjà obtenue vaut mieux que rien : échouer en bloc priverait
           le conseiller des 500 premiers contacts pour un incident sur le
           second appel. */
        if (contacts.length === 0) return { error: `Brevo a refusé la requête (${res.status}).` };
        tronque = true;
        break;
      }
      const body = (await res.json()) as { contacts?: BrevoContact[] };
      const lot = body.contacts ?? [];
      contacts.push(...lot);
      if (lot.length < PAGE) break;
      if (page === PAGES_MAX - 1) tronque = true;
    }
  } catch (e) {
    signalerPanne("admin/agents/brevo", e);
    if (contacts.length === 0) return { error: "Brevo est injoignable." };
    tronque = true;
  }

  /* Ce qui est déjà suivi. On ne remonte que les emails : le vivier n'a pas à
     charger la table pour faire une soustraction. */
  const { data: suivis, error } = await getSupabaseAdmin().from("agents_immo").select("email");
  if (error) {
    signalerPanne("admin/agents", error.message);
    /* ⚠ Ne PAS rendre le vivier entier faute de soustraction : le conseiller
       créerait des doublons que l'index unique refuserait un par un, sans
       comprendre pourquoi. Mieux vaut ne rien afficher, et le dire. */
    return { error: `Impossible de savoir quelles agences sont déjà suivies : ${error.message}` };
  }

  const dejaSuivis = new Set(
    (suivis ?? []).map((a) => String((a as { email: string }).email).toLowerCase()),
  );

  const vivier: ContactVivier[] = [];
  for (const c of contacts) {
    const email = (c.email ?? "").toLowerCase();
    if (!email || dejaSuivis.has(email)) continue;
    const a = c.attributes ?? {};
    const attr = (colonne: string) => texte(a[PAR_COLONNE[colonne] ?? colonne.toUpperCase()]);
    vivier.push({
      brevo_contact_id: c.id,
      email,
      agence: attr("agence"),
      prenom: attr("prenom"),
      nom: attr("nom"),
      fonction: attr("fonction"),
      tel: attr("tel"),
      tel_fixe: attr("tel_fixe"),
      adresse: attr("adresse"),
      code_postal: attr("code_postal"),
      commune: attr("commune"),
      departement: attr("departement"),
      siren: attr("siren"),
      siret: attr("siret"),
      naf: attr("naf"),
      site_web: attr("site_web"),
      linkedin: attr("linkedin"),
      source_contact: attr("source_contact"),
      url_source: attr("url_source"),
      statut_brevo: texte(a.STATUT_PROSPECTION),
      desinscrit: c.emailBlacklisted === true,
    });
  }

  return {
    vivier,
    total: contacts.length,
    dejaSuivis: contacts.length - vivier.length,
    tronque,
    liste: BREVO_LIST_AGENTS,
  };
}
