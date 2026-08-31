import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/shared/lib/supabase";
import { refuserSiPasAdmin } from "@/shared/lib/supabase-server";

/**
 * Recherche d'identité pour la pré-qualification — « je l'ai déjà, ce contact ? »
 *
 * Le conseiller tape trois lettres pendant que ça sonne. Deux gains, et le
 * second est le vrai :
 *
 *   1. il ne ressaisit pas une identité déjà connue ;
 *   2. **il ne crée pas un lead qui existe déjà.** La table en comptait 6 pour
 *      5 adresses distinctes au moment d'écrire ceci — le doublon n'est pas une
 *      hypothèse.
 *
 * ⚠ **Trois sources, dans cet ordre d'utilité.**
 *
 * `leads` d'abord : c'est là qu'un doublon fait mal, et c'est la seule source
 * qui porte un dossier complet.
 *
 * `contacts` ensuite : les formulaires du site, avec le message envoyé.
 *
 * Brevo **en dernier et seulement sur une adresse exacte** : son API v3 n'a pas
 * de recherche — le paramètre `search` est ignoré, vérifié le 2026-08-27 — et
 * `GET /v3/contacts/{email}` est le seul accès. Elle ne rend d'ailleurs que
 * `PRENOM`, `NOM`, `SMS` : strictement moins que la base. Elle sert au cas où un
 * contact est venu par la newsletter sans jamais passer par un formulaire.
 */

const LIMITE = 6;

export type Correspondance = {
  origine: "lead" | "contact" | "brevo";
  /** Présent pour un lead : permet d'ouvrir la fiche existante. */
  id?: string;
  leadNumber?: number | null;
  prenom: string | null;
  nom: string | null;
  email: string | null;
  tel: string | null;
  /** Ce qui aide à reconnaître la bonne personne d'un coup d'œil. */
  detail?: string | null;
};

/**
 * Motifs tolérants pour un numéro de téléphone.
 *
 * Deux problèmes se cumulent, et le second est le plus coûteux.
 *
 * **Les séparateurs.** Un numéro est saisi « 06 12 34 56 78 », « 06.12.34.56.78 »
 * ou d'une traite, et le conseiller lit celui qui s'affiche sur son écran, pas
 * celui qui a été enregistré. On intercale donc `%` entre les chiffres : `0612`
 * devient `%0%6%1%2%`, qui retrouve les trois écritures.
 *
 * **L'indicatif.** Les formulaires publics passent par `react-phone-number-input`,
 * qui produit du E.164 : le même numéro y est stocké `+33612345678`, où le zéro
 * initial a disparu. Un motif construit sur `0612` ne le trouve pas. Ce n'est pas
 * un cas marginal — au 2026-08-27, **7 numéros sur 13** en base sont dans cette
 * forme. On produit donc les deux variantes et on les cherche ensemble.
 *
 * En deçà de quatre chiffres on ne cherche pas par numéro : le motif ramènerait
 * la table entière.
 */
function motifsTelephone(q: string): string[] {
  const chiffres = q.replace(/\D/g, "");
  if (chiffres.length < 4) return [];

  const enMotif = (n: string) => `%${n.split("").join("%")}%`;
  const motifs = [enMotif(chiffres)];

  /* Tapé « 06… », stocké « +336… ». */
  if (chiffres.startsWith("0")) motifs.push(enMotif(`33${chiffres.slice(1)}`));
  /* Tapé « +336… » ou « 336… », stocké « 06… ». */
  if (chiffres.startsWith("33")) motifs.push(enMotif(`0${chiffres.slice(2)}`));

  return motifs;
}

export async function GET(req: NextRequest) {
  const refus = await refuserSiPasAdmin();
  if (refus) return refus;

  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  /* Deux caractères ne discriminent rien et rendraient toute la table. */
  if (q.length < 3) return NextResponse.json({ correspondances: [] });

  const supabase = getSupabaseAdmin();
  const motif = `%${q}%`;

  const champs = ["prenom", "nom", "email"].map((c) => `${c}.ilike.${motif}`);
  for (const m of motifsTelephone(q)) champs.push(`tel.ilike.${m}`);
  const filtre = champs.join(",");

  const [resLeads, resContacts] = await Promise.all([
    supabase
      .from("leads")
      .select("id, lead_number, prenom, nom, email, tel, created_at, statut_commercial")
      .or(filtre)
      .order("created_at", { ascending: false })
      .limit(LIMITE),
    supabase
      .from("contacts")
      .select("prenom, nom, email, tel, created_at, message")
      .or(filtre)
      .order("created_at", { ascending: false })
      .limit(LIMITE),
  ]);

  const correspondances: Correspondance[] = [];

  for (const l of resLeads.data ?? []) {
    correspondances.push({
      origine: "lead",
      id: l.id,
      leadNumber: l.lead_number,
      prenom: l.prenom,
      nom: l.nom,
      email: l.email,
      tel: l.tel,
      detail: `fiche du ${new Date(l.created_at).toLocaleDateString("fr-FR")}`,
    });
  }

  /* Un contact dont l'adresse porte déjà un lead n'apporte rien : c'est le même
     prospect, et sa fiche est plus complète. Le taire évite de faire choisir le
     conseiller entre deux lignes qui désignent la même personne. */
  const emailsLeads = new Set(
    (resLeads.data ?? []).map((l) => (l.email ?? "").toLowerCase()).filter(Boolean),
  );

  for (const c of resContacts.data ?? []) {
    if (emailsLeads.has((c.email ?? "").toLowerCase())) continue;
    correspondances.push({
      origine: "contact",
      prenom: c.prenom,
      nom: c.nom,
      email: c.email,
      tel: c.tel,
      detail: `message du ${new Date(c.created_at).toLocaleDateString("fr-FR")}`,
    });
  }

  /* Brevo n'est interrogé que sur une adresse complète, et seulement si rien n'a
     été trouvé en local — la base porte tout ce que Brevo porte, et davantage. */
  if (correspondances.length === 0 && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(q)) {
    const apiKey = process.env.BREVO_API_KEY;
    if (apiKey) {
      try {
        const res = await fetch(
          `https://api.brevo.com/v3/contacts/${encodeURIComponent(q)}`,
          { headers: { "api-key": apiKey }, cache: "no-store" },
        );
        if (res.ok) {
          const c = (await res.json()) as {
            email?: string;
            attributes?: Record<string, string>;
            listIds?: number[];
          };
          const a = c.attributes ?? {};
          correspondances.push({
            origine: "brevo",
            prenom: a.PRENOM ?? null,
            nom: a.NOM ?? null,
            email: c.email ?? q,
            tel: a.SMS ?? null,
            detail: c.listIds?.length ? `listes Brevo ${c.listIds.join(", ")}` : "contact Brevo",
          });
        }
        /* Un 404 est une réponse, pas une panne : le contact n'existe pas. */
      } catch {
        /* Brevo indisponible ne doit pas empêcher la recherche locale d'avoir
           servi. On rend ce qu'on a. */
      }
    }
  }

  return NextResponse.json({ correspondances });
}
