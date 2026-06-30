import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/shared/lib/supabase";

const EDITABLE_FIELDS = [
  "prenom", "nom", "email", "tel",
  "statut_professionnel", "reseau_type",
  "adresse_principale", "cp_principal", "ville_principale",
  "rayon_intervention", "delai_rappel", "specialites",
] as const;

type EditableField = (typeof EDITABLE_FIELDS)[number];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await req.json()) as Record<string, unknown>;

  const update: Partial<Record<EditableField, unknown>> = {};
  for (const key of EDITABLE_FIELDS) {
    if (key in body) update[key] = body[key];
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Aucun champ à mettre à jour" }, { status: 400 });
  }

  const { error } = await getSupabaseAdmin()
    .from("mandataires")
    .update(update)
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
