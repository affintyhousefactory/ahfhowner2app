/* ============================================================
   HOWNER / ARKO — source de contenu
   Règles de marque ABSOLUES respectées : aucun terme interdit
   (modulaire, préfabriqué, tiny house, conteneur, catalogue).
   « notre architecte intégrée » sans prénom. Fondateur = Puigbo
   (sans accent). [ADR-004, révisé 2026-07-09]
   ============================================================ */

import { FEATURES } from "@/lib/features";

// URL canonique de prod — source unique pour metadataBase, sitemap, robots,
// canonical (ADR-018). Surchargeable par env pour les previews Vercel.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://howner.fr";

// Acompte : jamais en dur — lu depuis l'environnement (fallback 5000).
const DEPOSIT_EUR = Number(
  process.env.NEXT_PUBLIC_RESERVATION_DEPOSIT_EUR ?? 5000,
);

// Pool commun de 12 exemplaires — Arko One + Arko Max confondus, numérotage 1→12 partagé.
export const SERIE_TOTAL = 12;

export const BRAND = {
  maker: "HOWNER",
  model: "ARKO",
  baseline: "Une maison compacte faite pour vous",
  subline:
    "Deux modèles d'architecte, livrés prêts à vivre. Fabriqués au Pays-Basque.",
  series: "Série 01",
  total: 12, // pool commun = SERIE_TOTAL (One + Max confondus)
  reserved: 3, // placeholder Phase 1 — Supabase Realtime Phase 4 (ADR-009)
  deposit: DEPOSIT_EUR,
  area: "40 m²", // compat héritée (= Arko Max) — préférer PRODUCTS[key].area
  footprint: "4 × 11 m", // compat héritée (= Arko Max)
  location: "Pays Basque",
  madeIn: "Fabriqué au Pays-Basque", // rendu UI (ADR-022)
} as const;

export const MANIFESTO =
  "On a retiré les mètres carrés superflus. Pas la lumière, pas la hauteur, pas le soin. Arko est pensée par notre architecte intégrée comme une maison entière — simplement plus juste.";

export const PROMISE =
  "Une maison d'architecte fabriquée Hors-Site dans notre atelier, livrée prête à vivre, en 12 semaines.";

// Paramètres transport convoi — source de vérité en DB (config_variables namespace 'transport').
// Fallback env/constante jusqu'à implémentation du chargement DB (Phase 4).
export const TRANSPORT = {
  tarifEurTonneKm: 0.24,   // €/tonne/km — DB: transport.tarif_eur_tonne_km
  grutageEur: Number(process.env.NEXT_PUBLIC_DELIVERY_GRUTAGE_EUR ?? 1440),
  roadFactor: 1.3,          // haversine → distance route (×1.3)
  usine: { lat: 43.4933, lon: -1.4748 }, // Bayonne — à affiner avec adresse exacte atelier
  poids: { one: 6, max: 9 } as Record<string, number>, // tonnes par produit
} as const;

// Prix — base & livraison en env (jamais en dur), catalogue d'options en données.
// ADR-029 : grille §5 de la spec configurateur v2 — Arko Max 99 900 € TTC
// (TVA 20 %, construction neuve). Remplace l'ancien 89 900 €.
export const PRICING = {
  base: Number(process.env.NEXT_PUBLIC_ARKO_BASE_EUR ?? 99900),
  perM2: 2250,
  terrassePerM2: 300,
  delivery: {
    grutage: TRANSPORT.grutageEur,
    // perKm = poids Arko Max × tarif/tonne/km (DB: transport.poids_arko_max_tonnes × tarif_eur_tonne_km)
    perKm: Number(process.env.NEXT_PUBLIC_DELIVERY_PER_KM_EUR ?? +(TRANSPORT.poids.max * TRANSPORT.tarifEurTonneKm).toFixed(4)),
    origin: "Bayonne",
  },
  options: [
    { id: "cuisine_premium", label: "Pack Cuisine Premium", price: 4200 },
    { id: "sdb_premium", label: "Pack Salle d'eau Premium", price: 3360 },
    { id: "poele", label: "Poêle à bois", price: 5400 },
    { id: "solaire", label: "Pack Solaire", price: 5880 },
    { id: "domotique", label: "Pack Domotique", price: 2640 },
  ],
  // Couche 3 — frais complémentaires, hors proposition, jamais dans le total maison.
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
   sont confirmés (77 900 € / 20 m² — grille §5 de la spec, ADR-029).
   Montants en env via fallback (ADR-003), jamais en dur ailleurs.
   ============================================================ */

// Grille tarifaire Arko One (20 m²) — provisoire (TODO ARKO ONE).
// ADR-029 : grille §5 de la spec configurateur v2 — Arko One 77 900 € TTC
// (TVA 20 %, construction neuve). Remplace l'ancien 59 900 €.
const ONE_PRICING = {
  base: Number(process.env.NEXT_PUBLIC_ARKO_ONE_BASE_EUR ?? 77900),
  perM2: 2250, // TODO ARKO ONE : confirmer €/m²
  terrassePerM2: 300, // TODO ARKO ONE : confirmer
  delivery: {
    grutage: TRANSPORT.grutageEur,
    // perKm = poids Arko One × tarif/tonne/km (DB: transport.poids_arko_one_tonnes × tarif_eur_tonne_km)
    perKm: Number(process.env.NEXT_PUBLIC_ARKO_ONE_DELIVERY_PER_KM_EUR ?? +(TRANSPORT.poids.one * TRANSPORT.tarifEurTonneKm).toFixed(4)),
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
    slug: "/arko-one",
    tagline: "20 m² d'architecte, l'essentiel juste.",
    area: "20 m²",
    footprint: "6,65 × 3,60 m", // ADR-029 — emprise §5 de la spec configurateur v2
    total: 12, // SERIE_TOTAL — pool partagé One + Max
    reserved: 2, // démo Phase 1 — persistance Supabase Realtime en Phase 4 (ADR-009)
    series: "Série 01",
    pricing: ONE_PRICING,
    // Média scroll-zoom propre (TODO ARKO ONE : asset 20 m² absent du repo —
    // fallback provisoire sur le footage 40 m²). Remplacer dès livraison.
    video: "/assets/arko/video/turntable.mp4",
    poster: "/assets/arko/video/turntable-poster.jpg",
    scrub: "/assets/arko/video/film-scrub.mp4",
    scrubPoster: "/assets/arko/video/film-scrub-poster.jpg",
    placeholderMedia: true, // ⚠ assets provisoires (= Arko Max) — à remplacer
  },
  max: {
    key: "max" as const,
    name: "Arko Max",
    slug: "/arko-max",
    tagline: "40 m² d'architecte, livrés prêts à vivre.",
    area: BRAND.area,
    footprint: BRAND.footprint,
    total: 12, // SERIE_TOTAL — pool partagé One + Max
    reserved: 1, // démo Phase 1 — persistance Supabase Realtime en Phase 4 (ADR-009)
    series: BRAND.series,
    pricing: PRICING,
    video: "/assets/arko/video/turntable.mp4",
    poster: "/assets/arko/video/turntable-poster.jpg",
    scrub: "/assets/arko/video/film-scrub.mp4",
    scrubPoster: "/assets/arko/video/film-scrub-poster.jpg",
    placeholderMedia: false,
  },
} as const;

export type Product = (typeof PRODUCTS)[ProductKey];

export const PRODUCT_LIST = [PRODUCTS.one, PRODUCTS.max] as const;

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
    d: "Vous réservez votre numéro avec 5 000 € remboursables. Sans engagement de construction.",
  },
] as const;

export const FAQ: { q: string; a: string | string[] }[] = [
  {
    q: "Quel est le délai ?",
    a: [
      "La fabrication de votre maison ARKO en atelier dure environ **12 semaines**, à compter de la levée des conditions prévues au contrat : autorisation d'urbanisme obtenue, financement confirmé, terrain accessible et fondations ou supports d'accueil réceptionnés.",
      "L'installation sur site est ensuite généralement réalisée en **une journée**, sous réserve des conditions d'accès, de météo et de préparation du terrain.",
      "À chaque étape importante — lancement, structure, finitions, maison prête à livrer, installation — vous êtes informé par email.",
    ],
  },
  {
    q: "Et si je n'ai pas encore de terrain ?",
    // La réponse renvoyait à la rubrique « Terrains » et aux partenaires
    // mandataires — suspendus (ADR-028). Repli sur le contact direct tant que
    // le dispositif n'est pas réactivé.
    a: FEATURES.mandataire
      ? "Si vous partez de zéro, nous vous proposons une sélection de terrains dans notre rubrique « Terrains » : des terrains sélectionnés par nos partenaires Mandataires. Sélectionnez-le et nous vous contactons pour faire le point sur sa disponibilité et vos options concernant votre maison ARKO. Aucun ne vous intéresse ? Nous restons à votre écoute, et ferons le nécessaire pour vous mettre en relation avec des partenaires de confiance."
      : "L'acquisition du terrain relève de vous. Si vous n'en avez pas encore, écrivez-nous : nous faisons le point sur votre projet, le modèle ARKO envisagé et les contraintes de la parcelle que vous visez. Vous pouvez aussi vérifier dès maintenant la compatibilité d'une parcelle depuis le configurateur, en renseignant son adresse.",
  },
  {
    q: "Comment se passe le paiement ?",
    a: [
      "Après un premier échange téléphonique, nous vous adressons par email une proposition commerciale comprenant le modèle ARKO retenu, les principales caractéristiques techniques, les options choisies et une estimation du calendrier de fabrication, de livraison et d'installation.",
      "Pour confirmer votre intérêt et réserver votre projet, un versement initial de 5 000 € vous est demandé.",
      "Ce versement est intégralement remboursable tant que le contrat de fabrication, livraison et installation n'a pas été signé. Vous pouvez donc renoncer à votre projet avant cette signature, sans avoir à justifier votre décision.",
      "Une fois le contrat signé, ce versement de 5 000 € est déduit du prix total de votre maison ARKO et intégré à l'échéancier de paiement.",
      "Le règlement s'effectue ensuite en plusieurs étapes, adaptées à la fabrication en atelier :",
      "Étape 0 — Premier échange et proposition commerciale\nNous échangeons avec vous sur votre projet, votre terrain, le modèle ARKO envisagé et vos contraintes techniques. Nous vous envoyons ensuite un devis accompagné du portfolio produit correspondant.",
      "Étape 1 — Réservation du projet\nVous validez le devis de réservation et l'échéancier prévisionnel. Une facture de réservation de 5 000 € vous est adressée. Le paiement peut être effectué par virement bancaire ou par paiement sécurisé en ligne.",
      "Étape 2 — Lancement de la fabrication\nAprès signature du contrat de fabrication, livraison et installation, validation des prérequis techniques et confirmation écrite de votre part, la fabrication peut être lancée. Une facture d'étape correspondant à 40 % du montant total de la commande est alors émise, déduction faite des 5 000 € déjà versés.",
      "Étape 3 — Sortie d'atelier\nLorsque votre maison ARKO est fabriquée et prête à être livrée, une nouvelle facture d'étape correspondant à 50 % du montant total de la commande est émise.",
      "Étape 4 — Livraison, installation et réception\nLe solde de 10 % est facturé lors de la livraison et de l'installation sur site, selon les conditions prévues au contrat. La réception donne lieu à l'établissement d'un procès-verbal de réception.",
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
    q: "Quelles garanties ?",
    a: [
      "Votre maison ARKO bénéficie des garanties légales applicables aux travaux réalisés : parfait achèvement pendant 1 an, bon fonctionnement des équipements dissociables pendant 2 ans, et garantie décennale pendant 10 ans pour les dommages affectant la solidité de l'ouvrage ou son usage.",
      "La garantie décennale est attachée à la maison et se transmet en cas de revente pendant sa durée de validité.",
      "L'assurance dommages-ouvrage reste à la charge du client et doit être souscrite avant l'ouverture du chantier lorsque la réglementation l'exige.",
    ],
  },
  {
    q: "Et l'après-vente ?",
    a: [
      "Après l'installation, un interlocuteur dédié reste votre référent technique.",
      "Il vous accompagne dans le suivi de votre maison ARKO, le traitement des éventuelles réserves et les désordres signalés après réception.",
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
    text: "Construite entière, à l'abri, à la précision du millimètre. Pendant que le terrain se prépare, la maison prend forme — sans pluie, sans aléa.",
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
    text: "Le jour J, une grue la dépose sur ses fondations. En quelques heures : posée, de niveau, raccordée. Pas un chantier de plusieurs mois — une maison.",
  },
  {
    step: "05",
    title: "Les réseaux",
    text: "Eau, électricité, assainissement : raccordement aux réseaux du terrain. Ce qu'il faut prévoir dépend de la parcelle, évalué avec vous.",
  },
] as const;

export const PROCESS_CONCLUSION =
  "Vous ne vivez pas un chantier de plusieurs mois. Vous recevez une maison finie.";

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

/* — Caractéristiques — */
export const SPECS = [
  { k: "Surface habitable", v: "40 m²" },
  { k: "Emprise", v: "4 × 11 m — un bloc" },
  { k: "Configuration", v: "T2 — séjour-cuisine, 1 chambre, salle de bain" },
  { k: "Livraison", v: "Prête à vivre" },
  { k: "Délai", v: "12 semaines" },
  { k: "Fondations", v: "Technopieux" },
  { k: "Toiture", v: "Plate, étanchéité multicouche" },
  { k: "Bardage", v: "Lames verticales, 4 teintes" },
  { k: "Vitrages", v: "Triple, angle vitré en retrait" },
  { k: "Isolation", v: "Renforcée, confort 4 saisons" },
  { k: "Terrasse", v: "Bois sur pilotis, intégrée" },
  { k: "Série", v: "01 — 12 exemplaires numérotés" },
] as const;

export const INCLUDED = [
  "La maison complète, prête à vivre",
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
