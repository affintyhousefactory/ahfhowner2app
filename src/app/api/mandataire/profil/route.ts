import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/shared/lib/supabase";
// ADR-028 — domaine « Mandataire & Terrain » suspendu : 404 tant que le flag est off.
import { mandataireDisabled } from "@/shared/lib/feature-guard";

async function getMandataireWithProfile(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "") ?? "";
  const supabase = getSupabaseAdmin();

  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return { error: "Non autorisé", status: 401, supabase: null, mandataire: null };

  const { data: mandataire } = await supabase
    .from("mandataires")
    .select("*")
    .eq("user_id", user.id)
    .single();
  if (!mandataire) return { error: "Mandataire non trouvé", status: 404, supabase: null, mandataire: null };

  return { error: null, status: 200, supabase, mandataire };
}

export async function GET(req: NextRequest) {
  const off = mandataireDisabled();
  if (off) return off;

  const { error, status, mandataire } = await getMandataireWithProfile(req);
  if (error || !mandataire) return NextResponse.json({ error }, { status });

  const {
    prenom,
    nom,
    email,
    tel,
    siret,
    forme_juridique,
    adresse,
    reseau_carte_t,
    carte_t_numero,
    statut_professionnel,
    reseau_type,
    adresse_principale,
    cp_principal,
    ville_principale,
    rayon_intervention,
    delai_rappel,
    specialites,
    contrat_url,
    contrat_signe_at,
    zone_intervention,
  } = mandataire;

  return NextResponse.json({
    prenom,
    nom,
    email,
    tel,
    siret,
    forme_juridique,
    adresse,
    reseau_carte_t,
    carte_t_numero,
    statut_professionnel,
    reseau_type,
    adresse_principale,
    cp_principal,
    ville_principale,
    rayon_intervention,
    delai_rappel,
    specialites,
    contrat_url,
    contrat_signe_at,
    zone_intervention,
  });
}

export async function PATCH(req: NextRequest) {
  const off = mandataireDisabled();
  if (off) return off;

  const { error, status, supabase, mandataire } = await getMandataireWithProfile(req);
  if (error || !supabase || !mandataire) return NextResponse.json({ error }, { status });

  const body = (await req.json()) as Record<string, unknown>;

  const ALLOWED_FIELDS = [
    "prenom",
    "nom",
    "tel",
    "siret",
    "forme_juridique",
    "adresse",
    "reseau_carte_t",
    "carte_t_numero",
    "statut_professionnel",
    "reseau_type",
    "adresse_principale",
    "cp_principal",
    "ville_principale",
    "rayon_intervention",
    "delai_rappel",
    "specialites",
  ];

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const field of ALLOWED_FIELDS) {
    if (field in body) update[field] = body[field];
  }

  const { data, error: dbErr } = await supabase
    .from("mandataires")
    .update(update)
    .eq("id", mandataire.id)
    .select()
    .single();

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json(data);
}
