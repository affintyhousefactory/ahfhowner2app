import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/shared/lib/supabase";
import { sendBrevoTemplate } from "@/shared/lib/email";
import { getSiteUrl } from "@/shared/lib/site-url";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data: lead } = await supabase
    .from("leads")
    .select("prenom, nom, commune, pack_terrain, produit, lead_number, description_projet, mandataire_id")
    .eq("id", id)
    .single();

  if (!lead?.mandataire_id) {
    return NextResponse.json({ error: "Aucun mandataire affecté" }, { status: 400 });
  }

  const [{ data: mandataire }, { data: dossier }] = await Promise.all([
    supabase.from("mandataires").select("prenom, nom, email").eq("id", lead.mandataire_id).single(),
    supabase.from("dossiers").select("id").eq("lead_id", id).single(),
  ]);

  if (!mandataire?.email) {
    return NextResponse.json({ error: "Mandataire introuvable ou sans email" }, { status: 404 });
  }

  const templateId = parseInt(process.env.BREVO_TEMPLATE_AFFECTATION ?? "0");
  if (!templateId) {
    return NextResponse.json({ error: "BREVO_TEMPLATE_AFFECTATION non défini" }, { status: 500 });
  }

  const portalUrl = dossier?.id
    ? `${getSiteUrl(req)}/mandataire/dossiers/${dossier.id}`
    : `${getSiteUrl(req)}/mandataire/dossiers`;

  try {
    await sendBrevoTemplate({
      templateId,
      to: [{ email: mandataire.email, name: `${mandataire.prenom} ${mandataire.nom}` }],
      params: {
        MANDATAIRE_PRENOM: mandataire.prenom ?? "",
        LEAD_NUMBER:       `#${lead.lead_number ?? ""}`,
        LEAD_COMMUNE:      lead.commune ?? "",
        LEAD_PACK:         lead.pack_terrain ?? lead.produit ?? "",
        LEAD_DESCRIPTION:  lead.description_projet ?? "",
        LEAD_PRODUIT:      lead.produit ?? "",
        PORTAL_URL:        portalUrl,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erreur envoi email" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
