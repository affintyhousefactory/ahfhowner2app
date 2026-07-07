import type { SupabaseClient } from "@supabase/supabase-js";
import sharp from "sharp";

export interface FichePhoto {
  url: string;
  nom: string;
}

const ALLOWED_CONTENT_TYPES = new Set(["image/png", "image/jpeg", "image/jpg"]);
// Formats fréquemment servis par les CDN de sites d'annonces (ex: iad sert ses photos en
// webp) mais non acceptés par le bucket de storage — on les convertit plutôt que de les
// rejeter, sinon aucune photo n'est jamais importable depuis ces sites.
const CONVERTIBLE_CONTENT_TYPES = new Set(["image/webp", "image/avif", "image/gif"]);
const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // aligné sur file_size_limit du bucket mandataires-documents

export async function uploadFichePhoto(params: {
  supabase: SupabaseClient;
  mandataireId: string;
  ficheId: string;
  fileName: string;
  contentType: string;
  buffer: Uint8Array;
}): Promise<FichePhoto> {
  const { supabase, mandataireId, ficheId } = params;
  let { fileName, contentType, buffer } = params;

  if (CONVERTIBLE_CONTENT_TYPES.has(contentType)) {
    buffer = await sharp(buffer).jpeg({ quality: 85 }).toBuffer();
    contentType = "image/jpeg";
    fileName = fileName.replace(/\.\w+$/, ".jpg");
  }

  if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
    throw new Error(`Format d'image non supporté (${contentType}) : seuls PNG/JPEG sont acceptés`);
  }
  if (buffer.byteLength > MAX_PHOTO_BYTES) {
    throw new Error("Image trop volumineuse (max 5 Mo)");
  }

  const timestamp = Date.now();
  const safeName = fileName.replace(/[^a-z0-9.\-_]/gi, "_");
  const uploadPath = `terrains/${mandataireId}/${ficheId}/${timestamp}-${safeName}`;

  // Passer un Buffer/Uint8Array brut à storage-js corrompt le contenu binaire en environnement
  // Vercel (constaté : bytes valides juste avant l'appel, fichier corrompu une fois stocké —
  // diagnostiqué via logs de production). Envelopper dans un Blob force le SDK à passer par
  // FormData, un chemin de transport plus robuste pour du binaire. Copie vers un ArrayBuffer
  // concret (plutôt que buffer.buffer, typé ArrayBufferLike et donc incompatible avec
  // BlobPart si SharedArrayBuffer) pour satisfaire strictement le typage.
  const arrayBuffer = new ArrayBuffer(buffer.byteLength);
  new Uint8Array(arrayBuffer).set(buffer);
  const blob = new Blob([arrayBuffer], { type: contentType });

  const { error: uploadErr } = await supabase.storage
    .from("mandataires-documents")
    .upload(uploadPath, blob, { contentType, upsert: false });
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
