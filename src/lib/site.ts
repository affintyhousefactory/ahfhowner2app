/* ============================================================
   HOWNER / ARKO — source de contenu
   Règles de marque ABSOLUES respectées : aucun terme interdit
   (CCMI, LSF, acier, hors-site, modulaire, préfabriqué, tiny house,
   conteneur, catalogue, micro-maison). « notre architecte intégrée »
   sans prénom. Fondateur = Puigbo (sans accent).
   ============================================================ */

// URL canonique de prod — source unique pour metadataBase, sitemap, robots,
// canonical (ADR-018). Surchargeable par env pour les previews Vercel.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://affinityhome.fr";

// Acompte : jamais en dur — lu depuis l'environnement (fallback 5000).
const DEPOSIT_EUR = Number(
  process.env.NEXT_PUBLIC_RESERVATION_DEPOSIT_EUR ?? 5000,
);

export const BRAND = {
  maker: "HOWNER",
  model: "ARKO",
  baseline: "Une maison compacte faite pour vous",
  subline:
    "Deux modèles d'architecte, livrés prêts à vivre. Fabriqués au Pays-Basque.",
  series: "Série 01",
  total: 12, // ⚠ compat héritée = total Arko Max ; voir PRODUCTS pour le par-produit
  reserved: 4, // jauge live (placeholder Phase 1, Supabase Realtime en Phase 4)
  deposit: DEPOSIT_EUR,
  area: "40 m²", // compat héritée (= Arko Max) — préférer PRODUCTS[key].area
  footprint: "4 × 11 m", // compat héritée (= Arko Max)
  location: "Pays Basque",
  madeIn: "Fabriqué au Pays-Basque", // rendu UI (ADR-022)
} as const;

export const MANIFESTO =
  "On a retiré les mètres carrés superflus. Pas la lumière, pas la hauteur, pas le soin. Arko est pensée par notre architecte intégrée comme une maison entière — simplement plus juste.";

export const PROMISE =
  "Une maison d'architecte, livrée prête à vivre, en 12 semaines.";

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
export const PRICING = {
  base: Number(process.env.NEXT_PUBLIC_ARKO_BASE_EUR ?? 89900),
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
   sont confirmés (59 900 € / 20 m² / 12 ex).
   Montants en env via fallback (ADR-003), jamais en dur ailleurs.
   ============================================================ */

// Grille tarifaire Arko One (20 m²) — provisoire (TODO ARKO ONE).
const ONE_PRICING = {
  base: Number(process.env.NEXT_PUBLIC_ARKO_ONE_BASE_EUR ?? 59900),
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
    footprint: "à confirmer", // TODO ARKO ONE : dimensions réelles du 20 m²
    total: 12,
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
    total: 5, // repositionnement : Arko Max = 5 exemplaires (ADR-022)
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

export const REASSURANCE = [
  {
    t: "Notre architecte intégrée",
    d: "Chaque ARKO est dessinée et suivie par notre architecte intégrée, de l'esquisse à la pose.",
  },
  {
    t: "Le savoir-faire d'atelier",
    d: "Montée et finie au sol, à l'abri. Une précision d'atelier, un délai maîtrisé de 12 semaines.",
  },
  {
    t: "Acompte remboursable",
    d: "Vous réservez votre numéro avec 5 000 € remboursables. Sans engagement de construction.",
  },
  {
    t: "Après votre réservation",
    d: "Prochaine étape : 30 min en visio avec notre architecte intégrée pour valider votre projet.",
  },
] as const;

export const FAQ = [
  {
    q: "Quel est le délai ?",
    a: "12 semaines de fabrication en atelier à compter de la levée des conditions du contrat de construction — urbanisme obtenu, financement confirmé, fondations réceptionnées. La pose se fait ensuite en une journée. Vous êtes informé par email à chaque étape clé : lancement, structure, finitions, module prêt à livrer, pose.",
  },
  {
    q: "Et si je n'ai pas encore de terrain ?",
    a: "Notre outil terrain vérifie en ligne la compatibilité d'une adresse ou d'une annonce : PLU, accessibilité convoi, exposition. Si vous partez de zéro, le Pack Recherche Terrain (acompte de 1 500 €, optionnel et accessoire à la réservation) vous donne accès à un Mandataire Partenaire Howner-Affinity qualifié, titulaire de la carte T, qui conduit la recherche sur 3 mois. L'acompte est intégralement remboursable si aucun terrain compatible n'est trouvé dans le délai.",
  },
  {
    q: "Comment se passe le paiement ?",
    a: "La réservation déclenche un acompte de 5 000 €, remboursable à tout moment avant la signature du contrat de construction, sans condition ni justification. Cet acompte s'impute sur le premier appel de fonds. L'échéancier est adapté à la fabrication en atelier selon le décret du 6 février 2020 : 10 % à l'ouverture, 40 % à l'achèvement de la structure, 60 % aux finitions intérieures, 80 % au module prêt à livrer, 95 % à la réception, 100 % après levée des réserves.",
  },
  {
    q: "Quelles garanties ?",
    a: "Trois garanties légales s'appliquent à chaque Maison ARKO : parfait achèvement (1 an — tous les désordres signalés à la réception ou dans l'année), biennale de bon fonctionnement (2 ans — volets, robinetterie, équipements électriques et éléments dissociables), et décennale (10 ans — structure et éléments indissociables). La garantie décennale est transférable en cas de revente. L'assurance dommages-ouvrage est à la charge du Client, obligatoire avant ouverture de chantier.",
  },
  {
    q: "Et l'après-vente ?",
    a: "Un interlocuteur dédié vous accompagne après la pose. Notre architecte intégrée reste votre référente technique pour les questions de conformité, d'urbanisme et d'adaptation. Les désordres signalés dans l'année suivant la réception sont traités dans le cadre de la garantie de parfait achèvement, sans frais.",
  },
] as const;

// Navigation principale par routes (multi-pages — ADR-021).
// « Produits » est rendu à part (méga-menu Tesla) via PRODUCT_LIST.
export const NAV = [
  { label: "Contact", href: "/contact" },
] as const;

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
