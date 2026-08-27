import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/shared/lib/supabase";
import { sendBrevoTemplate } from "@/shared/lib/email";
import { refuserSiPasAdmin } from "@/shared/lib/supabase-server";
import {
  construireParamsRecap,
  SELECT_RECAP,
  templateRecap,
  type LeadRecap,
} from "@/shared/lib/recap-client";

/* ⚠ `BREVO_TEMPLATE_RECAP` se lit dans la fonction : au niveau du module, elle
   arrivait vide en production (constat du 2026-08-25). Ici le défaut se voyait
   — la route renvoie un 500 explicite — mais la cause était la même.

   ⚠ Les paramètres ne sont plus fabriqués ici : `construireParamsRecap()` est
   la seule source, partagée avec la route d'aperçu. Deux constructions pour un
   même email, c'est un écran qui finit par montrer autre chose que ce qui part
   — et il montrerait des prix. */

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

  /* Le template dépend du lead, pas de la route : présentation quand la
     qualification n'a pas tranché, récapitulatif chiffré sinon. */
  const templateId = templateRecap(lead);
  if (!templateId) {
    const manquante = lead.multi_configuration ? "BREVO_TEMPLATE_MULTICFG" : "BREVO_TEMPLATE_RECAP";
    return NextResponse.json({ error: `${manquante} non défini` }, { status: 500 });
  }

  try {
    await sendBrevoTemplate({
      templateId,
      to: [{ email: lead.email, name: `${lead.prenom ?? ""} ${lead.nom ?? ""}`.trim() }],
      params: construireParamsRecap(lead),
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

  return NextResponse.json({ ok: true, horodate: !majErr });
}
