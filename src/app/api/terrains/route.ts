import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/shared/lib/supabase";

export async function GET() {
  const { data, error } = await getSupabaseAdmin()
    .from("fiches_terrain")
    .select("id, titre, commune, secteur, prix, surface, zonage, compatibilite_arko, modele_arko, photos, description_publique, publie_at")
    .eq("statut_admin", "publie")
    .order("publie_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
