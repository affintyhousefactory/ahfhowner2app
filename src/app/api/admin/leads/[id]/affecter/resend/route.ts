import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/shared/lib/supabase";
import { sendBrevoTemplate } from "@/shared/lib/email";
import { getSiteUrl } from "@/shared/lib/site-url";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data: lead } = await supabase
    .from("leads")
    .select("mandataire_id, commune, pack_terrain, produit, lead_number")
    .eq("id", id)
    .single();

  if (!lead?.mandataire_id) {
    return NextResponse.json({ error: "Lead non affecté" }, { status: 400 });
  }

  const { data: mandataire } = await supabase
    .from("mandataires")
    .select("prenom, nom, email")
    .eq("id", lead.mandataire_id)
    .single();

  // Mettre à jour email_sent_at sur le dossier
  await supabase
    .from("dossiers")
    .update({ email_sent_at: new Date().toISOString() })
    .eq("lead_id", id)
    .eq("mandataire_id", lead.mandataire_id);

  const templateId = parseInt(process.env.BREVO_TEMPLATE_AFFECTATION ?? "0");
  if (mandataire?.email && templateId) {
    await sendBrevoTemplate({
      templateId,
      to: [{ email: mandataire.email, name: `${mandataire.prenom} ${mandataire.nom}` }],
      params: {
        MANDATAIRE_PRENOM: mandataire.prenom ?? "",
        LEAD_NUMBER:       `#${lead.lead_number ?? ""}`,
        LEAD_COMMUNE:      lead.commune ?? "",
        LEAD_PACK:         lead.pack_terrain ?? lead.produit ?? "",
        PORTAL_URL:        `${getSiteUrl(req)}/mandataire/dossiers`,
      },
    });
  }

  return NextResponse.json({ ok: true });
}
