import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/shared/lib/supabase";
import { uploadFichePhoto, appendFichePhoto, type FichePhoto } from "@/shared/lib/terrain-photos";

async function getMandataireAndFiche(req: NextRequest, ficheId: string) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "") ?? "";
  const supabase = getSupabaseAdmin();

  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return { error: "Non autorisé", status: 401, supabase: null, mandataire: null, fiche: null };

  const { data: mandataire } = await supabase
    .from("mandataires")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!mandataire) return { error: "Mandataire non trouvé", status: 404, supabase: null, mandataire: null, fiche: null };

  const { data: fiche } = await supabase
    .from("fiches_terrain")
    .select("id, mandataire_id, photos")
    .eq("id", ficheId)
    .eq("mandataire_id", mandataire.id)
    .single();

  if (!fiche) return { error: "Fiche introuvable", status: 404, supabase: null, mandataire: null, fiche: null };

  return { error: null, status: 200, supabase, mandataire, fiche };
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error, status, supabase, mandataire, fiche } = await getMandataireAndFiche(req, id);
  if (error || !supabase || !mandataire || !fiche) return NextResponse.json({ error }, { status });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 });

  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  try {
    const photo = await uploadFichePhoto({
      supabase,
      mandataireId: mandataire.id,
      ficheId: id,
      fileName: file.name,
      contentType: file.type,
      buffer,
    });

    const currentPhotos: FichePhoto[] = Array.isArray(fiche.photos) ? fiche.photos : [];
    await appendFichePhoto({ supabase, ficheId: id, currentPhotos, photo });

    return NextResponse.json(photo, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur upload photo";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error, status, supabase, fiche } = await getMandataireAndFiche(req, id);
  if (error || !supabase || !fiche) return NextResponse.json({ error }, { status });

  const { url } = await req.json() as { url: string };
  if (!url) return NextResponse.json({ error: "url requis" }, { status: 400 });

  const currentPhotos: { url: string; nom: string }[] = Array.isArray(fiche.photos) ? fiche.photos : [];
  const updatedPhotos = currentPhotos.filter((p) => p.url !== url);

  const { error: dbErr } = await supabase
    .from("fiches_terrain")
    .update({ photos: updatedPhotos, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
