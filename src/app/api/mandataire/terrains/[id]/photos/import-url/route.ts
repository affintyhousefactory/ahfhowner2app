import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/shared/lib/supabase";
import { fetchBinaryResource, ScrapeError } from "@/shared/lib/scrape-annonce";
import { uploadFichePhoto, appendFichePhoto, type FichePhoto } from "@/shared/lib/terrain-photos";

export const maxDuration = 30;

async function getMandataireAndFiche(req: NextRequest, ficheId: string) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "") ?? "";
  const supabase = getSupabaseAdmin();

  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser(token);
  if (authErr || !user) {
    return { error: "Non autorisé", status: 401, supabase: null, mandataire: null, fiche: null };
  }

  const { data: mandataire } = await supabase
    .from("mandataires")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!mandataire) {
    return { error: "Mandataire non trouvé", status: 404, supabase: null, mandataire: null, fiche: null };
  }

  const { data: fiche } = await supabase
    .from("fiches_terrain")
    .select("id, mandataire_id, photos")
    .eq("id", ficheId)
    .eq("mandataire_id", mandataire.id)
    .single();
  if (!fiche) {
    return { error: "Fiche introuvable", status: 404, supabase: null, mandataire: null, fiche: null };
  }

  return { error: null, status: 200, supabase, mandataire, fiche };
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error, status, supabase, mandataire, fiche } = await getMandataireAndFiche(req, id);
  if (error || !supabase || !mandataire || !fiche) return NextResponse.json({ error }, { status });

  const body = await req.json().catch(() => ({ imageUrl: undefined }));
  const { imageUrl } = body as { imageUrl?: string };
  if (!imageUrl || typeof imageUrl !== "string") {
    return NextResponse.json({ error: "imageUrl requis" }, { status: 400 });
  }

  let buffer: Uint8Array;
  let contentType: string;
  try {
    ({ buffer, contentType } = await fetchBinaryResource(imageUrl));
  } catch (e) {
    if (e instanceof ScrapeError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Impossible de récupérer l'image" }, { status: 502 });
  }

  const fileName = imageUrl.split("/").pop()?.split("?")[0] || `photo-${Date.now()}.jpg`;

  try {
    const photo = await uploadFichePhoto({
      supabase,
      mandataireId: mandataire.id,
      ficheId: id,
      fileName,
      contentType,
      buffer,
    });

    const currentPhotos: FichePhoto[] = Array.isArray(fiche.photos) ? fiche.photos : [];
    await appendFichePhoto({ supabase, ficheId: id, currentPhotos, photo });

    return NextResponse.json(photo, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur import photo";
    return NextResponse.json({ error: message }, { status: 415 });
  }
}
