import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/shared/lib/supabase";
// ADR-028 — domaine « Mandataire & Terrain » suspendu : 404 tant que le flag est off.
import { mandataireDisabled } from "@/shared/lib/feature-guard";

export async function GET() {
  const off = mandataireDisabled();
  if (off) return off;

  const { data, error } = await getSupabaseAdmin()
    .from("fiches_terrain")
    .select("id, titre, commune, secteur, prix, surface, zonage, compatibilite_arko, modele_arko, photos, description_publique, publie_at, contact_nom, contact_prenom, contact_telephone, contact_role, contact_role_detail")
    .eq("statut_admin", "publie")
    .order("publie_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
