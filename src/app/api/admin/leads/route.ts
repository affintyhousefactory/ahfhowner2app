import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/shared/lib/supabase";

export async function POST(req: NextRequest) {
  const body = await req.json() as Record<string, string>;
  const { prenom, nom, email, tel, produit, pack_terrain, adresse_recherche, commune, code_postal, departement, notes_ahf } = body;

  if (!prenom || !nom || !email) {
    return NextResponse.json({ error: "Champs requis : prénom, nom, email" }, { status: 400 });
  }

  const { data, error } = await getSupabaseAdmin()
    .from("leads")
    .insert({
      prenom,
      nom,
      email,
      tel: tel || null,
      produit: produit || null,
      pack_terrain: pack_terrain || null,
      adresse_recherche: adresse_recherche || null,
      commune: commune || null,
      code_postal: code_postal || null,
      departement: departement || null,
      notes_ahf: notes_ahf || null,
      source: "admin",
      statut: "nouveau",
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
