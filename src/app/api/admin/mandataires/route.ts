import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/shared/lib/supabase";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Record<string, unknown>;
  const { prenom, nom, email } = body as { prenom?: string; nom?: string; email?: string };

  if (!prenom || !nom || !email) {
    return NextResponse.json({ error: "Champs requis : prénom, nom, email" }, { status: 400 });
  }

  const { data, error } = await getSupabaseAdmin()
    .from("mandataires")
    .insert({
      prenom,
      nom,
      email,
      tel: (body.tel as string) || null,
      siret: (body.siret as string) || null,
      forme_juridique: (body.forme_juridique as string) || null,
      adresse: (body.adresse as string) || null,
      reseau_carte_t: (body.reseau_carte_t as string) || null,
      carte_t_numero: (body.carte_t_numero as string) || null,
      zone_activite: (body.zone_activite as string[]) ?? [],
      description: (body.description as string) || null,
      statut: "en_attente",
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
