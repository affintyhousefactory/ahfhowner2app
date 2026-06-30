import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/shared/lib/supabase";

const ALLOWED_FIELDS = [
  "prenom", "nom", "email", "tel",
  "produit", "source", "statut", "pack_terrain",
  "budget_terrain", "total_estime", "notes_ahf",
  "adresse_postale_client", "cp_client", "ville_client",
  "adresse_recherche", "commune", "code_postal", "departement",
] as const;

type AllowedField = (typeof ALLOWED_FIELDS)[number];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await req.json()) as Record<string, unknown>;

  const update: Partial<Record<AllowedField, unknown>> = {};
  for (const key of ALLOWED_FIELDS) {
    if (key in body) update[key] = body[key];
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Aucun champ à mettre à jour" }, { status: 400 });
  }

  const { error } = await getSupabaseAdmin()
    .from("leads")
    .update(update)
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
