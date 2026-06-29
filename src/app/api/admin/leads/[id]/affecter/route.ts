import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/shared/lib/supabase";
import { sendBrevoTemplate } from "@/shared/lib/email";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { mandataire_id } = await req.json() as { mandataire_id: string };

  if (!mandataire_id) return NextResponse.json({ error: "mandataire_id requis" }, { status: 400 });

  const supabase = getSupabaseAdmin();

  const [{ data: mandataire }, { data: lead }] = await Promise.all([
    supabase.from("mandataires").select("prenom, nom, email").eq("id", mandataire_id).single(),
    supabase.from("leads").select("prenom, nom, commune, pack_terrain, produit").eq("id", id).single(),
  ]);

  const { error } = await supabase
    .from("leads")
    .update({ mandataire_id, affecte_at: new Date().toISOString(), statut: "affecté" })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Email mandataire — fire-and-forget
  const templateId = parseInt(process.env.BREVO_TEMPLATE_AFFECTATION ?? "0");
  if (mandataire?.email && templateId) {
    sendBrevoTemplate({
      templateId,
      to: [{ email: mandataire.email, name: `${mandataire.prenom} ${mandataire.nom}` }],
      params: {
        MANDATAIRE_PRENOM: mandataire.prenom ?? "",
        LEAD_PRENOM: lead?.prenom ?? "",
        LEAD_NOM: lead?.nom ?? "",
        LEAD_COMMUNE: lead?.commune ?? "",
        LEAD_PACK: lead?.pack_terrain ?? lead?.produit ?? "",
      },
    }).catch(console.error);
  }

  return NextResponse.json({ ok: true });
}
