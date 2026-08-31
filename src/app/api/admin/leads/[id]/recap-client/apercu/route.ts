import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/shared/lib/supabase";
import { refuserSiPasAdmin } from "@/shared/lib/supabase-server";
import { rendreTemplateBrevo } from "@/shared/lib/brevo-render";
import { compterNumerosLibres } from "@/shared/lib/numeros-serie";
import {
  choisirEmailRecap,
  construireParamsRecap,
  SELECT_RECAP,
  type ContexteRecap,
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
 * **Deux réponses, une seule décision.** `?meta=1` renvoie en JSON ce que l'écran
 * doit dire *avant* d'ouvrir l'aperçu : quel modèle partira, quel objet il
 * portera, et ce qui manque pour qu'il soit juste. Sept modèles sont désormais
 * possibles — le conseiller ne peut plus les deviner, et l'objet des présentations
 * sectorielles s'ouvre sur la raison sociale, qu'aucun rendu HTML ne montre.
 *
 * ⚠ Le HTML rendu contient les données d'un lead réel. Il est renvoyé en
 * `text/html` à un administrateur déjà authentifié (`refuserSiPasAdmin`), et
 * marqué `no-store` : un aperçu de devis n'a rien à faire dans un cache.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const refus = await refuserSiPasAdmin();
  if (refus) return refus;

  const { id } = await params;
  const meta = req.nextUrl.searchParams.get("meta") === "1";

  const { data: lead } = await getSupabaseAdmin()
    .from("leads")
    .select(SELECT_RECAP)
    .eq("id", id)
    .single<LeadRecap>();

  if (!lead?.email) {
    return NextResponse.json({ error: "Lead introuvable ou sans email" }, { status: 404 });
  }

  /* ⚠ Le **même** choix de modèle que l'envoi, par la même fonction. Un aperçu
     qui montrerait le récapitulatif chiffré pendant que l'envoi expédie la
     présentation serait pire que pas d'aperçu du tout. */
  const email = choisirEmailRecap(lead);
  const apiKey = process.env.BREVO_API_KEY;

  /* Ce qui empêchera l'envoi, dit avant le clic plutôt qu'en 500 après.
     ⚠ Distinguer ce qui bloque de ce qui abîme : une variable absente arrête
     tout ; une raison sociale manquante laisse partir un objet qui commence par
     « Votre établissement », ce qui se corrige mais ne se rattrape pas. */
  const bloquants: string[] = [];
  const avertissements: string[] = [];

  if (!email.id) bloquants.push(`${email.variable} non défini sur ce scope Vercel`);
  if (!apiKey) bloquants.push("BREVO_API_KEY non défini");
  if (email.objetPorteRaisonSociale && !lead.raison_sociale?.trim()) {
    avertissements.push(
      "Raison sociale absente — l'objet de cet email s'ouvre dessus, il dira « Votre établissement ».",
    );
  }

  const contexte: ContexteRecap = {};
  if (email.annonceNumerosRestants) {
    contexte.numerosLibres = await compterNumerosLibres();
    if (contexte.numerosLibres === null) {
      bloquants.push("Numéros encore disponibles introuvables — cet email les annonce");
    }
  }

  if (bloquants.length) {
    const erreur = bloquants.join(" · ");
    return meta
      ? NextResponse.json(
          { modele: email.libelle, template: email.id || null, bloquants, avertissements },
          { status: 200, headers: { "Cache-Control": "no-store" } },
        )
      : NextResponse.json({ error: erreur }, { status: 500 });
  }

  const res = await fetch(`https://api.brevo.com/v3/smtp/templates/${email.id}`, {
    headers: { "api-key": apiKey as string },
    cache: "no-store",
  });
  if (!res.ok) {
    const erreur = `Brevo ${res.status} — template ${email.id} illisible`;
    return meta
      ? NextResponse.json(
          { modele: email.libelle, template: email.id, bloquants: [erreur], avertissements },
          { status: 200, headers: { "Cache-Control": "no-store" } },
        )
      : NextResponse.json({ error: erreur }, { status: 502 });
  }

  const tpl = (await res.json()) as { htmlContent?: string; subject?: string };
  const params_ = construireParamsRecap(lead, contexte);

  if (meta) {
    return NextResponse.json(
      {
        modele: email.libelle,
        template: email.id,
        /* L'objet porte lui aussi des `{{ params.X }}` — le rendre ici est le
           seul endroit d'où le conseiller peut le lire avant l'envoi. */
        objet: rendreTemplateBrevo(tpl.subject ?? "", params_),
        destinataire: lead.email,
        bloquants,
        avertissements,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  if (!tpl.htmlContent) {
    return NextResponse.json({ error: "Template sans contenu HTML" }, { status: 502 });
  }

  const html = rendreTemplateBrevo(tpl.htmlContent, params_);

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      /* L'aperçu s'affiche dans une iframe du back-office et nulle part ailleurs. */
      "X-Frame-Options": "SAMEORIGIN",
    },
  });
}
