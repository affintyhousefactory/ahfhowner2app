/* ============================================================
   HOWNER / ARKO — source de contenu
   Règles de marque ABSOLUES — voir ADR-029 (remplace ADR-004).
   Vocabulaire imposé : studio de jardin, unité, hébergement, annexe,
   espace supplémentaire, prêt à vivre.
   « notre architecte intégrée » sans prénom. Fondateur = Puigbo
   (sans accent). Contrôle : node scripts/check-vocabulaire.mjs
   ============================================================ */

import { FEATURES } from "@/lib/features";

/**
 * Montant lu dans l'environnement, avec repli sûr.
 *
 * `Number(process.env.X ?? repli)` a un angle mort : `??` ne se déclenche que
 * sur `null`/`undefined`. Une variable **définie mais vide** — une valeur
 * effacée dans l'interface Vercel, un espace, un « 69 900 » saisi avec son
 * séparateur — passe la garde et `Number("")` vaut **0**. Le site afficherait
 * un studio de jardin à 0 €, sans rien casser qui se voie au déploiement.
 *
 * Le risque est né le 2026-08-22 avec la pose des variables : tant qu'elles
 * n'existaient pas, le repli servait toujours. Maintenant qu'elles existent,
 * elles peuvent être mal renseignées.
 *
 * D'où cette lecture : vide, non numérique ou négatif ⇒ on retombe sur le
 * repli et on le dit dans la console du build. Zéro reste refusé pour un
 * montant : aucun de ceux que nous lisons ici n'a de raison de valoir zéro.
 */
function montantEnv(brut: string | undefined, repli: number, nom: string): number {
  if (brut == null || brut.trim() === "") return repli;
  const n = Number(brut.replace(/\s|\u202f|\u00a0/g, "").replace(",", "."));
  if (!Number.isFinite(n) || n <= 0) {
    console.warn(
      `[env] ${nom} = ${JSON.stringify(brut)} n'est pas un montant exploitable — repli sur ${repli}.`,
    );
    return repli;
  }
  return n;
}

// URL canonique de prod — source unique pour metadataBase, sitemap, robots,
// canonical (ADR-018). Surchargeable par env pour les previews Vercel.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://howner.fr";

// Réservation : jamais en dur — lue depuis l'environnement.
// Fallback passé de 5 000 à 2 000 € le 2026-08-02 (§7 de la spec, ADR-029) —
// le configurateur v2 affichait déjà 2 000 € et la page d'accueil 5 000 €.
// `NEXT_PUBLIC_RESERVATION_DEPOSIT_EUR` est posée en Preview et en production
// depuis le 2026-08-22 : c'est elle qui sert, ce littéral n'est plus qu'un
// repli. Le montant se change **sans toucher au code** — mais un redéploiement
// reste nécessaire, Next inlinant les `NEXT_PUBLIC_*` au build (ADR-003).
const DEPOSIT_EUR = montantEnv(
  process.env.NEXT_PUBLIC_RESERVATION_DEPOSIT_EUR,
  2000,
  "NEXT_PUBLIC_RESERVATION_DEPOSIT_EUR",
);

/** Montant de réservation formaté, pour les textes éditoriaux (FAQ, réassurance). */
const DEPOT = `${DEPOSIT_EUR.toLocaleString("fr-FR")} €`;

// Pool commun — Arko One + Arko Max confondus, numérotage 1→6 partagé.
//
// 6 et non 12 : arbitrage de Richard du 2026-08-04, qui annule celui du
// 2026-08-02 et remet la Série 01 sur le volume du §5 de la spec. Cette
// constante est le pool public ET celui du configurateur (`serie.unites`) :
// les deux se lisent dans le même parcours, ils ne peuvent pas diverger.
export const SERIE_TOTAL = 6;

/**
 * Échéancier de paiement — §9.3 des CGV du 2026-08-22.
 *
 * Cinq étapes, adaptées à la fabrication hors-site : 40 % au lancement (moins
 * la réservation déjà versée), 20 % au hors d'eau / hors d'air en atelier,
 * 35 % à la sortie d'atelier, 5 % à la livraison. Remplace l'échéancier en
 * quatre temps 40 / 50 / 10, qui ne comportait aucun jalon technique entre le
 * lancement et la sortie d'atelier.
 *
 * **Déclaré ici, et nulle part ailleurs.** Le même échéancier se lit dans la
 * FAQ, dans les CGV et dans le devis ; l'écrire trois fois garantit qu'un jour
 * les trois diffèrent. Les CGV le tiennent de leur markdown source
 * (`docs/legal/`), qui fait foi ; ce tableau en est le reflet éditorial, et
 * `npm run check:echeancier` vérifie qu'ils concordent.
 */
export const ECHEANCIER = [
  {
    etape: "Réservation commerciale",
    part: 0,
    montant: DEPOT,
    detail: `Versement initial de ${DEPOT}, intégralement remboursable tant que le contrat n\u2019est pas signé. Il bloque l\u2019un des ${SERIE_TOTAL} numéros de la Série 01 et s\u2019impute sur l\u2019étape suivante.`,
  },
  {
    etape: "Lancement de fabrication",
    part: 40,
    montant: "40 % du montant total",
    detail: `Facture d\u2019étape émise après signature du contrat, validation des prérequis et confirmation du lancement — déduction faite des ${DEPOT} déjà versés.`,
  },
  {
    etape: "Hors d\u2019eau / hors d\u2019air en atelier",
    part: 20,
    montant: "20 % du montant total",
    detail: "Facture d\u2019étape émise lorsque l\u2019avancement technique correspondant est atteint en atelier.",
  },
  {
    etape: "Sortie d\u2019atelier",
    part: 35,
    montant: "35 % du montant total",
    detail: "Facture d\u2019étape émise lorsque votre studio de jardin ARKO est prêt à être livré.",
  },
  {
    etape: "Livraison",
    part: 5,
    montant: "5 % du montant total",
    detail: "Solde facturé à la livraison, selon les conditions prévues au contrat.",
  },
] as const;

// Nombre de séries ouvertes (une par modèle). Le compteur de l'en-tête affiche
// les deux nombres : le total seul laissait croire à une seule série.
export const SERIE_COUNT = 2;

// Ligne d'appel — source unique : en-tête du site, en-tête du tunnel et
// JSON-LD Organization s'y branchent. Surchargeable par env pour ne pas
// dépendre d'un commit le jour où le numéro change.
const PHONE_DISPLAY =
  process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "+33 (0)5 64 37 37 14";

export const CONTACT = {
  /**
   * Adresse de contact affichée au public.
   *
   * `contact@howner.fr` et non l'adresse de l'éditeur : ADR-029 pose que
   * Howner est la seule entité citée côté client, et les CGV du 2026-08-22
   * donnent cette adresse au §1 comme au §21 (réclamations). Les pages légales
   * en affichaient une autre — un visiteur qui exerce son droit RGPD n'a pas à
   * découvrir un second nom d'entreprise au moment d'écrire.
   *
   * Déclarée ici parce qu'elle était écrite en dur à vingt-cinq endroits. Le
   * domaine mandataire, suspendu (ADR-028), garde les siennes : y toucher
   * réveillerait du code que personne ne sert.
   */
  email: "contact@howner.fr",
  /**
   * Compte Instagram officiel.
   *
   * Déclaré ici et pas dans les composants : c'est la leçon du 2026-08-22, où
   * l'adresse de contact était écrite en dur à vingt-cinq endroits. Un compte
   * social se renomme.
   */
  instagram: "https://www.instagram.com/howner_officiel/",
  instagramHandle: "@howner_officiel",
  /** Forme lue par un humain, telle qu'affichée. */
  phone: PHONE_DISPLAY,
  /* Forme composable (E.164), exigée par le protocole `tel:` et par
     schema.org. Le « (0) » est une commodité de lecture nationale : composé
     derrière l'indicatif +33, il fait échouer l'appel — on le retire. */
  phoneTel: PHONE_DISPLAY.replace("(0)", "").replace(/[^\d+]/g, ""),
  phoneLabel: "Nous appeler",
  /** Plage d'ouverture de la ligne — le texte affiché et le JSON-LD lisent
   *  la même source, `phoneHoursSpec` en étant la traduction machine. */
  phoneDays: "Du lundi au vendredi",
  phoneHours: "9 h–12 h et 14 h–18 h",
} as const;

/**
 * Identification de l'entité éditrice — bloc NAP (Name / Address / Phone).
 *
 * Source **unique** : le pied de page l'affiche, `jsonld.ts` en dérive
 * l'`Organization.address`. L'adresse était écrite en dur dans `jsonld.ts` ;
 * la rendre visible sans la centraliser aurait créé deux vérités, et un NAP
 * incohérent entre le texte et les données structurées est précisément ce que
 * les moteurs sanctionnent.
 *
 * ⚠ `legalName` nomme une raison sociale autre que Howner, ce qu'ADR-029 §45
 * interdit côté client. Exception assumée et datée (ADR-029 § Amendement du
 * 2026-08-17) : identifier l'éditeur réel est une obligation légale, et
 * l'ADR notait déjà cette règle « inapplicable à la lettre » sur ce point.
 * Le périmètre de l'exception est ce bloc d'identification, pas le discours
 * commercial — aucune autre surface ne nomme AHF.
 *
 * Casse conservée en Titre et non en CAPITALES : `DESIGN.md` impose la
 * sentence case, et les pages légales portent déjà cette graphie.
 */
export const COMPANY = {
  /** Ce qui s'affiche : la marque d'abord, l'éditeur ensuite. */
  displayName: "Howner by Affinity House Factory",
  legalName: "Affinity House Factory",
  street: "28 Chemin de Sabalce OEV",
  postalCode: "64100",
  city: "Bayonne",
  country: "France",
  countryCode: "FR",
} as const;

/** Adresse sur une ligne — pied de page et méta. */
export const COMPANY_ADDRESS_LINE = `${COMPANY.street}, ${COMPANY.postalCode} ${COMPANY.city}`;

/* Même plage, au format schema.org (`ContactPoint.hoursAvailable`) : deux
   créneaux, la coupure de midi devant rester visible d'un moteur. */
export const PHONE_HOURS_SPEC = [
  { opens: "09:00", closes: "12:00" },
  { opens: "14:00", closes: "18:00" },
] as const;

export const BRAND = {
  maker: "HOWNER",
  model: "ARKO",
  /* Titre principal de l'accueil (`<h1>` du Hero) — décidé par Richard le
     2026-08-19 avec le repositionnement « studio de jardin ».
     Distinct de `baseline` : le `<h1>` doit nommer la catégorie et la marque
     pour le référencement, là où la baseline est une signature éditoriale
     rendue en très grand au pied de page. Les deux ne se déduisent pas l'une
     de l'autre — la ponctuation même diffère — d'où deux constantes. */
  h1: "Studios de jardin Howner, un espace supplémentaire dessiné pour vous",
  baseline: "Un espace supplémentaire, dessiné pour vous",
  subline:
    "Deux modèles d'architecte, livrés prêts à vivre. Fabriqués au Pays-Basque.",
  series: "Série 01",
  total: SERIE_TOTAL, // pool commun (One + Max confondus)
  reserved: 3, // placeholder Phase 1 — Supabase Realtime Phase 4 (ADR-009)
  deposit: DEPOSIT_EUR,
  area: "40 m²", // compat héritée (= Arko Max) — préférer PRODUCTS[key].area
  footprint: "4 × 11 m", // compat héritée (= Arko Max)
  location: "Pays Basque",
  // ADR-029 § Amendement du 2026-08-19 : repassé au MASCULIN, « studio » l'étant.
  // ADR-029 — il avait été accordé au féminin le 2026-08-03, sous le terme
  // imposé d'alors. Rendu en libellé isolé sur 4 surfaces : l'accord se décide
  // donc ici, pas chez l'appelant, qui n'a aucun moyen de le corriger.
  madeIn: "Fabriqué au Pays-Basque", // rendu UI (ADR-022)
} as const;

export const MANIFESTO =
  "On a retiré les mètres carrés superflus. Pas la lumière, pas la hauteur, pas le soin. Arko est pensé par notre architecte intégrée comme un lieu de vie entier — simplement plus juste.";

export const PROMISE =
  "Un studio de jardin d'architecte fabriqué Hors-Site dans notre atelier, livré prêt à vivre, en 12 semaines.";

// Paramètres transport convoi — source de vérité en DB (config_variables namespace 'transport').
// Fallback env/constante jusqu'à implémentation du chargement DB (Phase 4).
export const TRANSPORT = {
  tarifEurTonneKm: 0.24,   // €/tonne/km — DB: transport.tarif_eur_tonne_km
  grutageEur: montantEnv(
    process.env.NEXT_PUBLIC_DELIVERY_GRUTAGE_EUR,
    1440,
    "NEXT_PUBLIC_DELIVERY_GRUTAGE_EUR",
  ),
  roadFactor: 1.3,          // haversine → distance route (×1.3)
  usine: { lat: 43.4933, lon: -1.4748 }, // Bayonne — à affiner avec adresse exacte atelier
  poids: { one: 6, max: 9 } as Record<string, number>, // tonnes par produit
} as const;

// Prix — base & livraison en env (jamais en dur), grille d'options en données.
// ADR-029 : grille §5 de la spec configurateur v2 — Arko Max 99 900 € TTC
// (TVA 20 %, construction neuve). Remplace l'ancien 89 900 €.
export const PRICING = {
  base: montantEnv(process.env.NEXT_PUBLIC_ARKO_BASE_EUR, 99900, "NEXT_PUBLIC_ARKO_BASE_EUR"),
  perM2: 2250,
  terrassePerM2: 300,
  delivery: {
    grutage: TRANSPORT.grutageEur,
    // perKm = poids Arko Max × tarif/tonne/km (DB: transport.poids_arko_max_tonnes × tarif_eur_tonne_km)
    perKm: montantEnv(
      process.env.NEXT_PUBLIC_DELIVERY_PER_KM_EUR,
      +(TRANSPORT.poids.max * TRANSPORT.tarifEurTonneKm).toFixed(4),
      "NEXT_PUBLIC_DELIVERY_PER_KM_EUR",
    ),
    origin: "Bayonne",
  },
  options: [
    { id: "cuisine_premium", label: "Pack Cuisine Premium", price: 4200 },
    { id: "sdb_premium", label: "Pack Salle d'eau Premium", price: 3360 },
    { id: "poele", label: "Poêle à bois", price: 5400 },
    { id: "solaire", label: "Pack Solaire", price: 5880 },
    { id: "domotique", label: "Pack Domotique", price: 2640 },
  ],
  // Couche 3 — frais complémentaires, hors proposition, jamais dans le total du studio.
  landFees: [
    { label: "Étude de sol G2 si souhaité", value: "Estimé à partir de 2 400 €" },
    { label: "Assainissement (micro-station)", value: "Estimé à 9 000 €" },
    { label: "Raccordements · terrassement · accès grue", value: "Étude sur site externe (ENEDIS, etc.)" },
    { label: "Permis de construire + taxe d'aménagement", value: "selon commune" },
  ],
} as const;

/* ============================================================
   PRODUITS — registre bi-produit (ADR-022)
   Arko Max = produit historique (= PRICING/SPECS/BRAND ci-dessus).
   Arko One = nouveau modèle 20 m². Les valeurs marquées TODO ARKO ONE
   sont des PLACEHOLDERS provisoires (en attente des vraies données
   métier) — jamais inventées comme définitives. base/area/total/ex
   sont confirmés (69 900 € / 20 m² — ADR-029 § Amendement du 2026-08-22).
   Montants en env via fallback (ADR-003), jamais en dur ailleurs.
   ============================================================ */

// Grille tarifaire Arko One (20 m²) — provisoire (TODO ARKO ONE).
// Arko One **69 900 € TTC** (TVA 20 %, construction neuve) depuis le
// 2026-08-22 — ADR-029 § Amendement du 2026-08-22, arbitrage de Richard et
// Albert. Corrige le 77 900 € issu du §5 de la spec, qui n'avait jamais été
// le tarif de base voulu. Historique : 59 900 € avant ADR-029.
//
// `NEXT_PUBLIC_ARKO_ONE_BASE_EUR` est posée en Preview et en production depuis
// le 2026-08-22 (ADR-003 enfin appliqué) : elle prime, ce littéral dépanne.
// Un prix se corrige donc sans commit ni PR — un redéploiement suffit, Next
// inlinant les `NEXT_PUBLIC_*` au build. Une valeur mal saisie ne doit pas
// pour autant afficher 0 €, d'où `montantEnv`.
const ONE_PRICING = {
  base: montantEnv(process.env.NEXT_PUBLIC_ARKO_ONE_BASE_EUR, 69900, "NEXT_PUBLIC_ARKO_ONE_BASE_EUR"),
  perM2: 2250, // TODO ARKO ONE : confirmer €/m²
  terrassePerM2: 300, // TODO ARKO ONE : confirmer
  delivery: {
    grutage: TRANSPORT.grutageEur,
    // perKm = poids Arko One × tarif/tonne/km (DB: transport.poids_arko_one_tonnes × tarif_eur_tonne_km)
    perKm: montantEnv(
      process.env.NEXT_PUBLIC_ARKO_ONE_DELIVERY_PER_KM_EUR,
      +(TRANSPORT.poids.one * TRANSPORT.tarifEurTonneKm).toFixed(4),
      "NEXT_PUBLIC_ARKO_ONE_DELIVERY_PER_KM_EUR",
    ),
    origin: "Bayonne",
  }, // TODO ARKO ONE : confirmer poids exact
  options: PRICING.options, // TODO ARKO ONE : grille options propre à confirmer
  landFees: PRICING.landFees,
} as const;

export type ProductKey = "one" | "max";

export const PRODUCTS = {
  one: {
    key: "one" as const,
    name: "Arko One",
    /* Slug allongé le 2026-08-19 : la requête visée est « studio de jardin »,
       pas « arko one », que personne ne cherche. L'ancienne URL est indexée
       depuis juin — une redirection permanente la couvre (`next.config.ts`),
       sans quoi le référencement acquis serait perdu. */
    slug: "/studio-jardin-arko-one",
    tagline: "20 m² d'architecte, l'essentiel juste.",
    /* `<h1>` de la page produit. Porte la catégorie, que `name` ne dit pas. */
    h1: "Studio de jardin de 20 m² d'architecte, l'essentiel juste",
    area: "20 m²",
    footprint: "6,65 × 3,60 m", // ADR-029 — emprise §5 de la spec configurateur v2
    total: SERIE_TOTAL, // pool partagé One + Max
    reserved: 2, // démo Phase 1 — persistance Supabase Realtime en Phase 4 (ADR-009)
    series: "Série 01",
    pricing: ONE_PRICING,
    /* TODO ARKO ONE : `turntable.mp4` est le rendu **40 m²**, servi ici faute
       d'asset 20 m². Richard a demandé le 2026-08-19 de le conserver sur
       l'Arko One ; ça ne le rend pas juste pour autant — d'où
       `placeholderMedia` maintenu, qui affiche « visuel provisoire » sous la
       vidéo. L'Arko Max ayant désormais le sien, ce fichier ne sert plus
       qu'ici. */
    video: "/assets/arko/video/turntable.mp4",
    poster: "/assets/arko/video/turntable-poster.jpg",
    /* Rendu détouré, servi dans le méga-menu et le menu mobile. Sur fond
       transparent : le volume se pose sur la carte sans y découper un
       rectangle, et la même image sert quel que soit le fond. */
    vignette: "/assets/arko/vignettes/one.avif",
    scrub: "/assets/arko/video/film-scrub.mp4",
    scrubPoster: "/assets/arko/video/film-scrub-poster.jpg",
    placeholderMedia: true, // ⚠ assets provisoires (= Arko Max) — à remplacer
  },
  max: {
    key: "max" as const,
    name: "Arko Max",
    slug: "/studio-jardin-arko-max",
    tagline: "40 m² d'architecte, livrés prêts à vivre.",
    /* ⚠ Texte dicté par Richard le 2026-08-19, repris tel quel. Le pluriel
       « livrés prêts » ne s'accorde pas avec le singulier « Studio » — repli
       de l'ancien « Deux maisons … livrées prêtes » (ADR-029). Signalé, non corrigé
       d'autorité : c'est de la copie de marque. */
    h1: "Studio de jardin de 40 m² d'architecte, livrés prêts à vivre.",
    area: BRAND.area,
    footprint: BRAND.footprint,
    total: SERIE_TOTAL, // pool partagé One + Max
    reserved: 1, // démo Phase 1 — persistance Supabase Realtime en Phase 4 (ADR-009)
    series: BRAND.series,
    pricing: PRICING,
    /* Média propre à l'Arko Max depuis le 2026-08-19 : les deux produits
       servaient jusque-là le même `turntable.mp4`. Monté à partir des quatre
       rendus extérieurs fournis par Richard (Drive `plans_visuels`).

       ⚠ Ce n'est PAS un turntable, malgré le nom retenu par symétrie : les
       quatre sources ne couvrent que deux positions de caméra (trois cadrages
       3/4 quasi identiques, plus une façade frontale). Une rotation en
       demanderait douze à trente-six. C'est un fondu enchaîné en boucle, avec
       un léger mouvement d'échelle. Le jour où de vraies vues de rotation
       existent, remplacer le fichier suffit — rien d'autre à toucher.

       Débit aligné sur celui de l'Arko One (1,49 Mbps) : même budget visuel
       par seconde, clip simplement plus long (11,8 s contre 8 s). Le premier
       plan de la vidéo sert d'affiche, pour qu'aucun saut ne se voie au
       lancement. `preload="none"` sur l'accueil (ADR-006) : les 2,2 Mo ne
       partent qu'à la lecture. */
    video: "/assets/arko/video/turntable-max.mp4",
    poster: "/assets/arko/video/turntable-max-poster.jpg",
    vignette: "/assets/arko/vignettes/max.avif",
    scrub: "/assets/arko/video/film-scrub.mp4",
    scrubPoster: "/assets/arko/video/film-scrub-poster.jpg",
    placeholderMedia: false,
  },
} as const;

export type Product = (typeof PRODUCTS)[ProductKey];

export const PRODUCT_LIST = [PRODUCTS.one, PRODUCTS.max] as const;

/**
 * Destination de tous les CTA « Réserver » du site public (ADR-030).
 *
 * Une constante et non huit chaînes en dur : le tunnel v2 vit sur
 * `/configurer/v2` le temps de la validation, et la bascule vers `/configurer`
 * (après ADR-031) doit être **une seule ligne**, pas une chasse dans les
 * composants. Ne pas contourner cette fonction.
 *
 * Hors périmètre : les liens qui portent un paramètre propre au tunnel v1
 * (`?parcelle=`, `?pack=`) — le v2 ne les lit pas.
 */
export const RESERVER_PATH = "/configurer/v2";

export function reserverHref(produit?: ProductKey) {
  return produit ? `${RESERVER_PATH}?produit=${produit}` : RESERVER_PATH;
}

export const getProduct = (key: string | null | undefined): Product =>
  key === "one" ? PRODUCTS.one : PRODUCTS.max;

/* ============================================================
   FOMO — fin des réservations Série 01
   Date cible exposée comme constante, lue par useCountdown + bandeau.
   À ajuster avec Albert si besoin (alerte si modifié).
   ============================================================ */
export const SERIES_DEADLINE_ISO = "2026-07-17T23:59:59+02:00";
export const SERIES_DEADLINE_LABEL = "Fin des réservations Série 01";

export const REASSURANCE_INTRO = [
  {
    t: "Notre insight et expertise",
    d: "Chaque ARKO est dessinée et suivie par notre architecte intégrée, de l'esquisse à la pose.",
  },
  {
    t: "Le savoir-faire d'atelier",
    d: "Montée et finie au sol, à l'abri. Une précision d'atelier, un délai maîtrisé de 12 semaines.",
  },
] as const;

export const REASSURANCE = [
  {
    t: "Premier contact",
    d: "30 min en visio avec notre architecte intégrée pour valider votre projet et recevoir votre devis.",
  },
  {
    t: "Devis signé, nous réservons votre ARKO",
    d: `Vous réservez votre numéro avec ${DEPOT} remboursables. Sans engagement de construction.`,
  },
] as const;

export const FAQ: { q: string; a: string | string[] }[] = [
  {
    q: "Quel est le délai ?",
    a: [
      "La fabrication de votre studio de jardin ARKO en atelier dure environ **12 semaines**, à compter de la levée des conditions prévues au contrat : autorisation d'urbanisme obtenue, financement confirmé, terrain accessible et fondations ou supports d'accueil réceptionnés.",
      "L'installation sur site est ensuite généralement réalisée en **une journée**, sous réserve des conditions d'accès, de météo et de préparation du terrain.",
      "À chaque étape importante — lancement, structure, finitions, studio prêt à livrer, installation — vous êtes informé par email.",
    ],
  },
  {
    q: "Et si je n'ai pas encore de terrain ?",
    // La réponse renvoyait à la rubrique « Terrains » et aux partenaires
    // mandataires — suspendus (ADR-028). Repli sur le contact direct tant que
    // le dispositif n'est pas réactivé.
    a: FEATURES.mandataire
      ? "Si vous partez de zéro, nous vous proposons une sélection de terrains dans notre rubrique « Terrains » : des terrains sélectionnés par nos partenaires Mandataires. Sélectionnez-le et nous vous contactons pour faire le point sur sa disponibilité et vos options concernant votre studio de jardin ARKO. Aucun ne vous intéresse ? Nous restons à votre écoute, et ferons le nécessaire pour vous mettre en relation avec des partenaires de confiance."
      : "L'acquisition du terrain relève de vous. Si vous n'en avez pas encore, écrivez-nous : nous faisons le point sur votre projet, le modèle ARKO envisagé et les contraintes de la parcelle que vous visez. Vous pouvez aussi vérifier dès maintenant la compatibilité d'une parcelle depuis le configurateur, en renseignant son adresse.",
  },
  {
    q: "Comment se passe le paiement ?",
    a: [
      "Après un premier échange téléphonique, nous vous adressons par email une proposition commerciale comprenant le modèle ARKO retenu, les principales caractéristiques techniques, les options choisies et une estimation du calendrier de fabrication, de livraison et d'installation.",
      `Pour confirmer votre intérêt et réserver votre projet, un versement initial de ${DEPOT} vous est demandé. Il bloque l\u2019un des ${SERIE_TOTAL} numéros de la Série 01.`,
      "Ce versement est intégralement remboursable tant que le contrat de fabrication, livraison et installation n'a pas été signé. Vous pouvez donc renoncer à votre projet avant cette signature, sans avoir à justifier votre décision.",
      `Une fois le contrat signé, ce versement de ${DEPOT} est déduit du prix total de votre studio de jardin ARKO et intégré à l\u2019échéancier de paiement.`,
      "Le règlement s'effectue ensuite en cinq étapes, adaptées à la fabrication hors-site (§9.3 des CGV) :",
      /* Dérivé d'`ECHEANCIER` : la FAQ ne réécrit pas les pourcentages, elle les
         lit. Une correction des CGV se propage ici sans qu'on y pense. */
      ...ECHEANCIER.map(
        (e, n) => `Étape ${n + 1} — ${e.etape}\n${e.detail}`,
      ),
      "Aucun paiement n'est encaissé depuis le site : le lien de règlement vous parvient après l'échange de qualification. La réception donne lieu à l'établissement d'un procès-verbal.",
      "Il est précisé que l'acquisition éventuelle du terrain relève exclusivement du client et donne lieu, le cas échéant, à la signature d'un acte notarié établi en bonne et due forme.",
      "Affinity House Factory n'intervient pas dans l'opération d'achat du terrain, ni dans les formalités juridiques, administratives ou notariales qui y sont attachées.",
      // Mention des mandataires partenaires — retirée tant que le dispositif
      // est suspendu (ADR-028) : plus aucun mandataire n'est mobilisé.
      ...(FEATURES.mandataire
        ? ["Les mandataires partenaires susceptibles d'accompagner le client dans sa recherche de terrain interviennent sous leur seule responsabilité, dans le cadre de leur propre activité professionnelle. Leur intervention est distincte de celle d'Affinity House Factory."]
        : []),
    ],
  },
  {
    // §5 de la spec : les options qui entrent dans l'étude d'exécution de
    // l'ossature ne sont plus ajoutables après la réservation. Le configurateur
    // v2 le mentionne à l'écran ; la FAQ le taisait, ce qui laissait croire
    // qu'on pouvait tout arbitrer plus tard.
    q: "Puis-je modifier mes options après avoir réservé ?",
    a: [
      "Les finitions et les équipements dissociables restent ajustables jusqu'au lancement de la fabrication.",
      "Trois options font exception : la **casquette pare-soleil**, le **poêle à bois** et le **kit solaire photovoltaïque**. Elles entrent dans l'étude d'exécution de l'ossature, qui est figée à la réservation — elles se choisissent donc avant, et ne peuvent pas être ajoutées ensuite.",
      "Le configurateur les signale comme telles au moment du choix.",
    ],
  },
  {
    q: "Quelles garanties ?",
    a: [
      "Votre studio de jardin ARKO bénéficie des garanties légales applicables aux travaux réalisés : parfait achèvement pendant 1 an, bon fonctionnement des équipements dissociables pendant 2 ans, et garantie décennale pendant 10 ans pour les dommages affectant la solidité de l'ouvrage ou son usage.",
      "La garantie décennale est attachée au studio et se transmet en cas de revente pendant sa durée de validité.",
      "L'assurance dommages-ouvrage reste à la charge du client et doit être souscrite avant l'ouverture du chantier lorsque la réglementation l'exige.",
    ],
  },
  {
    q: "Et l'après-vente ?",
    a: [
      "Après l'installation, un interlocuteur dédié reste votre référent technique.",
      "Il vous accompagne dans le suivi de votre studio de jardin ARKO, le traitement des éventuelles réserves et les désordres signalés après réception.",
      "Les désordres relevant de la garantie de parfait achèvement sont traités sans frais dans l'année suivant la réception, sous réserve qu'ils concernent les prestations réalisées par Affinity House Factory ou ses intervenants.",
    ],
  },
];

// Navigation principale par routes (multi-pages — ADR-021).
// « Produits » est rendu à part (méga-menu Tesla) via PRODUCT_LIST.
// « Terrains » dépend du réseau mandataire : masqué tant qu'il est suspendu
// (ADR-028). Filtrer ici plutôt que chez les consommateurs (Nav + Footer)
// garde un point de vérité unique.
export const NAV: { label: string; href: string }[] = [
  ...(FEATURES.mandataire ? [{ label: "Terrains", href: "/terrains" }] : []),
  { label: "À propos", href: "/a-propos" },
  { label: "Contact",  href: "/contact" },
];

// Liens « Informations » (footer + légal). Contenu réel CGV/etc. bloqué ADR-015.
export const INFO_NAV = [
  { label: "CGV", href: "/cgv" },
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "Confidentialité", href: "/confidentialite" },
  { label: "Contact", href: "/contact" },
] as const;

/* — Comment ça se passe — (terrasse JAMAIS visible en transport/levage) */
export const PROCESS = [
  {
    step: "01",
    title: "L'atelier",
    text: "Fabriqué entier, à l'abri, à la précision du millimètre. Pendant que le terrain se prépare, le studio prend forme — sans pluie, sans aléa.",
  },
  {
    step: "02",
    title: "Les fondations",
    text: "Pas de dalle, pas de gros œuvre : des technopieux vissés dans le sol, posés en une journée. Empreinte légère, sol préservé.",
  },
  {
    step: "03",
    title: "La route",
    text: "Terminée, elle part en un seul bloc, sur convoi, jusqu'à votre terrain. Elle voyage finie : cuisine, salle de bain, sols déjà là.",
  },
  {
    step: "04",
    title: "La pose",
    text: "Le jour J, une grue la dépose sur ses fondations. En quelques heures : posé, de niveau, raccordé. Pas un chantier de plusieurs mois — un lieu de vie.",
  },
  {
    step: "05",
    title: "Les réseaux",
    text: "Eau, électricité, assainissement : raccordement aux réseaux du terrain. Ce qu'il faut prévoir dépend de la parcelle, évalué avec vous.",
  },
] as const;

export const PROCESS_CONCLUSION =
  "Vous ne vivez pas un chantier de plusieurs mois. Vous recevez un espace fini, prêt à vivre.";

/* — Préparer votre terrain : les préparatifs côté parcelle, reliés à l'outil terrain — */
export const LAND_PREP = [
  {
    k: "Étude de sol G2",
    v: "dès 2 400 €",
    d: "On vérifie la portance du terrain et on cale les fondations en conséquence.",
  },
  {
    k: "Viabilisation & réseaux",
    v: "VRD",
    d: "Eau, électricité et assainissement amenés jusqu'en limite de parcelle.",
  },
  {
    k: "Accès convoi & grue",
    v: "le jour J",
    d: "Un passage dégagé pour le convoi et la grue, le temps de la pose.",
  },
  {
    k: "Permis",
    v: "DP ou PC",
    d: "Déclaration préalable ou permis de construire, selon votre commune.",
  },
] as const;

/* — À propos (page `/a-propos`) —
   Source éditoriale : `docs/specs/page-about-howner.md` (Albert, 17/08/2026),
   versée au dépôt depuis le Drive partagé pour que la page cite un chemin
   stable, comme la spec configurateur (ADR-029).

   Deux écarts au texte source, tous deux imposés par ADR-029 :
   - le bureau d'études partenaire y était nommé, avec un lien sortant. Le §67
     d'ADR-029 est sans réserve — « Howner est la seule entité citée côté
     client. Aucun nom de fournisseur, de sous-traitant ou de partenaire
     n'apparaît, y compris dans les descriptifs techniques. » L'existence du
     bureau d'études est conservée (c'est l'argument), son nom retiré.
   - « habitat » remplace les tournures qui suggéraient un logement autonome :
     le cadre de vente reste l'annexe sur parcelle bâtie ou l'hébergement
     professionnel (§1), et cette page n'est pas l'endroit où l'élargir.

   « studio de jardin » est le terme imposé depuis l'amendement du 2026-08-19,
   qui remplace « maison » (ADR-029) — accord au **masculin** partout. */
export const ABOUT = {
  /* Pas de numéro de section ici : la numérotation « 001 / 003 / 012 » est
     celle des sections de l'accueil, la réemployer sur une autre page ferait
     croire à une suite. */
  eyebrow: "À propos",
  kicker: "Quand la précision du geste sublime l'art de vivre",
  title: "L'ADN Howner.",
  quote:
    "L'architecture d'avant-garde au service de votre liberté : un espace durable et chaleureux, pensé pour l'essentiel.",
  sections: [
    {
      id: "philosophie",
      step: "01",
      eyebrow: "Notre philosophie",
      title: "Vivre grand dans un espace essentiel.",
      points: [
        {
          k: "Le manifeste",
          d: "Howner est né d'une conviction : le luxe ne réside pas dans le superflu, mais dans la justesse d'un espace pensé pour soi.",
        },
        {
          k: "Le design",
          d: "Nos modèles Arko One et Arko Max sont de véritables écrins d'architecte, où chaque ligne invite à la sérénité et à la reconnexion avec l'extérieur.",
        },
        {
          k: "L'expérience",
          d: "Habiter un studio de jardin Howner, c'est savourer la lumière qui traverse des volumes épurés et redécouvrir le confort absolu d'un espace qui va à l'essentiel.",
        },
      ],
    },
    {
      id: "acier-leger",
      step: "02",
      eyebrow: "L'acier léger",
      title: "Une armature secrète pour des volumes libres.",
      intro:
        "Derrière la poésie de nos intérieurs chaleureux se cache une révolution structurelle : l'ossature acier léger.",
      points: [
        {
          k: "Une liberté totale",
          d: "La force de cette ossature en acier léger libère l'espace en supprimant les poteaux porteurs traditionnels. Les fenêtres s'agrandissent, les perspectives s'ouvrent, et la nature s'invite chez vous.",
        },
        {
          k: "La précision millimétrique",
          d: "Modélisée entièrement en 3D, la structure s'assemble à la perfection, comme une pièce de haute horlogerie — une isolation thermique et acoustique idéale, pour un intérieur qui reste tempéré en toute saison.",
        },
      ],
    },
    {
      id: "ingenierie",
      step: "03",
      eyebrow: "L'ingénierie invisible",
      title: "L'excellence du geste technique.",
      intro:
        "Pour donner vie à cette vision, Howner conjugue la sensibilité architecturale à la rigueur de l'Usine 4.0, en s'appuyant sur l'expertise d'un bureau d'études structure indépendant.",
      points: [
        {
          k: "Une conception sur-mesure",
          d: "Chaque courbe, chaque ouverture imaginée par notre architecte intégrée est certifiée par une ingénierie de pointe, assurant à votre studio une robustesse absolue face au temps.",
        },
        {
          k: "La fabrication de précision",
          d: "Le passage direct de la modélisation intelligente aux robots de fabrication permet de pré-percer chaque gaine technique. Tout est fluide, invisible et parfaitement intégré, pour laisser place à la beauté brute des matériaux.",
        },
      ],
    },
    {
      id: "eco-responsabilite",
      step: "04",
      eyebrow: "Ancrée dans le futur",
      title: "Un studio respectueux.",
      points: [
        {
          k: "Éco-responsabilité",
          d: "Parce que le respect du paysage est au cœur de notre démarche, la légèreté de l'acier limite l'impact sur les sols et évite les lourdes fondations.",
        },
        {
          k: "Une empreinte durable",
          d: "L'acier utilisé est indéfiniment recyclable. Fabriquées Hors-Site dans notre atelier avec un objectif zéro déchet, nos structures marient l'amour du design et le respect de la Terre.",
        },
      ],
    },
  ],
} as const;

/* — Caractéristiques — */
export const SPECS = [
  { k: "Surface habitable", v: "40 m²" },
  { k: "Emprise", v: "4 × 11 m — un bloc" },
  { k: "Configuration", v: "T2 — séjour-cuisine, 1 chambre, salle de bain" },
  { k: "Livraison", v: "Prêt à vivre" },
  { k: "Délai", v: "12 semaines" },
  { k: "Fondations", v: "Technopieux" },
  { k: "Toiture", v: "Plate, étanchéité multicouche" },
  { k: "Bardage", v: "Lames verticales, 4 teintes" },
  { k: "Vitrages", v: "Triple, angle vitré en retrait" },
  { k: "Isolation", v: "Renforcée, confort 4 saisons" },
  { k: "Terrasse", v: "Bois sur pilotis, intégrée" },
  { k: "Série", v: `01 — ${SERIE_TOTAL} exemplaires numérotés` },
] as const;

export const INCLUDED = [
  "Le studio complet, prêt à vivre",
  "Cuisine & salle de bain équipées",
  "Fondations technopieux",
  "Raccordements jusqu'à 20 ml",
  "Transport & pose",
] as const;

export const ON_YOU = [
  "L'achat du terrain",
  "Le terrassement & l'accès chantier",
  "Les raccordements au-delà de 20 ml",
  "L'aménagement extérieur",
  "Taxes & autorisations",
] as const;

/* — Configurateur — */
export const CONFIG = {
  // Recoloration fidèle : teinte en mix-blend « color » (luminance
  // préservée) + « lift » blanc masqué pour les teintes claires.
  cladding: [
    { id: "anthracite", label: "Anthracite", hex: "#3a3f3c", tint: null, lift: 0 },
    { id: "gris", label: "Gris clair", hex: "#bcbeb9", tint: "#c7c9c4", lift: 0.46 },
    { id: "bleu", label: "Bleu pigeon", hex: "#5d7d8f", tint: "#5d7d8f", lift: 0.12 },
    { id: "vert", label: "Vert", hex: "#5a6a43", tint: "#62733f", lift: 0.07 },
  ],
  kitchen: [
    { id: "fonce", label: "Îlot façade foncée" },
    { id: "clair", label: "Îlot façade claire" },
  ],
  bar: [
    { id: "avec", label: "Îlot avec barre" },
    { id: "sans", label: "Îlot sans barre" },
  ],
  bedroom: [
    { id: "naturel", label: "Chêne naturel", filter: "none" },
    { id: "ardoise", label: "Reflet ardoise", filter: "saturate(0.7) brightness(0.97)" },
    { id: "olive", label: "Touche olive", filter: "saturate(1.15) hue-rotate(-8deg)" },
  ],
  interior: [
    { id: "bois", label: "Intérieur bois", filter: "none" },
    { id: "placo", label: "Intérieur clair", filter: "brightness(1.12) saturate(0.6)" },
  ],
} as const;
