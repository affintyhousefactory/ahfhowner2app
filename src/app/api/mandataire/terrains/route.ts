import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/shared/lib/supabase";

async function getMandataire(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "") ?? "";
  const supabase = getSupabaseAdmin();

  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return { error: "Non autorisé", status: 401, supabase: null, mandataire: null };

  const { data: mandataire } = await supabase
    .from("mandataires")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!mandataire) return { error: "Mandataire non trouvé", status: 404, supabase: null, mandataire: null };

  return { error: null, status: 200, supabase, mandataire };
}

export async function GET(req: NextRequest) {
  const { error, status, supabase, mandataire } = await getMandataire(req);
  if (error || !supabase || !mandataire) return NextResponse.json({ error }, { status });

  const { data, error: dbErr } = await supabase
    .from("fiches_terrain")
    .select("*")
    .eq("mandataire_id", mandataire.id)
    .order("created_at", { ascending: false });

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const { error, status, supabase, mandataire } = await getMandataire(req);
  if (error || !supabase || !mandataire) return NextResponse.json({ error }, { status });

  const body = await req.json();

  // Extraire les champs autorisés (exclure id, mandataire_id, created_at, updated_at)
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

  if (!commune) return NextResponse.json({ error: "commune est requis" }, { status: 400 });

  const finalStatut = statut ?? "disponible";
  const finalReserves: string[] = reserves ?? [];
  if ((finalStatut !== "disponible" || finalReserves.length > 0) && !notes?.trim()) {
    return NextResponse.json(
      { error: "Notes obligatoires dès que le statut n'est pas \"disponible\" ou qu'une réserve est renseignée." },
      { status: 400 }
    );
  }

  const { data, error: dbErr } = await supabase
    .from("fiches_terrain")
    .insert({
      mandataire_id: mandataire.id,
      reference_interne,
      commune,
      secteur,
      prix: prix ? parseInt(prix, 10) : null,
      surface: surface ? parseInt(surface, 10) : null,
      zonage,
      urbanisme_detail,
      acces_grue,
      pente_pct: pente_pct ? parseInt(pente_pct, 10) : null,
      reseaux,
      assainissement,
      compatibilite_arko,
      modele_arko,
      statut: statut ?? "disponible",
      date_derniere_verif,
      reserves: reserves ?? [],
      notes,
      photos: photos ?? [],
    })
    .select()
    .single();

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
