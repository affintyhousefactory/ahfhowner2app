import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/shared/lib/supabase";
import { fetchAnnoncePage, extractPageContent, ScrapeError } from "@/shared/lib/scrape-annonce";
import { extractFieldsFromText } from "@/shared/lib/anthropic";

export const maxDuration = 30;

async function requireMandataire(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "") ?? "";
  const supabase = getSupabaseAdmin();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export async function POST(req: NextRequest) {
  const user = await requireMandataire(req);
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json().catch(() => ({ url: undefined }));
  const { url } = body as { url?: string };
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "url requis" }, { status: 400 });
  }

  let html: string;
  let finalUrl: string;
  try {
    ({ html, finalUrl } = await fetchAnnoncePage(url));
  } catch (e) {
    if (e instanceof ScrapeError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Échec de récupération de la page" }, { status: 502 });
  }

  const extracted = extractPageContent(html, finalUrl);
  if (!extracted.cleanedText || extracted.cleanedText.length < 50) {
    return NextResponse.json(
      { error: "Page vide ou contenu insuffisant pour l'analyse" },
      { status: 422 },
    );
  }

  let fields;
  try {
    fields = await extractFieldsFromText(extracted);
  } catch {
    return NextResponse.json({ error: "Échec de l'analyse du contenu par l'IA" }, { status: 502 });
  }

  const warnings: string[] = [];
  if (fields.prix != null && (fields.prix < 0 || fields.prix > 10_000_000)) {
    warnings.push("Le prix extrait semble incohérent, à vérifier.");
    fields.prix = null;
  }
  if (fields.surface != null && (fields.surface < 0 || fields.surface > 1_000_000)) {
    warnings.push("La surface extraite semble incohérente, à vérifier.");
    fields.surface = null;
  }
  if (extracted.images.length === 0) {
    warnings.push("Aucune photo détectée sur la page source.");
  }

  return NextResponse.json({
    fields,
    images: extracted.images,
    source_url: finalUrl,
    warnings,
  });
}
