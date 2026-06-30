import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/shared/lib/supabase";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = req.headers.get("authorization")?.replace("Bearer ", "") ?? "";
  const supabase = getSupabaseAdmin();

  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { data: mandataire } = await supabase
    .from("mandataires")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!mandataire) return NextResponse.json({ error: "Mandataire non trouvé" }, { status: 404 });

  // Vérifier que le dossier appartient à ce mandataire
  const { data: dossier } = await supabase
    .from("dossiers")
    .select("id, lead_id, statut")
    .eq("id", id)
    .eq("mandataire_id", mandataire.id)
    .single();

  if (!dossier) return NextResponse.json({ error: "Dossier non trouvé" }, { status: 404 });
  if (dossier.statut !== "proposé") return NextResponse.json({ error: "Dossier déjà accepté" }, { status: 409 });

  const now = new Date().toISOString();

  // Accepter le dossier
  await supabase.from("dossiers")
    .update({ statut: "accepté", accepted_at: now })
    .eq("id", id);

  // Mettre à jour le statut du lead
  await supabase.from("leads")
    .update({ statut: "en_cours" })
    .eq("id", dossier.lead_id);

  return NextResponse.json({ ok: true });
}
