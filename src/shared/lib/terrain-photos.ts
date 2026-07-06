import type { SupabaseClient } from "@supabase/supabase-js";

export interface FichePhoto {
  url: string;
  nom: string;
}

const ALLOWED_CONTENT_TYPES = new Set(["image/png", "image/jpeg", "image/jpg"]);
const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // aligné sur file_size_limit du bucket mandataires-documents

export async function uploadFichePhoto(params: {
  supabase: SupabaseClient;
  mandataireId: string;
  ficheId: string;
  fileName: string;
  contentType: string;
  buffer: Uint8Array;
}): Promise<FichePhoto> {
  const { supabase, mandataireId, ficheId, fileName, contentType, buffer } = params;

  if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
    throw new Error(`Format d'image non supporté (${contentType}) : seuls PNG/JPEG sont acceptés`);
  }
  if (buffer.byteLength > MAX_PHOTO_BYTES) {
    throw new Error("Image trop volumineuse (max 5 Mo)");
  }

  const timestamp = Date.now();
  const safeName = fileName.replace(/[^a-z0-9.\-_]/gi, "_");
  const uploadPath = `terrains/${mandataireId}/${ficheId}/${timestamp}-${safeName}`;

  const { error: uploadErr } = await supabase.storage
    .from("mandataires-documents")
    .upload(uploadPath, buffer, { contentType, upsert: false });
  if (uploadErr) throw new Error(uploadErr.message);

  const { data: urlData } = supabase.storage.from("mandataires-documents").getPublicUrl(uploadPath);
  return { url: urlData?.publicUrl ?? "", nom: fileName };
}

export async function appendFichePhoto(params: {
  supabase: SupabaseClient;
  ficheId: string;
  currentPhotos: FichePhoto[];
  photo: FichePhoto;
}): Promise<void> {
  const { supabase, ficheId, currentPhotos, photo } = params;
  const updatedPhotos = [...currentPhotos, photo];
  const { error } = await supabase
    .from("fiches_terrain")
    .update({ photos: updatedPhotos, updated_at: new Date().toISOString() })
    .eq("id", ficheId);
  if (error) throw new Error(error.message);
}
