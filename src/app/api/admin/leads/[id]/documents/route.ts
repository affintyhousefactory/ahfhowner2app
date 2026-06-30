import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/shared/lib/supabase";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data: docs, error } = await supabase
    .from("lead_documents")
    .select("*, mandataires(prenom, nom)")
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
  const { id } = await params;
  const form = await req.formData();
  const file = form.get("file") as File | null;
  const mandataireId = (form.get("mandataire_id") as string | null) || null;

  if (!file) return NextResponse.json({ error: "Fichier requis" }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const safeName = file.name.replace(/[^a-zA-Z0-9._\-àâäéèêëîïôùûüç ]/g, "_");
  const path = `leads/${id}/${Date.now()}_${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from("lead-documents")
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data, error: dbError } = await supabase
    .from("lead_documents")
    .insert({
      lead_id: id,
      mandataire_id: mandataireId,
      nom: file.name,
      bucket_path: path,
      type_mime: file.type,
      taille_ko: Math.round(file.size / 1024),
    })
    .select("id")
    .single();

  if (dbError) {
    await supabase.storage.from("lead-documents").remove([path]);
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { docId } = (await req.json()) as { docId: string };
  if (!docId) return NextResponse.json({ error: "docId requis" }, { status: 400 });

  const supabase = getSupabaseAdmin();

  const { data: doc } = await supabase
    .from("lead_documents")
    .select("bucket_path")
    .eq("id", docId)
    .eq("lead_id", id)
    .single();

  if (!doc) return NextResponse.json({ error: "Document introuvable" }, { status: 404 });

  await supabase.storage.from("lead-documents").remove([doc.bucket_path]);

  const { error } = await supabase.from("lead_documents").delete().eq("id", docId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
