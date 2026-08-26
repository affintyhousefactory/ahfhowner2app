/**
 * Récapitulatif d'appel envoyé au client — construction des paramètres.
 *
 * ⚠ **Une seule fonction pour l'aperçu et pour l'envoi.** L'écran montre au
 * conseiller ce que le client va recevoir ; si l'aperçu et l'envoi
 * construisaient chacun leurs valeurs, l'écran finirait par mentir — et il
 * mentirait sur des prix. Les deux routes appellent donc `construireParamsRecap()`,
 * et rien d'autre ne fabrique ces paramètres.
 *
 * Les clés correspondent aux `{{ params.X }}` du template Brevo « RECAP ».
 */

import { PLAQUETTE } from "@/lib/site";
import type { ParamsBrevo } from "@/shared/lib/brevo-render";

/** Colonnes lues sur `leads` — une seule liste, partagée par les deux routes. */
export const SELECT_RECAP =
  "prenom, nom, email, tel, produit, surface, house_total, delivery, grand_total, terrain_mode, pack_terrain, config_v2";

export type LeadRecap = {
  prenom: string | null;
  nom: string | null;
  email: string | null;
  tel: string | null;
  produit: string | null;
  surface: string | number | null;
  house_total: number | null;
  delivery: number | null;
  grand_total: number | null;
  terrain_mode: string | null;
  pack_terrain: string | null;
  config_v2: { distance_km?: number | null; prix?: { transport?: number | null } } | null;
};

const PACK_LABELS: Record<string, string> = {
  essentiel: "Pack Essentiel — 4 900 € TTC",
  etendu: "Pack Étendu — 7 300 € TTC",
  departement: "Pack Département — 11 200 € TTC",
};

function eur(v: number | null | undefined): string {
  return v == null ? "" : `${v.toLocaleString("fr-FR")} €`;
}

export function construireParamsRecap(lead: LeadRecap): ParamsBrevo {
  const terrainLabel =
    lead.terrain_mode === "pack" && lead.pack_terrain
      ? PACK_LABELS[lead.pack_terrain] ?? "Pack Terrain Affinity"
      : lead.terrain_mode === "have"
        ? "J'ai un terrain"
        : "Non renseigné";

  /* La distance est celle figée dans `config_v2` au moment de l'appel — pas un
     recalcul. Un client à qui on a annoncé « 412 km » au téléphone doit lire
     412 km dans son email, même si les coordonnées de l'atelier sont affinées
     entre-temps. */
  const distanceKm = lead.config_v2?.distance_km ?? null;
  const transport = lead.config_v2?.prix?.transport ?? lead.delivery ?? null;

  const livraisonLabel =
    lead.terrain_mode === "pack"
      ? "Via pack terrain"
      : transport != null
        ? distanceKm != null
          ? `${eur(transport)} — ${distanceKm} km depuis notre atelier`
          : eur(transport)
        : "À estimer une fois le terrain connu";

  const totalEstime =
    lead.grand_total && lead.grand_total > 0
      ? eur(lead.grand_total)
      : lead.house_total
        ? eur(lead.house_total)
        : "";

  return {
    PRENOM: lead.prenom ?? "",
    NOM: lead.nom ?? "",
    EMAIL: lead.email ?? "",
    TEL: lead.tel ?? "",
    STUDIO_TTC: eur(lead.house_total),
    LIVRAISON: livraisonLabel,
    TERRAIN: terrainLabel,
    MODELE: `${lead.produit ?? ""} ${lead.surface ?? ""}`.trim(),
    TOTAL_ESTIME: totalEstime,

    /* Vide tant qu'aucun fichier n'est déposé : le template garde la ligne sous
       un `{% if params.PLAQUETTE_URL %}`, donc elle disparaît d'elle-même
       plutôt que d'offrir un lien qui ne mène nulle part. */
    PLAQUETTE_URL: PLAQUETTE.url,
    PLAQUETTE_LIBELLE: PLAQUETTE.url ? PLAQUETTE.libelle : "",
  };
}
