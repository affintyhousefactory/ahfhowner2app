import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/shared/lib/supabase";
import { refuserSiPasAdmin } from "@/shared/lib/supabase-server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const refus = await refuserSiPasAdmin();
  if (refus) return refus;

  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data: docs, error } = await supabase
    .from("lead_client_documents")
    .select("*")
    .eq("lead_id", id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!docs?.length) return NextResponse.json([]);

  const withUrls = await Promise.all(
    docs.map(async (doc) => {
      const { data: signed } = await supabase.storage
        .from("lead-documents")
        .createSignedUrl(doc.bucket_path, 3600);
      return { ...doc, url: signed?.signedUrl ?? null };
    }),
  );

  return NextResponse.json(withUrls);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const refus = await refuserSiPasAdmin();
  if (refus) return refus;

  const { id } = await params;
  const form = await req.formData();
  const file = form.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "Fichier requis" }, { status: 400 });

  // ADR-035 §5 — qui a déposé la pièce, et à quelle pièce attendue elle répond.
  // Défaut 'ahf' : cette route est celle du back-office. L'espace client
  // (ADR-034) écrira dans la même table avec 'client'.
  const origine = form.get("origine") === "client" ? "client" : "ahf";
  const categorieRaw = form.get("categorie");
  const categorie = typeof categorieRaw === "string" && categorieRaw ? categorieRaw : null;

  const supabase = getSupabaseAdmin();
  const safeName = file.name.replace(/[^a-zA-Z0-9._\-àâäéèêëîïôùûüç ]/g, "_");
  const path = `client/${id}/${Date.now()}_${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from("lead-documents")
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data, error: dbError } = await supabase
    .from("lead_client_documents")
    .insert({
      lead_id: id,
      nom: file.name,
      bucket_path: path,
      type_mime: file.type,
      taille_ko: Math.round(file.size / 1024),
      origine,
      categorie,
    })
    .select("id")
    .single();

  if (dbError) {
    await supabase.storage.from("lead-documents").remove([path]);
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}

/**
 * Reclassement d'une pièce déjà déposée — ADR-035 §5. Sert surtout aux pièces
 * arrivées de l'espace client (ADR-034) sans catégorie : le fichier existe,
 * seule son affectation au dossier manque.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const refus = await refuserSiPasAdmin();
  if (refus) return refus;

  const { id } = await params;
  const { docId, categorie, origine } = (await req.json()) as {
    docId?: string;
    categorie?: string | null;
    origine?: string;
  };
  if (!docId) return NextResponse.json({ error: "docId requis" }, { status: 400 });

  const patch: Record<string, unknown> = {};
  if (categorie !== undefined) patch.categorie = categorie || null;
  if (origine === "ahf" || origine === "client") patch.origine = origine;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Aucun champ à mettre à jour" }, { status: 400 });
  }

  const { error } = await getSupabaseAdmin()
    .from("lead_client_documents")
    .update(patch)
    .eq("id", docId)
    .eq("lead_id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const refus = await refuserSiPasAdmin();
  if (refus) return refus;

  const { id } = await params;
  const { docId } = (await req.json()) as { docId: string };
  if (!docId) return NextResponse.json({ error: "docId requis" }, { status: 400 });

  const supabase = getSupabaseAdmin();

  const { data: doc } = await supabase
    .from("lead_client_documents")
    .select("bucket_path")
    .eq("id", docId)
    .eq("lead_id", id)
    .single();

  if (!doc) return NextResponse.json({ error: "Document introuvable" }, { status: 404 });

  await supabase.storage.from("lead-documents").remove([doc.bucket_path]);

  const { error } = await supabase.from("lead_client_documents").delete().eq("id", docId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
