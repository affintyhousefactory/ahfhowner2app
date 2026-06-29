import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/shared/lib/supabase";
import type { ContratData } from "@/shared/components/mandataire/ContratCanvas";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.email || !body?.password || !body?.contrat) {
    return NextResponse.json({ error: "Données manquantes." }, { status: 400 });
  }

  const { email, password, contrat }: { email: string; password: string; contrat: ContratData } =
    body;

  const supabase = getSupabaseAdmin();

  // 1. Créer le compte auth avec l'admin API
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: "mandataire" },
  });

  if (authError) {
    // Email déjà utilisé
    if (authError.message.toLowerCase().includes("already")) {
      return NextResponse.json(
        { error: "Cet email est déjà associé à un compte." },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  const userId = authData.user.id;

  // Forcer la confirmation email (email_confirm dans createUser ignoré dans certaines versions)
  await supabase.auth.admin.updateUserById(userId, { email_confirm: true });

  // 2. Créer le profil mandataire
  const { error: dbError } = await supabase.from("mandataires").insert({
    user_id: userId,
    statut: "en_attente",
    nom: contrat.nom_raison_sociale,
    prenom: contrat.signature_prenom,
    email: contrat.email,
    siret: contrat.siret,
    reseau_carte_t: contrat.reseau_carte_t || null,
    carte_t_numero: contrat.carte_t_numero || null,
    forme_juridique: contrat.forme_juridique,
    adresse: contrat.adresse,
    contrat_signe_at: new Date().toISOString(),
    contrat_data: contrat,
  });

  if (dbError) {
    // Rollback : supprimer le compte auth créé
    await supabase.auth.admin.deleteUser(userId);
    return NextResponse.json(
      { error: "Erreur lors de l'enregistrement du profil." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, userId });
}
