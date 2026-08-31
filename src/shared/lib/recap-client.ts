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

import { PLAQUETTE, SITE_URL } from "@/lib/site";
import { choixEmailRecap, type ChoixEmailRecap, type CleEmailRecap } from "@/lib/crm";
import type { ParamsBrevo } from "@/shared/lib/brevo-render";

/** Colonnes lues sur `leads` — une seule liste, partagée par les deux routes. */
export const SELECT_RECAP =
  "prenom, nom, email, tel, produit, surface, house_total, delivery, grand_total, terrain_mode, pack_terrain, config_v2, multi_configuration, cible_commerciale, raison_sociale";

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
  /** Rien n'est chiffrable : modèles en balance, ou demande hors grille. */
  multi_configuration?: boolean | null;
  /** Cible du script de phoning — décide de la présentation envoyée. */
  cible_commerciale?: string | null;
  /** Dénomination de la personne morale. Nulle pour un particulier (cible 5). */
  raison_sociale?: string | null;
};

/* ══════════════════════════════════════════════════════════════════════════ */
/* Quel email part — sept possibilités, une seule règle                       */
/* ══════════════════════════════════════════════════════════════════════════ */

/**
 * Traduction d'un choix en numéro de template. **La règle du choix n'est pas
 * ici** : elle vit dans `choixEmailRecap()` (`@/lib/crm`), d'où l'écran d'appel
 * la lit aussi. Ce module n'ajoute que ce qui ne peut pas quitter le serveur —
 * les identifiants de template.
 *
 * ⚠ **Un `Record` sur la clé, pas une suite de `if`.** TypeScript exige alors
 * les sept entrées : le jour où une sixième cible commerciale sera ajoutée à
 * `CIBLES_COMMERCIALES`, ce fichier cessera de compiler tant que son email
 * n'aura pas été décidé. Un `switch` avec un `default` aurait silencieusement
 * envoyé la présentation générique à la nouvelle cible.
 *
 * ⚠ **Lecture différée, jamais à l'évaluation du module.** Une constante de
 * module arrive vide en production : trois récapitulatifs s'étaient perdus ainsi
 * le 2026-08-25. D'où les fonctions plutôt que les valeurs.
 *
 * ⚠ **Aucun repli codé en dur.** Un numéro de template deviné enverrait le
 * mauvais email à un client — mieux vaut une erreur explicite qu'un envoi
 * plausible. Les appelants renvoient un 500 nommant la variable absente.
 */
const TEMPLATES_RECAP: Record<CleEmailRecap, { variable: string; lire: () => number }> = {
  recap: {
    variable: "BREVO_TEMPLATE_RECAP",
    lire: () => Number(process.env.BREVO_TEMPLATE_RECAP ?? 0),
  },
  multicfg: {
    variable: "BREVO_TEMPLATE_MULTICFG",
    lire: () => Number(process.env.BREVO_TEMPLATE_MULTICFG ?? 0),
  },
  hpa: {
    variable: "BREVO_TEMPLATE_CAMPING",
    lire: () => Number(process.env.BREVO_TEMPLATE_CAMPING ?? 0),
  },
  tourisme: {
    variable: "BREVO_TEMPLATE_HOTEL",
    lire: () => Number(process.env.BREVO_TEMPLATE_HOTEL ?? 0),
  },
  medico_social: {
    variable: "BREVO_TEMPLATE_MEDICO",
    lire: () => Number(process.env.BREVO_TEMPLATE_MEDICO ?? 0),
  },
  collectivites: {
    variable: "BREVO_TEMPLATE_COLLECTIVITE",
    lire: () => Number(process.env.BREVO_TEMPLATE_COLLECTIVITE ?? 0),
  },
  investisseurs: {
    variable: "BREVO_TEMPLATE_INVESTISSEUR",
    lire: () => Number(process.env.BREVO_TEMPLATE_INVESTISSEUR ?? 0),
  },
};

export type EmailRecapChoisi = ChoixEmailRecap & {
  /** Nom de la variable d'environnement — sert le message d'erreur, pas la lecture. */
  variable: string;
  /** Identifiant du template chez Brevo. `0` = variable absente de ce scope. */
  id: number;
};

/** Le choix de `choixEmailRecap()`, complété du template qui le sert. */
export function choisirEmailRecap(
  lead: Pick<LeadRecap, "multi_configuration" | "cible_commerciale">,
): EmailRecapChoisi {
  const choix = choixEmailRecap(lead);
  const tpl = TEMPLATES_RECAP[choix.cle];
  return { ...choix, variable: tpl.variable, id: tpl.lire() };
}

const PACK_LABELS: Record<string, string> = {
  essentiel: "Pack Essentiel — 4 900 € TTC",
  etendu: "Pack Étendu — 7 300 € TTC",
  departement: "Pack Département — 11 200 € TTC",
};

function eur(v: number | null | undefined): string {
  return v == null ? "" : `${v.toLocaleString("fr-FR")} €`;
}

/**
 * Ce que lit un prospect dont la raison sociale n'a pas encore été obtenue.
 *
 * ⚠ Les quatre présentations « personne morale » ouvrent leur **objet** par ce
 * nom — « {{ ETABLISSEMENT }} — une suite de plus, sans fermer une journée ».
 * Vide, l'objet commencerait par un tiret : l'email aurait l'air cassé avant
 * même d'être ouvert. Le repli est neutre, et l'écran signale l'absence pour
 * qu'elle soit comblée plutôt que subie.
 */
const ETABLISSEMENT_DEFAUT = "Votre établissement";

/** Ce que la route sait et que le lead ignore — compté au moment de l'envoi. */
export type ContexteRecap = {
  /** Numéros de la série encore libres. `null` = comptage indisponible. */
  numerosLibres?: number | null;
};

export function construireParamsRecap(
  lead: LeadRecap,
  contexte: ContexteRecap = {},
): ParamsBrevo {
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

    /* ⚠ URL **absolue**. Un email n'a pas d'origine : `/documents/…` y serait
       un lien mort, quel que soit le client de messagerie. La ligne reste sous
       `{% if params.PLAQUETTE_URL %}` dans le template, de sorte qu'une
       variable vidée fasse disparaître la ligne au lieu d'offrir un lien qui
       ne mène nulle part. */
    PLAQUETTE_URL: PLAQUETTE.url
      ? PLAQUETTE.url.startsWith("http")
        ? PLAQUETTE.url
        : `${SITE_URL}${PLAQUETTE.url}`
      : "",
    PLAQUETTE_LIBELLE: PLAQUETTE.url ? PLAQUETTE.libelle : "",

    /* Présentations sectorielles (cibles 1 à 4) — le nom ouvre l'objet. */
    ETABLISSEMENT: lead.raison_sociale?.trim() || ETABLISSEMENT_DEFAUT,

    /* Présentation « investisseur » (cible 5) — « il reste N numéros sur les 6
       de la série ». Le compte vient de la base, jamais d'une constante : la
       rareté est un argument commercial, elle se dit juste ou pas du tout.
       Absent ici quand la route n'avait pas à le compter. */
    NB_SERIES_RESTANTES: contexte.numerosLibres ?? undefined,
  };
}
