import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/shared/lib/supabase";
import { refuserSiPasAdmin } from "@/shared/lib/supabase-server";

const ALLOWED_FIELDS = [
  // Identité
  "prenom", "nom", "email", "tel",
  // Projet
  "produit", "source", "statut", "pack_terrain",
  "budget_terrain", "total_estime", "notes_ahf",
  // Adresse client — la personne physique
  "adresse_postale_client", "cp_client", "ville_client",
  /* Société — la personne morale. Distincte de l'adresse client : le siège d'un
     camping et le domicile de son gérant ne sont pas au même endroit, et c'est
     le premier qui reçoit le studio. */
  "raison_sociale", "siren", "site_web",
  "adresse_societe", "cp_societe", "ville_societe",
  // Zone de recherche terrain
  "adresse_recherche", "commune", "code_postal", "departement",
  // Données PLU
  "plu_adresse", "plu_zone", "plu_libelong", "plu_typezone",
  "plu_typedoc", "plu_etat_doc", "plu_datappro",
  "plu_prescriptions", "plu_servitudes",
  "plu_lon", "plu_lat", "parcelle_idu",
  // Vue anonymisée mandataire
  "delai_projet", "description_projet",
  // Suivi commercial (indépendant du statut d'affectation)
  "statut_commercial",
  /* Corrigeable après coup : une cible se choisit au premier appel, et c'est
     précisément le moment où l'on se trompe — l'interlocuteur annoncé comme
     gérant de camping tient en fait un domaine. La valeur reste contrainte par
     la base (`leads_cible_commerciale_check`), qui refuse tout identifiant hors
     des cinq. */
  "cible_commerciale",
  /* Corrigeable à la main, bien qu'un trigger la maintienne : une issue se note
     à la volée pendant l'appel, et se corrige après coup sans qu'on veuille pour
     autant rouvrir le journal. Le trigger reprendra la main au prochain appel
     journalisé — c'est lui la source, la saisie n'est qu'un rattrapage. */
  "derniere_issue",
  /* Corrigeable : un prospect qui hésitait au premier appel finit par choisir,
     et c'est ce basculement qui rend son lead chiffrable. ⚠ Le repasser à
     `false` ne recalcule rien — les colonnes de prix restent nulles tant qu'une
     configuration n'a pas été saisie. */
  "multi_configuration",
  /* Origine commerciale. Corrigeable : le standard annonce « il vous a trouvés
     sur le site », l'appel révèle une recommandation. ⚠ Ne pas confondre avec
     `source`, absente de cette liste à dessein — le canal technique de création
     ne se corrige pas, il constate. */
  "sourcing",
  // Suivi CRM — ADR-035 §1 et §2. `responsable` = conseiller AHF, sans rapport
  // avec `mandataire_id` (domaine suspendu, ADR-028).
  "responsable", "responsable_at", "prochain_rappel_at",
  // Configuration issue du configurateur v2 — ADR-035 §4.
  // `dernier_appel_at` est ABSENT à dessein : il est maintenu par trigger
  // depuis `lead_appels`, et n'a pas à être écrit par un écran.
  "config_v2", "cfg_version", "cfg_usage", "cfg_quantite", "cfg_modele",
  "cfg_ambiance", "cfg_terrasse", "cfg_options",
  "cfg_prix_base", "cfg_prix_terrasse", "cfg_prix_options",
  "cfg_transport", "cfg_total", "slot",
] as const;

type AllowedField = (typeof ALLOWED_FIELDS)[number];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const refus = await refuserSiPasAdmin();
  if (refus) return refus;

  const { id } = await params;
  const body = (await req.json()) as Record<string, unknown>;

  const update: Partial<Record<AllowedField, unknown>> = {};
  for (const key of ALLOWED_FIELDS) {
    if (key in body) update[key] = body[key];
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Aucun champ à mettre à jour" }, { status: 400 });
  }

  const { error } = await getSupabaseAdmin()
    .from("leads")
    .update(update)
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
