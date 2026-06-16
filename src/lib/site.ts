/* ============================================================
   HOWNER / ARKO — source de contenu
   Règles de marque ABSOLUES respectées : aucun terme interdit
   (CCMI, LSF, acier, hors-site, modulaire, préfabriqué, tiny house,
   conteneur, catalogue, micro-maison). « notre architecte intégrée »
   sans prénom. Fondateur = Puigbo (sans accent).
   ============================================================ */

// Acompte : jamais en dur — lu depuis l'environnement (fallback 1500).
const DEPOSIT_EUR = Number(
  process.env.NEXT_PUBLIC_RESERVATION_DEPOSIT_EUR ?? 1500,
);

export const BRAND = {
  maker: "HOWNER",
  model: "ARKO",
  baseline: "Une maison. Réduite. Pas diminuée.",
  subline: "40 m² d'architecte, livrés prêts à vivre. Série 01 — 12 exemplaires.",
  series: "Série 01",
  total: 12,
  reserved: 4, // jauge live (placeholder Phase 1, Supabase Realtime en Phase 4)
  deposit: DEPOSIT_EUR,
  area: "40 m²",
  footprint: "4 × 11 m",
  location: "Pays Basque",
} as const;

export const MANIFESTO =
  "On a retiré les mètres carrés superflus. Pas la lumière, pas la hauteur, pas le soin. Arko est pensée par notre architecte intégrée comme une maison entière — simplement plus juste.";

export const PROMISE =
  "Une maison d'architecte, livrée prête à vivre, en 12 semaines.";

// Prix — base & livraison en env (jamais en dur), catalogue d'options en données.
export const PRICING = {
  base: Number(process.env.NEXT_PUBLIC_ARKO_BASE_EUR ?? 89900),
  perM2: 2250,
  terrassePerM2: 300,
  delivery: {
    grutage: Number(process.env.NEXT_PUBLIC_DELIVERY_GRUTAGE_EUR ?? 1440),
    perKm: Number(process.env.NEXT_PUBLIC_DELIVERY_PER_KM_EUR ?? 5.4),
    origin: "Bayonne",
  },
  options: [
    { id: "cuisine_premium", label: "Pack Cuisine Premium", price: 4200 },
    { id: "sdb_premium", label: "Pack Salle d'eau Premium", price: 3360 },
    { id: "poele", label: "Poêle à bois", price: 5400 },
    { id: "solaire", label: "Pack Solaire", price: 5880 },
    { id: "domotique", label: "Pack Domotique", price: 2640 },
  ],
  // Couche 3 — frais terrain, à part, jamais dans le total maison.
  landFees: [
    { label: "Étude de sol G2", value: "dès 2 400 €" },
    { label: "Assainissement (micro-station)", value: "dès 9 000 €" },
    { label: "Raccordements · terrassement · accès grue", value: "sur étude" },
    { label: "Permis + taxe d'aménagement", value: "selon commune" },
  ],
} as const;

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
    d: "Vous réservez votre numéro avec 1 500 € remboursables. Sans engagement de construction.",
  },
  {
    t: "Après votre réservation",
    d: "Prochaine étape : 30 min en visio avec notre architecte intégrée pour valider votre projet.",
  },
] as const;

export const FAQ = [
  {
    q: "Quel est le délai ?",
    a: "12 semaines de fabrication en atelier, puis la pose en une journée sur vos fondations.",
  },
  {
    q: "Et si je n'ai pas encore de terrain ?",
    a: "Notre outil terrain vérifie une adresse ou une annonce. Sinon, on vous aide à trouver une parcelle compatible.",
  },
  {
    q: "Comment se passe le paiement ?",
    a: "L'acompte de 1 500 € à la réservation s'impute sur le 1er appel. Échéancier 10 / 30 / 40 / 20 %.",
  },
  {
    q: "Quelles garanties ?",
    a: "Les garanties légales du bâtiment s'appliquent. Détails et CGV communiqués avant signature (en cours de validation juridique).",
  },
  {
    q: "Et l'après-vente ?",
    a: "Un interlocuteur dédié, et notre architecte intégrée reste votre référente après la pose.",
  },
] as const;

export const NAV = [
  { label: "Découvrir", href: "#decouvrir" },
  { label: "Configurer", href: "#configurer" },
  { label: "Caractéristiques", href: "#specs" },
  { label: "Votre terrain", href: "#terrain" },
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
