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

export type Ambiance = {
  id: string;
  nom: string;
  supplementTtc: number;
  /**
   * Rendu extérieur associé — c'est lui que montre la scène collante. Les
   * fichiers actuels sont ceux de la v1 (décision Richard, 2026-08-01) ; la
   * nomenclature cible `{modele}_{vue}_{ambiance}.webp` s'y substituera au fil
   * des livraisons sans toucher aux composants, puisque le chemin est ici.
   */
  visuel: string;
  /**
   * Teinte du bardage. Sert l'aperçu du sélecteur : un carré de couleur dit
   * ce que le libellé ne dit pas — « Basque » ne se devine pas.
   */
  teinte: string;
};
/**
 * Ambiance intérieure — rubrique ajoutée le 2026-08-20 (demande de Richard).
 *
 * Distincte du bardage : l'une habille l'extérieur, l'autre décide de ce qu'on
 * voit une fois entré. Les deux se choisissent séparément et se combinent
 * librement.
 *
 * `vues` est indexé par modèle parce que les deux gammes n'ont pas le même
 * programme : l'Arko Max a un salon que l'Arko One n'a pas. Le parcours doit
 * donc boucler sur ce tableau sans jamais présumer de sa longueur — même règle
 * que pour les ambiances de bardage.
 */
export type VueInterieure = {
  id: string;
  /** Libellé affiché sous la scène pendant que la vue est montrée. */
  nom: string;
  src: string;
};

export type AmbianceInterieure = {
  id: string;
  nom: string;
  supplementTtc: number;
  /** Teinte d'aperçu du sélecteur — dit ce que le libellé ne dit pas. */
  teinte: string;
  vues: Record<ModeleId, VueInterieure[]>;
};

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
  ambiancesInterieures: AmbianceInterieure[];
  terrasse: Record<ModeleId, Palier[]>;
  options: Option[];
  serie: { id: string; libelle: string; unites: number };
  reservation: { montantTtc: number; delaiRetractationJours: number };
};

const CONFIG_V1: ConfigurateurConfig = {
  /**
   * Version **de la grille**, pas du configurateur — deux choses différentes
   * qu'un `"v2"` ici aurait confondues avec le « configurateur v2 » d'ADR-030.
   * Datée pour être ordonnable et se dater elle-même : elle s'affiche telle
   * quelle dans la fiche (« grille 2026-08-04 »).
   *
   * **À incrémenter dès qu'un prix, un palier ou une option bouge.** C'est ce
   * qui fait passer `grillePerimee` à vrai sur les leads antérieurs et les
   * empêche d'être relus avec la grille du jour (ADR-035 §4).
   *
   * Historique : `"v1"` jusqu'au 2026-08-04 (retrait du « Pack prêt à louer »),
   * puis `"2026-08-04"` jusqu'au 2026-08-20 (renommage du bardage et de ses
   * teintes, ajout de l'ambiance intérieure — les identifiants ont changé,
   * une configuration antérieure ne se relit donc pas avec cette grille).
   */
  version: "2026-08-20",
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

  /* Bardage extérieur — rubrique renommée le 2026-08-20 (demande de Richard) :
     « Ambiance » désignait mal une rubrique qui ne porte que la peau extérieure,
     d'autant qu'une ambiance intérieure existe désormais juste après.

     Les libellés passent de noms d'atmosphère à des noms de couleur — « Basque »
     ne se devine pas, « Vert » si. **Les identifiants suivent les libellés** :
     un `cfg_ambiance: "littoral"` en base n'aurait rien dit à un conseiller
     lisant « Gris clair » à l'écran. C'est la leçon d'ADR-035 § Amendement, où
     `chaud` avait été renommé en base et pas seulement à l'affichage. Aucun lead
     ne porte ces valeurs (0 en production), et `version` est incrémentée : une
     configuration antérieure serait de toute façon signalée périmée.

     ⚠ À vérifier avec Richard : la teinte d'aperçu et le rendu de « Gris clair »
     sont ceux du **bleu pigeon** de la v1 (`skin-bleu.jpg`, `#5d7d8f`). Le
     libellé demandé annonce un gris, la pastille montre un bleu. Il manque soit
     le bon rendu, soit la bonne teinte.

     §17.3 — deux ou trois au lancement selon la disponibilité des visuels. Le
     parcours doit fonctionner à 2 comme à 3 : ne jamais indexer en dur. */
  ambiances: [
    {
      id: "gris_clair",
      nom: "Gris clair",
      supplementTtc: 0,
      visuel: "/assets/arko/skins/skin-bleu.jpg",
      teinte: "#5d7d8f", // ⚠ bleu pigeon de la v1 — à confirmer, cf. ci-dessus
    },
    {
      id: "gris_anthracite",
      nom: "Gris anthracite",
      supplementTtc: 0,
      visuel: "/assets/arko/skins/skin-anthracite.jpg",
      teinte: "#3a3f3c",
    },
    {
      id: "vert",
      nom: "Vert",
      supplementTtc: 0,
      visuel: "/assets/arko/skins/skin-vert.jpg",
      teinte: "#5a6a43",
    },
  ],

  /* Ambiance intérieure — rubrique créée le 2026-08-20 (demande de Richard).
     Sans supplément : c'est un choix de finition, pas une option payante.

     Les vues diffèrent d'un modèle à l'autre — l'Arko Max a un salon que l'Arko
     One n'a pas. D'où l'indexation par modèle, et l'interdiction d'indexer en
     dur côté composant : la scène boucle sur ce que le modèle actif expose. */
  ambiancesInterieures: [
    {
      id: "bois",
      nom: "Ambiance bois",
      supplementTtc: 0,
      teinte: "#a9784c",
      vues: {
        one: [
          { id: "cuisine", nom: "Séjour-cuisine", src: "/assets/arko/config/one/bois/cuisine.avif" },
          { id: "lit", nom: "Le couchage", src: "/assets/arko/config/one/bois/lit.avif" },
          { id: "sdb", nom: "La salle d'eau", src: "/assets/arko/config/one/bois/sdb.avif" },
        ],
        max: [
          { id: "cuisine", nom: "Séjour-cuisine", src: "/assets/arko/config/max/bois/cuisine.avif" },
          { id: "salon", nom: "Le salon", src: "/assets/arko/config/max/bois/salon.avif" },
          { id: "lit", nom: "La chambre", src: "/assets/arko/config/max/bois/lit.avif" },
          { id: "sdb", nom: "La salle de bain", src: "/assets/arko/config/max/bois/sdb.avif" },
        ],
      },
    },
    {
      id: "blanc",
      nom: "Ambiance blanc",
      supplementTtc: 0,
      teinte: "#e8e6e1",
      vues: {
        one: [
          { id: "cuisine", nom: "Séjour-cuisine", src: "/assets/arko/config/one/blanc/cuisine.avif" },
          { id: "lit", nom: "Le couchage", src: "/assets/arko/config/one/blanc/lit.avif" },
          { id: "sdb", nom: "La salle d'eau", src: "/assets/arko/config/one/blanc/sdb.avif" },
        ],
        max: [
          { id: "cuisine", nom: "Séjour-cuisine", src: "/assets/arko/config/max/blanc/cuisine.avif" },
          { id: "salon", nom: "Le salon", src: "/assets/arko/config/max/blanc/salon.avif" },
          { id: "lit", nom: "La chambre", src: "/assets/arko/config/max/blanc/lit.avif" },
          { id: "sdb", nom: "La salle de bain", src: "/assets/arko/config/max/blanc/sdb.avif" },
        ],
      },
    },
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
    // « Pack prêt à louer » (1 990 €) retiré le 2026-08-04 — décision de Richard,
    // l'offre n'est pas viable après étude. Écart supplémentaire au §5 de la
    // spec, qui le liste encore ; la spec est une source versionnée, elle n'est
    // pas réécrite (même traitement que les écarts d'ADR-030).
    //
    // Retirer une option ne casse rien pour les leads qui la portaient : elle
    // se restitue « hors grille » avec son identifiant brut (`resoudreConfigV2`).
    // C'est le sens du bump de `version` ci-dessus — leur configuration est
    // signalée périmée au lieu d'être relue avec la grille du jour.
  ],

  // 6 : arbitrage Richard du 2026-08-04, qui annule celui du 2026-08-02 et
  // revient au §5 de la spec. `SERIE_TOTAL` (`site.ts`) a été ramené à 6 dans
  // le même geste — les deux nombres se lisent dans le même parcours (en-tête
  // public puis sélecteur du tunnel), ils ne peuvent pas diverger.
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
