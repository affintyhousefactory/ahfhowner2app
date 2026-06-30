import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/shared/lib/supabase";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = req.headers.get("authorization")?.replace("Bearer ", "") ?? "";
  const supabase = getSupabaseAdmin();

  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { data: mandataire } = await supabase
    .from("mandataires")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!mandataire) return NextResponse.json({ error: "Mandataire non trouvé" }, { status: 404 });

  const { data: dossier } = await supabase
    .from("dossiers")
    .select("id, statut, pack_label, pack_prix_ttc, remuneration_mandataire_ht, notes, created_at, accepted_at, lead_id, suspension_raison")
    .eq("id", id)
    .eq("mandataire_id", mandataire.id)
    .single();

  if (!dossier) return NextResponse.json({ error: "Dossier non trouvé" }, { status: 404 });

  const isAccepted = dossier.statut !== "proposé";

  // Champs anonymisés (Niveau 1) — toujours exposés
  const { data: lead } = await supabase
    .from("leads")
    .select(isAccepted
      // Niveau 2 : toutes les infos
      ? `lead_number, commune, description_projet, produit, terrain_mode, pack_terrain,
         total_estime, delai_projet, statut,
         prenom, nom, tel, email,
         adresse_postale_client, cp_client, ville_client,
         notes_ahf, plu_adresse, plu_zone, plu_libelong, plu_typezone,
         plu_typedoc, plu_datappro, plu_prescriptions, plu_servitudes,
         parcelle_idu, plu_lat, plu_lon`
      // Niveau 1 : vue anonymisée
      : "lead_number, commune, description_projet, produit, terrain_mode, pack_terrain, total_estime, delai_projet, statut")
    .eq("id", dossier.lead_id)
    .single();

  // Documents du lead (seulement si accepté)
  let documents: { nom: string; signedUrl: string | null; taille_ko: number | null; created_at: string }[] = [];
  if (isAccepted) {
    const { data: docs } = await supabase
      .from("lead_documents")
      .select("nom, bucket_path, taille_ko, created_at")
      .eq("lead_id", dossier.lead_id)
      .order("created_at", { ascending: false });

    if (docs?.length) {
      documents = await Promise.all(
        docs.map(async (d) => {
          const { data: urlData } = await supabase.storage
            .from("lead-documents")
            .createSignedUrl(d.bucket_path, 3600);
          return { nom: d.nom, signedUrl: urlData?.signedUrl ?? null, taille_ko: d.taille_ko, created_at: d.created_at };
        }),
      );
    }
  }

  return NextResponse.json({ dossier, lead, documents, niveau: isAccepted ? 2 : 1 });
}
