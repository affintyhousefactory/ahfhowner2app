import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/shared/lib/supabase";
import { sendBrevoTemplate } from "@/shared/lib/email";
import { refuserSiPasAdmin } from "@/shared/lib/supabase-server";
import { compterNumerosLibres } from "@/shared/lib/numeros-serie";
import {
  choisirEmailRecap,
  construireParamsRecap,
  SELECT_RECAP,
  type ContexteRecap,
  type LeadRecap,
} from "@/shared/lib/recap-client";

/* ⚠ Les identifiants de template se lisent dans la fonction : au niveau du
   module, ils arrivaient vides en production (constat du 2026-08-25). Ici le
   défaut se voyait — la route renvoie un 500 explicite — mais la cause était la
   même. `choisirEmailRecap()` lit à l'appel, jamais à l'import.

   ⚠ Les paramètres ne sont pas fabriqués ici : `construireParamsRecap()` est la
   seule source, partagée avec la route d'aperçu. Deux constructions pour un même
   email, c'est un écran qui finit par montrer autre chose que ce qui part — et
   il montrerait des prix. Le **choix du modèle** obéit à la même règle, par
   `choisirEmailRecap()`. */

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const refus = await refuserSiPasAdmin();
  if (refus) return refus;

  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data: lead } = await supabase
    .from("leads")
    .select(SELECT_RECAP)
    .eq("id", id)
    .single<LeadRecap>();

  if (!lead?.email) {
    return NextResponse.json({ error: "Lead introuvable ou sans email" }, { status: 404 });
  }

  /* Le modèle dépend du lead, pas de la route : récapitulatif chiffré quand la
     configuration est arrêtée, présentation du secteur du prospect sinon. */
  const email = choisirEmailRecap(lead);
  if (!email.id) {
    return NextResponse.json({ error: `${email.variable} non défini` }, { status: 500 });
  }

  /* ⚠ La présentation « investisseur » annonce combien de numéros restent. Une
     base muette donnerait « il reste  numéros » — ou pire, un zéro inventé qui
     déclarerait la série épuisée. On refuse d'envoyer plutôt que de se tromper
     sur la rareté : elle est un argument de vente, pas un remplissage. */
  const contexte: ContexteRecap = {};
  if (email.annonceNumerosRestants) {
    contexte.numerosLibres = await compterNumerosLibres();
    if (contexte.numerosLibres === null) {
      return NextResponse.json(
        { error: "Numéros disponibles introuvables — envoi refusé plutôt qu'un compte faux" },
        { status: 503 },
      );
    }
  }

  try {
    await sendBrevoTemplate({
      templateId: email.id,
      to: [{ email: lead.email, name: `${lead.prenom ?? ""} ${lead.nom ?? ""}`.trim() }],
      params: construireParamsRecap(lead, contexte),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erreur envoi email" },
      { status: 500 },
    );
  }

  /* La date d'envoi est posée après coup, jamais avant : un `recap_envoye_at`
     écrit d'abord aurait affirmé qu'un email est parti alors que Brevo venait
     de refuser — c'est la faute exacte qui a laissé croire pendant trois jours
     que les récapitulatifs partaient (2026-08-25). L'échec de cette écriture
     n'annule pas l'envoi : l'email est parti, on le dit. */
  const { error: majErr } = await supabase
    .from("leads")
    .update({ recap_envoye_at: new Date().toISOString() })
    .eq("id", id);

  return NextResponse.json({ ok: true, horodate: !majErr, modele: email.libelle });
}
