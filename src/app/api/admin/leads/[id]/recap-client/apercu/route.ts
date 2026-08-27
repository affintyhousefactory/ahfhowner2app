import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/shared/lib/supabase";
import { refuserSiPasAdmin } from "@/shared/lib/supabase-server";
import { rendreTemplateBrevo } from "@/shared/lib/brevo-render";
import {
  construireParamsRecap,
  SELECT_RECAP,
  templateRecap,
  type LeadRecap,
} from "@/shared/lib/recap-client";

/**
 * Aperçu du récapitulatif — ce que le client verra, avant de cliquer « Envoyer ».
 *
 * Le template est lu **chez Brevo**, pas dans le repo : c'est Brevo qui enverra,
 * donc c'est son template qui fait foi. Une copie locale se serait désynchronisée
 * dès la première retouche faite dans l'éditeur — et le 2026-08-26 en donne
 * l'exemple, deux liens de pied de page ayant été corrigés à la main.
 *
 * Les valeurs, elles, viennent de `construireParamsRecap()`, la même fonction que
 * l'envoi. L'aperçu peut différer sur la mise en forme ; jamais sur les montants.
 *
 * ⚠ Le HTML rendu contient les données d'un lead réel. Il est renvoyé en
 * `text/html` à un administrateur déjà authentifié (`refuserSiPasAdmin`), et
 * marqué `no-store` : un aperçu de devis n'a rien à faire dans un cache.
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const refus = await refuserSiPasAdmin();
  if (refus) return refus;

  const { id } = await params;

  const { data: lead } = await getSupabaseAdmin()
    .from("leads")
    .select(SELECT_RECAP)
    .eq("id", id)
    .single<LeadRecap>();

  if (!lead?.email) {
    return NextResponse.json({ error: "Lead introuvable ou sans email" }, { status: 404 });
  }

  /* ⚠ Le **même** choix de template que l'envoi, par la même fonction. Un aperçu
     qui montrerait le récapitulatif chiffré pendant que l'envoi expédie la
     présentation serait pire que pas d'aperçu du tout. */
  const templateId = templateRecap(lead);
  const apiKey = process.env.BREVO_API_KEY;
  if (!templateId || !apiKey) {
    const manquante = lead.multi_configuration ? "BREVO_TEMPLATE_MULTICFG" : "BREVO_TEMPLATE_RECAP";
    return NextResponse.json(
      { error: `${manquante} ou BREVO_API_KEY non défini` },
      { status: 500 },
    );
  }

  const res = await fetch(`https://api.brevo.com/v3/smtp/templates/${templateId}`, {
    headers: { "api-key": apiKey },
    cache: "no-store",
  });
  if (!res.ok) {
    return NextResponse.json(
      { error: `Brevo ${res.status} — template ${templateId} illisible` },
      { status: 502 },
    );
  }

  const tpl = (await res.json()) as { htmlContent?: string; subject?: string };
  if (!tpl.htmlContent) {
    return NextResponse.json({ error: "Template sans contenu HTML" }, { status: 502 });
  }

  const html = rendreTemplateBrevo(tpl.htmlContent, construireParamsRecap(lead));

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      /* L'aperçu s'affiche dans une iframe du back-office et nulle part ailleurs. */
      "X-Frame-Options": "SAMEORIGIN",
    },
  });
}
