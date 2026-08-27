import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/shared/lib/supabase";
import { refuserSiPasAdmin } from "@/shared/lib/supabase-server";

export async function POST(req: NextRequest) {
  const refus = await refuserSiPasAdmin();
  if (refus) return refus;

  const body = (await req.json()) as Record<string, unknown>;

  const { prenom, nom, email } = body as { prenom?: string; nom?: string; email?: string };
  /* ⚠ L'email n'est plus requis (2026-08-27). Au téléphone, tout le monde ne
     donne pas son adresse : l'exiger obligeait à en inventer une — qui finit par
     recevoir un devis — ou à renoncer à la fiche, c'est-à-dire à perdre l'appel.
     Sans elle, aucun récapitulatif ne partira ; c'est le seul effet, et l'écran
     le dit. La colonne a été relâchée par `20260827_lead_email_facultatif.sql` :
     sans cette migration, l'insertion échouerait ici en erreur serveur. */
  if (!prenom || !nom) {
    return NextResponse.json({ error: "Champs requis : prénom, nom" }, { status: 400 });
  }

  const { data, error } = await getSupabaseAdmin()
    .from("leads")
    .insert({
      prenom,
      nom,
      /* Chaîne vide → null : le formulaire envoie "" quand le champ est laissé
         libre, et une adresse vide stockée telle quelle passerait les tests
         `lead.email ?` un peu partout. */
      email: email || null,
      tel: (body.tel as string) || null,

      /* Société — tous facultatifs (`20260827_lead_societe.sql`). L'écran
         normalise déjà : SIREN réduit à neuf chiffres, site web préfixé. La
         base ne refuse qu'un SIREN qui n'en est pas un. */
      raison_sociale: (body.raison_sociale as string) || null,
      siren: (body.siren as string) || null,
      site_web: (body.site_web as string) || null,
      adresse_societe: (body.adresse_societe as string) || null,
      cp_societe: (body.cp_societe as string) || null,
      ville_societe: (body.ville_societe as string) || null,
      produit: (body.produit as string) || null,
      pack_terrain: (body.pack_terrain as string) || null,
      terrain_mode: (body.terrain_mode as string) || null,
      adresse_recherche: (body.adresse_recherche as string) || null,
      commune: (body.commune as string) || null,
      code_postal: (body.code_postal as string) || null,
      departement: (body.departement as string) || null,
      config_json: body.config_json ?? null,
      options_labels: (body.options_labels as string[]) ?? [],
      // PLU
      plu_consent: (body.plu_consent as boolean) ?? false,
      plu_adresse: (body.plu_adresse as string) || null,
      plu_zone: (body.plu_zone as string) || null,
      plu_libelong: (body.plu_libelong as string) || null,
      plu_typezone: (body.plu_typezone as string) || null,
      plu_typedoc: (body.plu_typedoc as string) || null,
      plu_etat_doc: (body.plu_etat_doc as string) || null,
      plu_datappro: (body.plu_datappro as string) || null,
      plu_prescriptions: (body.plu_prescriptions as string[]) ?? [],
      plu_servitudes: (body.plu_servitudes as string[]) ?? [],
      plu_lon: (body.plu_lon as number) || null,
      plu_lat: (body.plu_lat as number) || null,
      notes_ahf: (body.notes_ahf as string) || null,

      // ── Suivi CRM (ADR-035 §1 et §2) ────────────────────────────────────
      /* Cible commerciale : obligatoire côté écran, tolérée nulle ici. Les
         leads venus du site public (configurateur, formulaire de contact)
         n'ont personne pour la renseigner — imposer la colonne `not null`
         aurait fait échouer leur enregistrement. La contrainte de valeur, elle,
         est bien en base : un identifiant inconnu est refusé. */
      cible_commerciale: (body.cible_commerciale as string) || null,
      /* Le prospect hésite entre plusieurs modèles. `?? false` et non `|| false` :
         la colonne est `not null`, et un `undefined` venu d'un appelant plus
         ancien doit valoir « configuration unique », le seul cas qui existait
         avant le 2026-08-27. */
      multi_configuration: (body.multi_configuration as boolean) ?? false,
      responsable: (body.responsable as string) || null,
      responsable_at: body.responsable ? new Date().toISOString() : null,
      prochain_rappel_at: (body.prochain_rappel_at as string) || null,
      statut_commercial: (body.statut_commercial as string) || "nouveau",

      // ── Configuration du configurateur v2 (ADR-035 §4) ──────────────────
      // Instantané JSON + colonnes plates : le premier pour la fidélité, les
      // secondes pour le tri et l'agrégation du CRM.
      config_v2: body.config_v2 ?? null,
      cfg_version: (body.cfg_version as string) || null,
      cfg_usage: (body.cfg_usage as string) || null,
      cfg_quantite: (body.cfg_quantite as number) ?? null,
      cfg_modele: (body.cfg_modele as string) || null,
      cfg_ambiance: (body.cfg_ambiance as string) || null,
      cfg_terrasse: (body.cfg_terrasse as string) || null,
      cfg_options: (body.cfg_options as string[]) ?? [],
      cfg_prix_base: (body.cfg_prix_base as number) ?? null,
      cfg_prix_terrasse: (body.cfg_prix_terrasse as number) ?? null,
      cfg_prix_options: (body.cfg_prix_options as number) ?? null,
      cfg_transport: (body.cfg_transport as number) ?? null,
      cfg_total: (body.cfg_total as number) ?? null,
      // Numéro de série demandé. Colonne historique, protégée par un index
      // unique partiel (`20260703_leads_slot_unique.sql`) — d'où le message
      // dédié ci-dessous. L'état demandé/confirmé relève d'ADR-031.
      slot: (body.slot as number) || null,

      source: "admin",
      statut: "nouveau",
    })
    .select("id")
    .single();

  if (error) {
    // 23505 = violation d'unicité. Le seul cas possible ici est le numéro de
    // série déjà pris : le dire, plutôt que de servir un message Postgres.
    if (error.code === "23505") {
      return NextResponse.json(
        { error: `Le numéro ${body.slot} est déjà attribué à un autre lead.` },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ id: data.id });
}
