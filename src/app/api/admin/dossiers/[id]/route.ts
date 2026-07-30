import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/shared/lib/supabase";
// ADR-028 — domaine « Mandataire & Terrain » suspendu : 404 tant que le flag est off.
import { mandataireDisabled } from "@/shared/lib/feature-guard";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const off = mandataireDisabled();
  if (off) return off;

  const { id } = await params;
  const body = await req.json().catch(() => null) as { acte_notarie_at?: string | null } | null;

  if (!body || !("acte_notarie_at" in body)) {
    return NextResponse.json({ error: "acte_notarie_at requis" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("dossiers")
    .update({ acte_notarie_at: body.acte_notarie_at })
    .eq("id", id)
    .select("id, acte_notarie_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
