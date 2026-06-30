import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/shared/lib/supabase";
import { sendBrevoTemplate } from "@/shared/lib/email";
import { getSiteUrl } from "@/shared/lib/site-url";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { mandataire_id } = (await req.json()) as { mandataire_id: string };

  if (!mandataire_id) return NextResponse.json({ error: "mandataire_id requis" }, { status: 400 });

  const supabase = getSupabaseAdmin();

  const [{ data: mandataire }, { data: lead }] = await Promise.all([
    supabase.from("mandataires").select("prenom, nom, email").eq("id", mandataire_id).single(),
    supabase.from("leads").select("prenom, nom, commune, pack_terrain, produit, lead_number").eq("id", id).single(),
  ]);

  // 1. Mise à jour du lead
  const { error: leadErr } = await supabase
    .from("leads")
    .update({ mandataire_id, affecte_at: new Date().toISOString(), statut: "affecté" })
    .eq("id", id);
  if (leadErr) return NextResponse.json({ error: leadErr.message }, { status: 500 });

  // 2. Upsert du dossier (crée ou remet à "proposé" si déjà existant)
  const now = new Date().toISOString();
  await supabase.from("dossiers").upsert(
    {
      lead_id:        id,
      mandataire_id,
      statut:         "proposé",
      accepted_at:    null,
      email_sent_at:  now,
      created_at:     now,
    },
    { onConflict: "lead_id,mandataire_id", ignoreDuplicates: false },
  );

  // 3. Email mandataire — fire-and-forget
  const templateId = parseInt(process.env.BREVO_TEMPLATE_AFFECTATION ?? "0");
  if (mandataire?.email && templateId) {
    sendBrevoTemplate({
      templateId,
      to: [{ email: mandataire.email, name: `${mandataire.prenom} ${mandataire.nom}` }],
      params: {
        MANDATAIRE_PRENOM: mandataire.prenom ?? "",
        LEAD_NUMBER:       `#${lead?.lead_number ?? ""}`,
        LEAD_COMMUNE:      lead?.commune ?? "",
        LEAD_PACK:         lead?.pack_terrain ?? lead?.produit ?? "",
        PORTAL_URL:        `${getSiteUrl(req)}/mandataire/dossiers`,
      },
    }).catch(console.error);
  }

  return NextResponse.json({ ok: true });
}
