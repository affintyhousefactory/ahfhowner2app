/**
 * Aperçu de la présentation partenaire — ce que l'agence verra, avant l'envoi.
 *
 * Le template est lu **chez Brevo**, pas dans le dépôt : c'est Brevo qui
 * enverra, donc son template fait foi. Une copie locale se serait désynchronisée
 * à la première retouche faite dans l'éditeur.
 *
 * Les valeurs, elles, viennent de `construireParamsPresentation()` — la même
 * fonction que l'envoi. L'aperçu peut différer sur la mise en forme ; jamais sur
 * ce qui est promis.
 *
 * ⚠ Le HTML rendu part en `text/html` à un administrateur déjà authentifié, et
 * marqué `no-store`.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/shared/lib/supabase";
import { refuserSiPasAdmin } from "@/shared/lib/supabase-server";
import { rendreTemplateBrevo } from "@/shared/lib/brevo-render";
import {
  SELECT_PRESENTATION,
  construireParamsPresentation,
  templatePresentation,
  type AgentPresentation,
} from "@/shared/lib/presentation-agence";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const refus = await refuserSiPasAdmin();
  if (refus) return refus;

  const { id } = await params;
  const meta = req.nextUrl.searchParams.get("meta") === "1";

  const { data: agent } = await getSupabaseAdmin()
    .from("agents_immo")
    .select(SELECT_PRESENTATION)
    .eq("id", id)
    .single<AgentPresentation>();

  if (!agent?.email) {
    return NextResponse.json({ error: "Agence introuvable ou sans email" }, { status: 404 });
  }

  const modele = templatePresentation();

  /* Ce que l'écran doit dire *avant* d'ouvrir l'aperçu : quel modèle partira,
     et ce qui manque pour qu'il parte. Le conseiller ne doit pas découvrir une
     variable absente au moment où il clique « Envoyer ». */
  if (meta) {
    return NextResponse.json({
      templateId: modele.id || null,
      variable: modele.variable,
      pret: Boolean(modele.id) && agent.statut_partenariat !== "ne_pas_contacter",
      bloquant:
        !modele.id
          ? `${modele.variable} n'est pas définie sur cet environnement — aucun envoi possible.`
          : agent.statut_partenariat === "ne_pas_contacter"
            ? "Agence en « Ne pas recontacter » — envoi refusé."
            : null,
      destinataire: agent.email,
      dejaEnvoyeLe: agent.dernier_email_at,
    });
  }

  if (!modele.id) {
    return NextResponse.json({ error: `${modele.variable} non défini` }, { status: 500 });
  }

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "BREVO_API_KEY non défini" }, { status: 500 });

  const res = await fetch(`https://api.brevo.com/v3/smtp/templates/${modele.id}`, {
    headers: { "api-key": apiKey },
    cache: "no-store",
  });
  if (!res.ok) {
    return NextResponse.json(
      { error: `Template ${modele.id} illisible chez Brevo (${res.status}).` },
      { status: 502 },
    );
  }

  const tpl = (await res.json()) as { htmlContent?: string; subject?: string };
  const html = rendreTemplateBrevo(tpl.htmlContent ?? "", construireParamsPresentation(agent));

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}
