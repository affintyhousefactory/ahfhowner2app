import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/shared/lib/supabase";

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

  // Vérifier que la fiche appartient au mandataire
  const { data: fiche } = await supabase
    .from("fiches_terrain")
    .select("id, mandataire_id, statut, reserves, notes")
    .eq("id", ficheId)
    .eq("mandataire_id", mandataire.id)
    .single();

  if (!fiche) return { error: "Fiche introuvable", status: 404, supabase: null, mandataire: null, fiche: null };

  return { error: null, status: 200, supabase, mandataire, fiche };
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error, status, supabase, fiche } = await getMandataireAndFiche(req, id);
  if (error || !supabase || !fiche) return NextResponse.json({ error }, { status });

  const body = await req.json();

  const {
    reference_interne,
    commune,
    secteur,
    prix,
    surface,
    zonage,
    urbanisme_detail,
    acces_grue,
    pente_pct,
    reseaux,
    assainissement,
    compatibilite_arko,
    modele_arko,
    statut,
    date_derniere_verif,
    reserves,
    notes,
    photos,
  } = body;

  const finalStatut: string = statut !== undefined ? statut : fiche.statut;
  const finalReserves: string[] = reserves !== undefined ? reserves : (fiche.reserves ?? []);
  const finalNotes: string | null = notes !== undefined ? notes : fiche.notes;
  if ((finalStatut !== "disponible" || finalReserves.length > 0) && !finalNotes?.trim()) {
    return NextResponse.json(
      { error: "Notes obligatoires dès que le statut n'est pas \"disponible\" ou qu'une réserve est renseignée." },
      { status: 400 }
    );
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (reference_interne !== undefined) updates.reference_interne = reference_interne;
  if (commune !== undefined) updates.commune = commune;
  if (secteur !== undefined) updates.secteur = secteur;
  if (prix !== undefined) updates.prix = prix ? parseInt(prix, 10) : null;
  if (surface !== undefined) updates.surface = surface ? parseInt(surface, 10) : null;
  if (zonage !== undefined) updates.zonage = zonage;
  if (urbanisme_detail !== undefined) updates.urbanisme_detail = urbanisme_detail;
  if (acces_grue !== undefined) updates.acces_grue = acces_grue;
  if (pente_pct !== undefined) updates.pente_pct = pente_pct ? parseInt(pente_pct, 10) : null;
  if (reseaux !== undefined) updates.reseaux = reseaux;
  if (assainissement !== undefined) updates.assainissement = assainissement;
  if (compatibilite_arko !== undefined) updates.compatibilite_arko = compatibilite_arko;
  if (modele_arko !== undefined) updates.modele_arko = modele_arko;
  if (statut !== undefined) updates.statut = statut;
  if (date_derniere_verif !== undefined) updates.date_derniere_verif = date_derniere_verif;
  if (reserves !== undefined) updates.reserves = reserves;
  if (notes !== undefined) updates.notes = notes;
  if (photos !== undefined) updates.photos = photos;

  const { data, error: dbErr } = await supabase
    .from("fiches_terrain")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error, status, supabase, fiche } = await getMandataireAndFiche(req, id);
  if (error || !supabase || !fiche) return NextResponse.json({ error }, { status });

  // Soft delete : set statut = 'retire'
  const { data, error: dbErr } = await supabase
    .from("fiches_terrain")
    .update({ statut: "retire", updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json(data);
}
