import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/shared/lib/supabase";

const VALID_STATUTS = ["en_attente", "actif", "suspendu"] as const;
type Statut = (typeof VALID_STATUTS)[number];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { statut } = (await req.json()) as { statut?: string };

  if (!statut || !VALID_STATUTS.includes(statut as Statut)) {
    return NextResponse.json({ error: "statut invalide" }, { status: 400 });
  }

  const { error } = await getSupabaseAdmin()
    .from("mandataires")
    .update({ statut })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, statut });
}
