/**
 * Envoi de la présentation partenaire — ADR-044 §3.
 *
 * ⚠ **Cet email promet une commission d'apporteur d'affaires** (« vous touchez
 * la commission », « un contrat d'apporteur formalisé »). Verser une commission
 * à un agent immobilier titulaire d'une carte professionnelle engage la loi
 * Hoguet et l'information de son propre client — alerte ouverte à l'ADR, non
 * tranchée. La route existe ; le jugement sur l'opportunité d'envoyer reste
 * humain, et c'est pour cela que l'aperçu est un passage obligé côté écran.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/shared/lib/supabase";
import { refuserSiPasAdmin } from "@/shared/lib/supabase-server";
import { sendBrevoTemplate } from "@/shared/lib/email";
import { signalerPanne } from "@/shared/lib/panne";
import {
  SELECT_PRESENTATION,
  construireParamsPresentation,
  templatePresentation,
  type AgentPresentation,
} from "@/shared/lib/presentation-agence";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const refus = await refuserSiPasAdmin();
  if (refus) return refus;

  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data: agent } = await supabase
    .from("agents_immo")
    .select(SELECT_PRESENTATION)
    .eq("id", id)
    .single<AgentPresentation>();

  if (!agent?.email) {
    return NextResponse.json({ error: "Agence introuvable ou sans email" }, { status: 404 });
  }

  /* Une agence qu'on a marquée « Ne pas recontacter » est désinscrite chez
     Brevo, qui refusera l'envoi — mais silencieusement, du point de vue de
     l'écran. Le refus explicite ici dit pourquoi, plutôt que de laisser croire
     à un envoi réussi. */
  if (agent.statut_partenariat === "ne_pas_contacter") {
    return NextResponse.json(
      { error: "Cette agence est en « Ne pas recontacter » — envoi refusé." },
      { status: 409 },
    );
  }

  const modele = templatePresentation();
  if (!modele.id) {
    return NextResponse.json({ error: `${modele.variable} non défini` }, { status: 500 });
  }

  try {
    await sendBrevoTemplate({
      templateId: modele.id,
      to: [
        {
          email: agent.email,
          name: `${agent.prenom ?? ""} ${agent.nom ?? ""}`.trim() || agent.agence,
        },
      ],
      params: construireParamsPresentation(agent),
    });
  } catch (err) {
    signalerPanne("admin/agents/brevo", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erreur envoi email" },
      { status: 500 },
    );
  }

  /* Horodaté **après** l'envoi, jamais avant : un `dernier_email_at` écrit
     d'abord aurait affirmé qu'un email est parti alors que Brevo venait de
     refuser — la faute exacte du 2026-08-25. L'échec de cette écriture n'annule
     pas l'envoi : l'email est parti, on le dit, et le rafraîchissement global
     rattrapera la colonne.

     ⚠ `dernier_email_etat` est posé à `requests` et non à `delivered` : à cet
     instant Brevo a accepté le message, il ne l'a pas encore remis. Écrire
     « Délivré » ici serait affirmer ce qu'on ignore. */
  const { error: majErr } = await supabase
    .from("agents_immo")
    .update({
      dernier_email_at: new Date().toISOString(),
      dernier_email_sujet: "Présentation partenaire",
      dernier_email_etat: "requests",
      dernier_email_sync_at: new Date().toISOString(),
    })
    .eq("id", id);

  return NextResponse.json({ ok: true, horodate: !majErr, templateId: modele.id });
}
