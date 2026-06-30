import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/shared/lib/supabase";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Token manquant" }, { status: 400 });

  const supabase = getSupabaseAdmin();

  const { data: m } = await supabase
    .from("mandataires")
    .select("id, statut, invitation_expires_at")
    .eq("invitation_token", token)
    .single();

  if (!m) return NextResponse.json({ error: "Lien invalide" }, { status: 404 });
  if (m.statut !== "invite") return NextResponse.json({ error: "Invitation déjà utilisée" }, { status: 409 });

  const expires = m.invitation_expires_at ? new Date(m.invitation_expires_at) : null;
  if (expires && expires < new Date()) {
    return NextResponse.json({ error: "Lien expiré" }, { status: 410 });
  }

  const date = new Date().toISOString().slice(0, 10);
  const path = `${m.id}/contrat-${date}.pdf`;

  const { data, error } = await supabase.storage
    .from("mandataires-documents")
    .createSignedUploadUrl(path);

  if (error || !data) {
    return NextResponse.json({ error: "Impossible de générer l'URL d'upload" }, { status: 500 });
  }

  return NextResponse.json({ signedUrl: data.signedUrl, token: data.token, path });
}
