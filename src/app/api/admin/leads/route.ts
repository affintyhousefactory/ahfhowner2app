import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/shared/lib/supabase";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Record<string, unknown>;

  const { prenom, nom, email } = body as { prenom?: string; nom?: string; email?: string };
  if (!prenom || !nom || !email) {
    return NextResponse.json({ error: "Champs requis : prénom, nom, email" }, { status: 400 });
  }

  const { data, error } = await getSupabaseAdmin()
    .from("leads")
    .insert({
      prenom,
      nom,
      email,
      tel: (body.tel as string) || null,
      produit: (body.produit as string) || null,
      pack_terrain: (body.pack_terrain as string) || null,
      terrain_mode: (body.terrain_mode as string) || null,
      adresse_recherche: (body.adresse_recherche as string) || null,
      commune: (body.commune as string) || null,
      code_postal: (body.code_postal as string) || null,
      departement: (body.departement as string) || null,
      config_json: body.config_json ?? null,
      options_labels: (body.options_labels as string[]) ?? [],
      // PLU
      plu_consent: (body.plu_consent as boolean) ?? false,
      plu_adresse: (body.plu_adresse as string) || null,
      plu_zone: (body.plu_zone as string) || null,
      plu_libelong: (body.plu_libelong as string) || null,
      plu_typezone: (body.plu_typezone as string) || null,
      plu_typedoc: (body.plu_typedoc as string) || null,
      plu_etat_doc: (body.plu_etat_doc as string) || null,
      plu_datappro: (body.plu_datappro as string) || null,
      plu_prescriptions: (body.plu_prescriptions as string[]) ?? [],
      plu_servitudes: (body.plu_servitudes as string[]) ?? [],
      plu_lon: (body.plu_lon as number) || null,
      plu_lat: (body.plu_lat as number) || null,
      notes_ahf: (body.notes_ahf as string) || null,
      source: "admin",
      statut: "nouveau",
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
