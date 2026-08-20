/* ============================================================
   Registre des pages éditoriales — ADR-038.

   Source unique des 19 pages ouvertes par le chantier « PagesSite_SEO »
   (classeur de Richard, 2026-08-20). Sitemap, navigation, fil d'Ariane, hub
   `/guide` et maillage interne lisent **tous** ce fichier : une route ne
   s'écrit qu'ici.

   Pourquoi un registre plutôt que 19 pages qui se déclarent chacune :

   1. **Le sitemap ne doit annoncer que ce qui existe.** Le chantier se livre
      en cinq lots ; entre le premier et le dernier, la moitié des routes n'a
      pas de page. `statut: "a-venir"` les garde hors du sitemap, hors de la
      navigation et hors du maillage — déclarer une URL morte à un moteur coûte
      du budget de crawl et de la confiance.
   2. **Le maillage interne est une obligation de la spec** (2 à 4 liens par
      guide, hub → articles, articles → hub). Écrit à la main, il pourrit au
      premier renommage ; dérivé du registre, il ne peut pas pointer vers une
      page absente.
   3. **Trois routes du classeur étaient impossibles** — trois specs pour
      `/guide/reglementation-permis/`, deux pour
      `/guide/prix-studio-jardin-habitable/`. L'arbitrage (ADR-038 §2) vit ici,
      à côté des routes, pas dans un fil de discussion.

   ⚠ Passer une page à `"publiee"` la met en ligne au sens des moteurs. Ne le
   faire qu'une fois la page réellement servie et vérifiée en Preview.
   ============================================================ */

/** Familles de pages — pilotent le regroupement en navigation et le fil d'Ariane. */
export type FamillePage = "produit" | "usage" | "local" | "guide" | "hub-guide";

export type PageEditoriale = {
  /** Chemin servi, sans slash final (convention du site — ADR-038 §3). */
  route: string;
  /** `<h1>` de la page. Dicté par le classeur quand il en fournit un. */
  h1: string;
  /** Libellé court — navigation, cartes de maillage, fil d'Ariane. */
  libelle: string;
  famille: FamillePage;
  /** Résumé de 130 à 180 caractères — aperçus du hub et cartes de maillage. */
  resume: string;
  /** Spec source dans `docs/specs/pages-seo/`, pour retrouver le brief. */
  spec?: string;
  /**
   * `"publiee"` = servie et vérifiée : entre au sitemap, à la navigation et au
   * maillage. `"a-venir"` = route arbitrée, page pas encore écrite.
   */
  statut: "publiee" | "a-venir";
  /** Priorité sitemap. Les pages d'usage priment sur les guides, qui priment sur le local. */
  priorite: number;
};

/* Les deux pages produit sont déjà en ligne et ne sont pas gérées ici : elles
   vivent dans `PRODUCTS` (`site.ts`), qui porte aussi leurs prix et leurs
   médias. Les dupliquer au registre aurait créé deux vérités pour une route. */

export const PAGES_EDITORIALES: readonly PageEditoriale[] = [
  /* — Pages d'usage (lot 2) — une intention de recherche, une page. */
  {
    route: "/studio-jardin-haut-de-gamme",
    h1: "Studio de jardin haut de gamme : un espace d'architecte, pensé autrement",
    libelle: "Studio haut de gamme",
    famille: "usage",
    resume:
      "Deux studios de jardin d'architecte, une structure acier léger et une fabrication hors-site : ce que recouvre vraiment le haut de gamme.",
    spec: "page-studio-jardin-haut-de-gamme.md",
    statut: "publiee",
    priorite: 0.9,
  },
  {
    route: "/bureau-de-jardin",
    h1: "Un vrai bureau. Dans votre jardin.",
    libelle: "Bureau de jardin",
    famille: "usage",
    resume:
      "Un espace de travail à dix mètres de chez vous, conçu pour une journée entière : lumière, acoustique, confort thermique et vraie adresse professionnelle.",
    spec: "page-bureau-de-jardin.md",
    statut: "publiee",
    priorite: 0.85,
  },
  {
    route: "/dependance-habitable",
    h1: "Une dépendance habitable pensée comme un véritable espace à vivre",
    libelle: "Dépendance habitable",
    famille: "usage",
    resume:
      "Recevoir, accueillir un proche, créer un espace autonome dans son jardin : ce qu'une dépendance change au quotidien, et ce qu'elle exige.",
    spec: "page-dependance-habitable.md",
    statut: "publiee",
    priorite: 0.85,
  },
  {
    route: "/bureau-pour-teletravail",
    h1: "Bureau pour télétravail : créez un véritable espace de travail dans votre jardin",
    libelle: "Bureau pour télétravail",
    famille: "usage",
    resume:
      "Séparer le travail du domicile sans quitter son terrain : pourquoi une pièce dédiée vaut mieux qu'un coin de salon détourné de son usage.",
    spec: "page-bureau-pour-teletravail.md",
    statut: "publiee",
    priorite: 0.85,
  },
  {
    route: "/studio-jardin-tiny-house",
    h1: "Studio de jardin ou tiny house : que choisir pour créer un véritable espace à vivre ?",
    /* ⚠ Le libellé ne porte PAS le terme comparé, alors que le `h1` le porte.
       Ce n'est pas une inconséquence : `libelle` et `resume` sont affichés sur
       **toutes les pages du site** — colonne « Usages » du pied de page,
       maillage « À lire aussi » — tandis que le `h1` ne l'est que sur sa propre
       page. L'exception d'ADR-029 vaut pour la page qui compare, pas pour
       l'ensemble du site.

       Constaté sur le rendu du lot 3 : avec « Studio ou tiny house » en
       libellé, le terme proscrit apparaissait sur les dix pages de guides et
       sur le hub, par le seul pied de page. Le contrôle ne l'a pas vu parce que
       ce fichier figure dans la liste `sauf` — l'exception que j'avais posée
       pour le `h1` couvrait aussi, sans que je l'aie voulu, tout ce que ce
       fichier diffuse ailleurs.

       Règle qui en découle : dans ce fichier, seul `h1` peut porter un terme
       sous exception. `libelle` et `resume` sont lus partout — ils restent
       soumis à la blocklist entière. */
    libelle: "Studio ou habitat mobile",
    famille: "usage",
    resume:
      "Deux philosophies opposées : l'une est faite pour bouger, l'autre pour rester. Comparaison honnête avant de choisir ce qui ira dans votre jardin.",
    spec: "page-studio-jardin-tiny-house.md",
    statut: "publiee",
    priorite: 0.8,
  },

  /* — Hub et guides (lot 3) — bibliothèque réglementaire. */
  {
    route: "/guide",
    h1: "Guides & Réglementation — réussir son projet de studio de jardin",
    libelle: "Guides & Réglementation",
    famille: "hub-guide",
    resume:
      "Permis, prix, surface, implantation, location : les réponses utiles pour transformer une idée de studio de jardin en projet concret.",
    spec: "guide-00-hub.md",
    statut: "publiee",
    priorite: 0.8,
  },
  {
    route: "/guide/reglementation-permis",
    h1: "Réglementation et permis pour un studio de jardin de 20 m²",
    libelle: "Réglementation et permis",
    famille: "guide",
    resume:
      "Déclaration préalable, PLU, implantation, secteurs protégés : les vérifications essentielles avant d'installer un studio de jardin.",
    spec: "guide-01-reglementation-permis-20m2.md",
    statut: "publiee",
    priorite: 0.7,
  },
  {
    route: "/guide/prix-studio-jardin-habitable",
    h1: "Prix d'un studio de jardin habitable",
    libelle: "Prix d'un studio de jardin",
    famille: "guide",
    resume:
      "Structure, équipements, fondations, transport, raccordements : comprendre ce qui compose réellement le budget d'un studio de jardin.",
    spec: "guide-02-prix-studio-jardin-habitable.md",
    statut: "publiee",
    priorite: 0.7,
  },
  {
    route: "/guide/agrandir-sans-demenager",
    h1: "Agrandir sans déménager",
    libelle: "Agrandir sans déménager",
    famille: "guide",
    resume:
      "Créer une chambre, un bureau ou un logement indépendant dans son jardin peut être une alternative élégante à un déménagement.",
    spec: "guide-03-agrandir-sans-demenager.md",
    statut: "publiee",
    priorite: 0.7,
  },
  {
    /* Route renommée — le classeur donnait `/guide/reglementation-permis/`,
       déjà pris par le guide 01. Arbitrage du hub, repris par ADR-038 §2. */
    route: "/guide/permis-studio-jardin-20m2",
    h1: "Permis pour un studio de jardin de 20 m²",
    libelle: "Permis — studio de 20 m²",
    famille: "guide",
    resume:
      "Pourquoi 20 m² est un seuil clé, ce que permet la déclaration préalable et les cas où les règles locales changent la donne.",
    spec: "guide-04-permis-studio-jardin-20m2.md",
    statut: "publiee",
    priorite: 0.65,
  },
  {
    /* Route renommée — même motif que ci-dessus. */
    route: "/guide/permis-studio-jardin-40m2",
    h1: "Permis pour un studio de jardin de 40 m²",
    libelle: "Permis — studio de 40 m²",
    famille: "guide",
    resume:
      "Pour une construction nouvelle de 40 m², le permis de construire est en principe la référence. Voici les points à anticiper.",
    spec: "guide-05-permis-studio-jardin-40m2.md",
    statut: "publiee",
    priorite: 0.65,
  },
  {
    /* Route renommée — le classeur la donnait identique au guide 02. */
    route: "/guide/prix-reel-studio-jardin-habitable",
    h1: "Prix réel d'un studio de jardin habitable",
    libelle: "Prix réel — au-delà de l'affiché",
    famille: "guide",
    resume:
      "Au-delà du prix affiché : taxes, accès, fondations, raccordements et options à intégrer pour estimer une enveloppe réaliste.",
    spec: "guide-06-prix-reel-studio-jardin-habitable.md",
    statut: "publiee",
    priorite: 0.65,
  },
  {
    route: "/guide/surface-habitable-sans-permis",
    h1: "Quelle surface habitable sans permis de construire ?",
    libelle: "Surface sans permis",
    famille: "guide",
    resume:
      "Le seuil de 20 m² est souvent cité, mais « sans permis » ne veut pas dire « sans autorisation ». Comprendre les règles avant d'agir.",
    spec: "guide-07-surface-habitable-sans-permis.md",
    statut: "publiee",
    priorite: 0.7,
  },
  {
    route: "/guide/logement-independant-jardin",
    h1: "Créer un logement indépendant dans son jardin",
    libelle: "Logement indépendant",
    famille: "guide",
    resume:
      "Pour un proche, un étudiant ou un usage locatif : les points d'attention pour créer un véritable espace autonome dans son jardin.",
    spec: "guide-08-logement-independant-jardin.md",
    statut: "publiee",
    priorite: 0.7,
  },
  {
    route: "/guide/studio-jardin-location-saisonniere",
    h1: "Studio de jardin pour location saisonnière",
    libelle: "Location saisonnière",
    famille: "guide",
    resume:
      "Urbanisme, confort, exploitation et règles des meublés de tourisme : ce qu'il faut vérifier avant de viser la location courte durée.",
    spec: "guide-09-studio-jardin-location-saisonniere.md",
    statut: "publiee",
    priorite: 0.7,
  },

  /* — Pages locales (lot 4) — chacune porte du contenu propre à sa commune
       (ADR-038 §4). Sans cette matière, elles ne passent pas en `"publiee"`. */
  {
    route: "/studio-jardin-bayonne",
    h1:
      "Studio de jardin à Bayonne : gagner de l'espace quand chaque mètre carré compte",
    libelle: "Studio de jardin — Bayonne",
    famille: "local",
    resume:
      "Parcelles enclavées, passages étroits, grutage et centre ancien : ce qui rend un projet possible — ou non — dans le tissu bayonnais.",
    statut: "publiee",
    priorite: 0.6,
  },
  {
    route: "/studio-jardin-anglet",
    h1:
      "Studio de jardin à Anglet : donner une nouvelle fonction à votre parcelle",
    libelle: "Studio de jardin — Anglet",
    famille: "local",
    resume:
      "Tension sur le logement, location à l'année ou meublé de tourisme, intimité entre les deux bâtiments : ce qu'un studio change à Anglet.",
    statut: "publiee",
    priorite: 0.6,
  },
  {
    route: "/studio-jardin-biarritz",
    h1:
      "Studio de jardin à Biarritz : créer de petites surfaces là où le logement manque",
    libelle: "Studio de jardin — Biarritz",
    famille: "local",
    resume:
      "Foncier rare, micro-densification, logement étudiant et projets de plusieurs unités : l'échelle qui manque à Biarritz.",
    statut: "publiee",
    priorite: 0.6,
  },
  {
    route: "/studio-jardin-cote-basque",
    h1:
      "Studio de jardin sur la Côte Basque et au Pays Basque : commencer par le bon terrain",
    libelle: "Studio de jardin — Côte Basque",
    famille: "local",
    resume:
      "Littoral ou intérieur, zones A et N, STECAL, documents d'urbanisme multiples : où un studio peut réellement s'implanter.",
    statut: "publiee",
    priorite: 0.65,
  },
] as const;

/** Pages réellement servies — seules à entrer au sitemap, à la nav et au maillage. */
export function pagesPubliees(): readonly PageEditoriale[] {
  return PAGES_EDITORIALES.filter((p) => p.statut === "publiee");
}

/** Pages publiées d'une famille donnée. */
export function pagesDeFamille(
  famille: FamillePage,
): readonly PageEditoriale[] {
  return pagesPubliees().filter((p) => p.famille === famille);
}

/** Une page par sa route — `undefined` si elle n'est pas au registre. */
export function pageParRoute(route: string): PageEditoriale | undefined {
  return PAGES_EDITORIALES.find((p) => p.route === route);
}

/**
 * Maillage interne : jusqu'à `combien` autres guides publiés, en partant de la
 * page courante. La spec en impose 2 à 4 par article. La sélection est
 * **déterministe** (ordre du registre, à partir du voisin suivant) : un ordre
 * aléatoire changerait les liens à chaque rendu, ce qu'un moteur lit comme une
 * structure instable — et rendrait tout diff de page illisible.
 */
export function guidesVoisins(route: string, combien = 3): readonly PageEditoriale[] {
  const guides = pagesDeFamille("guide");
  if (guides.length === 0) return [];
  const i = guides.findIndex((p) => p.route === route);
  const suite = i === -1 ? guides : [...guides.slice(i + 1), ...guides.slice(0, i)];
  return suite.slice(0, combien);
}
