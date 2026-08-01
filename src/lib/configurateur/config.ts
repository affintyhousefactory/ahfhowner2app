/**
 * Configurateur v2 — grilles produit (ADR-030).
 *
 * Reprend le §12 de `docs/specs/SPEC_CONFIGURATEUR_HOWNER_v1.md`. La spec
 * insiste : « Toutes ces valeurs sont éditables sans redéploiement : prix,
 * paliers, options, nombre d'unités de la série. **Elles bougeront.** » Le
 * §17.4 confirme que les montants d'options sont provisoires.
 *
 * D'où `loadConfig()` : une couture unique par laquelle tout le parcours lit
 * ses grilles. Aujourd'hui elle sert cette table versionnée ; le back-office
 * (ADR-033) la remplacera par une lecture des tables `config_variables` /
 * `options_produits` sans qu'aucun écran ne change.
 *
 * ⚠ Ne jamais lire ces constantes directement depuis un composant : passer par
 * `loadConfig()`, sinon la bascule vers la base devra rouvrir chaque écran.
 */

import { TRANSPORT } from "@/lib/site";

export type UsageId = "annexe" | "pro" | "logement_nu";
export type ModeleId = "one" | "max";
export type PalierId = "sans" | "petite" | "moyenne" | "grande";

export type Usage = {
  id: UsageId;
  libelle: string;
  eligible: boolean;
  /** Le parcours annexe exige une habitation existante sur la parcelle. */
  exigeBatimentExistant?: boolean;
  /** Parcours professionnel : champ « nombre d'unités ». */
  champQuantite?: boolean;
  /** Au-delà de ce nombre d'unités, le récapitulatif bascule sur devis dédié. */
  seuilDevisDedie?: number;
  /** `null` = arbitrage Howner en attente (§17.5). */
  blocRentabilite: boolean | null;
};

export type Modele = {
  id: ModeleId;
  nom: string;
  surface: number;
  emprise: string;
  typologie: string;
  prixBaseTtc: number;
  /** Information générique, au conditionnel, jamais liée à la parcelle (§8). */
  urbanismeGenerique: string;
  /** Tonnes — entre dans le calcul de transport. */
  poidsTonnes: number;
};

export type Ambiance = { id: string; nom: string; supplementTtc: number };
export type Palier = { id: PalierId; nom: string; prixTtc: number };

export type Option = {
  id: string;
  nom: string;
  detail?: string;
  /** Prix par modèle : une option peut coûter différemment selon l'unité. */
  prixTtc: Partial<Record<ModeleId, number>>;
  /** Filtrage : une option absente de cette liste n'est PAS affichée (§15). */
  modeles: ModeleId[];
  /** Entre dans l'étude d'exécution : non ajoutable après réservation (§5). */
  structurelle: boolean;
};

export type ConfigurateurConfig = {
  version: string;
  tva: number;
  usages: Usage[];
  modeles: Modele[];
  ambiances: Ambiance[];
  terrasse: Record<ModeleId, Palier[]>;
  options: Option[];
  serie: { id: string; libelle: string; unites: number };
  reservation: { montantTtc: number; delaiRetractationJours: number };
};

const CONFIG_V1: ConfigurateurConfig = {
  version: "v1",
  tva: 20,

  usages: [
    {
      id: "annexe",
      libelle: "Une annexe sur le terrain de mon habitation",
      eligible: true,
      exigeBatimentExistant: true,
      blocRentabilite: null, // §17.5 — arbitrage en attente
    },
    {
      id: "pro",
      libelle: "Des hébergements pour mon établissement",
      eligible: true,
      champQuantite: true,
      seuilDevisDedie: 3,
      blocRentabilite: true,
    },
    {
      id: "logement_nu",
      libelle: "Un logement indépendant sur un terrain nu",
      eligible: false,
      blocRentabilite: false,
    },
  ],

  modeles: [
    {
      id: "one",
      nom: "Arko One",
      surface: 20,
      emprise: "6,65 × 3,60 m",
      typologie: "studio",
      prixBaseTtc: 77900,
      urbanismeGenerique: "En général déclaration préalable",
      poidsTonnes: TRANSPORT.poids.one,
    },
    {
      id: "max",
      nom: "Arko Max",
      surface: 40,
      emprise: "4,00 × 11,00 m",
      typologie: "T2",
      prixBaseTtc: 99900,
      urbanismeGenerique: "En général permis de construire",
      poidsTonnes: TRANSPORT.poids.max,
    },
  ],

  // §17.3 — deux ou trois au lancement selon la disponibilité des visuels.
  // Le parcours doit fonctionner à 2 comme à 3 : ne jamais indexer en dur.
  ambiances: [
    { id: "littoral", nom: "Littoral", supplementTtc: 0 },
    { id: "atelier", nom: "Atelier", supplementTtc: 0 },
    { id: "basque", nom: "Basque", supplementTtc: 0 },
  ],

  terrasse: {
    one: [
      { id: "sans", nom: "Sans terrasse", prixTtc: 0 },
      { id: "petite", nom: "Petite", prixTtc: 1990 },
      { id: "moyenne", nom: "Moyenne", prixTtc: 2990 },
      { id: "grande", nom: "Grande", prixTtc: 3990 },
    ],
    max: [
      { id: "sans", nom: "Sans terrasse", prixTtc: 0 },
      { id: "petite", nom: "Petite", prixTtc: 3990 },
      { id: "moyenne", nom: "Moyenne", prixTtc: 5990 },
      { id: "grande", nom: "Grande", prixTtc: 7990 },
    ],
  },

  options: [
    {
      id: "solaire",
      nom: "Kit solaire photovoltaïque",
      detail: "3 kWc",
      prixTtc: { one: 7900, max: 7900 },
      modeles: ["one", "max"],
      structurelle: true,
    },
    {
      id: "casquette",
      nom: "Casquette pare-soleil",
      prixTtc: { one: 2490, max: 3490 },
      modeles: ["one", "max"],
      structurelle: true,
    },
    {
      id: "poele_bois",
      nom: "Poêle à bois",
      prixTtc: { max: 5900 },
      modeles: ["max"], // absent de l'Arko One — jamais grisé, jamais affiché
      structurelle: true,
    },
    {
      id: "clim",
      nom: "Climatisation réversible",
      prixTtc: { one: 3490, max: 5990 },
      modeles: ["one", "max"],
      structurelle: false,
    },
    {
      id: "pack_location",
      nom: "Pack prêt à louer",
      prixTtc: { one: 1990, max: 1990 },
      modeles: ["one", "max"],
      structurelle: false,
    },
  ],

  serie: { id: "serie_01", libelle: "Série 01", unites: 6 },
  reservation: { montantTtc: 2000, delaiRetractationJours: 30 },
};

/**
 * Point d'entrée unique des grilles. Synchrone aujourd'hui (données
 * versionnées) ; deviendra asynchrone quand le back-office alimentera la base
 * — les écrans consomment déjà le résultat, pas les constantes.
 */
export function loadConfig(): ConfigurateurConfig {
  return CONFIG_V1;
}

/* ------------------------------------------------------------------ */
/* Sélecteurs — la logique de grille vit ici, jamais dans les écrans.  */
/* ------------------------------------------------------------------ */

export function getModele(cfg: ConfigurateurConfig, id: ModeleId): Modele {
  const m = cfg.modeles.find((x) => x.id === id);
  if (!m) throw new Error(`Modèle inconnu : ${id}`);
  return m;
}

/** Options réellement proposables pour ce modèle (§15 : absentes, pas grisées). */
export function optionsPourModele(cfg: ConfigurateurConfig, modele: ModeleId): Option[] {
  return cfg.options.filter((o) => o.modeles.includes(modele) && o.prixTtc[modele] != null);
}

export function prixOption(o: Option, modele: ModeleId): number {
  return o.prixTtc[modele] ?? 0;
}

export function paliersPourModele(cfg: ConfigurateurConfig, modele: ModeleId): Palier[] {
  return cfg.terrasse[modele];
}

/**
 * Transport — seul calcul automatique du configurateur.
 *
 * ADR-030 § Écarts assumés, point 3 : le modèle au kilomètre est conservé
 * plutôt que la grille par zone du §5. Il varie avec le poids de l'unité, ce
 * que la grille par zone ignorait — un convoi de 9 t et un de 6 t ne coûtent
 * pas la même chose sur la même distance.
 */
export function transportEur(distanceKm: number | null, modele: Modele): number | null {
  if (distanceKm == null || distanceKm < 0) return null;
  const perKm = modele.poidsTonnes * TRANSPORT.tarifEurTonneKm;
  return Math.round(TRANSPORT.grutageEur + distanceKm * perKm);
}

export function transportPerKm(modele: Modele): number {
  return modele.poidsTonnes * TRANSPORT.tarifEurTonneKm;
}
