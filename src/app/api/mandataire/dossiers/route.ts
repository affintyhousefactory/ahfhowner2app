import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/shared/lib/supabase";

export async function GET(req: NextRequest) {
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

  const { data: dossiers } = await supabase
    .from("dossiers")
    .select(`
      id, statut, pack_label, pack_prix_ttc, remuneration_mandataire_ht,
      created_at, accepted_at,
      leads (
        id, lead_number, commune, description_projet, produit,
        terrain_mode, pack_terrain, total_estime, delai_projet, statut,
        lead_documents(id)
      )
    `)
    .eq("mandataire_id", mandataire.id)
    .order("created_at", { ascending: false });

  return NextResponse.json(dossiers ?? []);
}
