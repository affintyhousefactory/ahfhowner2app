import { PRODUCTS, type ProductKey } from "@/lib/site";

/**
 * Contenu des pages produit — direction « Heure bleue » (ADR-040).
 *
 * Le copy vit ici, jamais dans un composant : c'est la règle que le projet
 * s'applique depuis ADR-030 pour les grilles et depuis ADR-038 pour les pages
 * éditoriales. Une phrase de vente se relit, se corrige et se fait valider ;
 * elle n'a rien à faire au milieu du JSX.
 *
 * **Les montants ne sont pas ici.** Ils sont lus sur `PRODUCTS[key].pricing`,
 * qui les tient de `NEXT_PUBLIC_*` (ADR-003) — recopier « 69 900 € » dans une
 * chaîne de ce fichier créerait une seconde vérité, périmée au premier
 * changement de grille.
 *
 * Le volume de série vient de `SERIE_TOTAL` par le même chemin. ⚠ Le pool est
 * **commun** aux deux modèles : ce n'est pas 6 + 6. Les deux pages annoncent
 * donc le même compte, ce qui est exact et assumé (arbitrage de Richard,
 * 2026-08-25).
 */

export type VueVisite = {
  /** Chemin sous `public/` — visuels versés par la PR #93. */
  src: string;
  alt: string;
  titre: string;
  legende: string;
};

export type Etape = { n: string; titre: string; texte: string };
export type Fait = { titre: string; texte: string };

export type ContenuProduit = {
  eyebrow: string;
  /** Deux lignes : la coupe est voulue, elle porte le rythme du titre. */
  titre: [string, string];
  accroche: string;
  hero: {
    src: string;
    alt: string;
    /**
     * Assombrissement appliqué au visuel du hero, entre 0 et 1.
     *
     * Il n'est pas le même pour les deux modèles, et ce n'est pas un caprice :
     * le visuel du Max est déjà pris à la tombée du jour et supporte un fort
     * assombrissement, celui du One est diurne et en pleine lumière — le même
     * traitement le rendrait terne au lieu de nocturne. Défaut : 0.74.
     */
    luminosite?: number;
  };
  tension: { titre: string; paragraphes: [string, string] };
  etapes: [Etape, Etape, Etape];
  chiffres: { valeur: string; libelle: string }[];
  visite: { titre: string; vues: VueVisite[] };
  atelier: { titre: [string, string]; texte: string; image: { src: string; alt: string } };
  durable: { titre: string; faits: Fait[] };
  cloture: { titre: [string, string]; texte: string };
};

/* ── Ce que les deux modèles partagent ──────────────────────────────────
   Fabrication, engagement environnemental et parcours sont identiques : les
   recopier deux fois les ferait diverger à la première correction. Seul ce qui
   distingue réellement les gammes est écrit deux fois. */

const ETAPES: [Etape, Etape, Etape] = [
  {
    n: "01",
    titre: "Vous configurez",
    texte:
      "Modèle, bardage, ambiance intérieure, terrasse. Le prix se met à jour à chaque choix, sans rendez-vous et sans devis à attendre.",
  },
  {
    n: "02",
    titre: "Nous étudions votre terrain",
    texte:
      "Accès, règles d'urbanisme, raccordements. Notre équipe vérifie votre parcelle à la main — aucune réponse automatique.",
  },
  {
    n: "03",
    titre: "Nous posons en une journée",
    texte:
      "L'unité arrive finie de l'atelier et se pose en une journée. Aucun chantier ouvert chez vous pendant des mois.",
  },
];

const FAITS: Fait[] = [
  {
    titre: "Acier recyclable",
    texte: "L'ossature se recycle indéfiniment, sans perdre ses propriétés.",
  },
  {
    titre: "Isolation biosourcée",
    texte: "Une isolation d'origine végétale, pas un dérivé pétrolier.",
  },
  {
    titre: "Sol préservé",
    texte: "Des pieux vissés, pas une dalle : le terrain reste perméable.",
  },
  {
    titre: "Réversible",
    texte: "Démontable sans démolition, le jour où vous changez d'avis.",
  },
];

const ATELIER_TEXTE =
  "Ossature acier léger, isolation biosourcée, bardage joint debout. L'unité est montée, câblée, équipée et contrôlée au Pays basque avant de partir. Sur votre terrain, il ne reste qu'à la poser.";

/* ── Ce qui distingue les deux gammes ───────────────────────────────────
   Si les deux pages disent la même chose, la gamme n'a pas de sens et le
   visiteur choisit au prix. Le One vend de ne pas déménager ; le Max vend
   d'accueillir dans la durée. */

const CONTENUS: Record<ProductKey, ContenuProduit> = {
  one: {
    eyebrow: "Arko One · 20 m²",
    titre: ["À vingt pas de chez vous,", "et tout à fait ailleurs."],
    accroche:
      "Un studio de jardin d'architecte, livré prêt à vivre et posé sur votre parcelle en une journée.",
    hero: {
      /* Vue extérieure propre à l'Arko One, fournie par Richard le 2026-08-25.
         Elle remplace un intérieur de l'Arko **Max** servi faute de mieux —
         la page produit du One ne montre plus l'autre modèle en ouverture. */
      src: "/assets/arko/one/hero-exterieur.avif",
      alt: "L'Arko One posé dans les montagnes basques, bardage sombre et terrasse en bois",
      luminosite: 0.88,
    },
    tension: {
      titre: "Vous n'avez pas besoin de déménager.",
      paragraphes: [
        "Un bureau qui ferme vraiment. Une chambre pour ceux qui restent dormir. Un atelier qui cesse de déborder dans le salon.",
        "La plupart des projets d'agrandissement butent sur le même mur : les devis qui s'étirent, la poussière, les mois. L'Arko One, lui, arrive fini.",
      ],
    },
    etapes: ETAPES,
    chiffres: [
      { valeur: "20 m²", libelle: "Surface habitable" },
      { valeur: "6,65 × 3,60", libelle: "Emprise au sol (m)" },
      { valeur: "12 sem.", libelle: "De la signature à la pose" },
      { valeur: "1 jour", libelle: "Installation sur site" },
    ],
    visite: {
      titre: "Quatre vues, dans l'ordre où on les découvre.",
      vues: [
        {
          src: "/assets/arko/one/carousel/exterieur.avif",
          alt: "L'Arko One posé dans un jardin boisé, bardage sombre et terrasse en bois",
          titre: "Dans son jardin",
          legende: "Bardage sombre, terrasse bois, posé sans terrassement.",
        },
        {
          src: "/assets/arko/one/carousel/cuisine.avif",
          alt: "Cuisine de l'Arko One, fenêtre bandeau au-dessus du plan de travail",
          titre: "La cuisine",
          legende: "Fenêtre bandeau sur le plan de travail, équipée en atelier.",
        },
        {
          src: "/assets/arko/one/carousel/chambre.avif",
          alt: "Coin nuit de l'Arko One, lit sous une fenêtre cadrée sur le paysage",
          titre: "Le coin nuit",
          legende: "Un lit, une fenêtre cadrée sur le paysage, des rangements sous le sommier.",
        },
        {
          src: "/assets/arko/one/carousel/salle-eau.avif",
          alt: "Salle d'eau de l'Arko One, douche et meuble vasque",
          titre: "La salle d'eau",
          legende: "Douche, meuble et robinetterie livrés posés et raccordés.",
        },
      ],
    },
    atelier: {
      titre: ["Ce qui arrive chez vous", "ne se termine pas chez vous."],
      texte: ATELIER_TEXTE,
      image: {
        src: "/assets/arko/video/loggia-poster.jpg",
        alt: "Studio de jardin Arko vu depuis sa terrasse",
      },
    },
    durable: { titre: "Ce qu'il laisse au terrain : presque rien.", faits: FAITS },
    cloture: {
      titre: ["Six exemplaires pour", "cette collection Arko."],
      texte:
        "Chaque Arko One porte son numéro. Le réserver demande un versement initial intégralement remboursable tant que le contrat n'est pas signé.",
    },
  },

  max: {
    eyebrow: "Arko Max · 40 m²",
    titre: ["La même adresse,", "et pourtant un autre chez-soi."],
    accroche:
      "Un studio de jardin de 40 m² : séjour, cuisine ouverte, chambre séparée et salle de bain. Livré prêt à vivre, posé sur votre parcelle en une journée.",
    hero: {
      /* Vue panoramique fournie par Richard le 2026-08-25 : fin de journée,
         intérieur allumé, terrasse sur pilotis dans les pins. L'heure bleue
         sans retouche — d'où l'absence de `luminosite`, le défaut suffit. */
      src: "/assets/arko/max/hero-exterieur.avif",
      alt: "L'Arko Max en fin de journée, intérieur allumé, terrasse sur pilotis dans les pins",
    },
    tension: {
      titre: "Accueillir sans se serrer.",
      paragraphes: [
        "Un parent qui préfère rester près de vous sans vivre chez vous. Un grand enfant qui revient. Des amis qui restent une semaine entière.",
        "Une chambre d'amis ne suffit plus dès qu'on parle de mois plutôt que de nuits. Le Max donne une vraie autonomie : sa cuisine, sa salle de bain, sa porte.",
      ],
    },
    etapes: ETAPES,
    chiffres: [
      { valeur: "40 m²", libelle: "Surface habitable" },
      { valeur: "4,00 × 11,00", libelle: "Emprise au sol (m)" },
      { valeur: "12 sem.", libelle: "De la signature à la pose" },
      { valeur: "1 jour", libelle: "Installation sur site" },
    ],
    visite: {
      titre: "Quatre vues, dans l'ordre où on les découvre.",
      vues: [
        {
          src: "/assets/arko/max/carousel/salon.avif",
          alt: "Séjour de l'Arko Max, large baie cadrée sur les arbres",
          titre: "Le séjour",
          legende: "Une baie cadrée sur les arbres, la pièce tourne autour d'elle.",
        },
        {
          src: "/assets/arko/max/carousel/cuisine.avif",
          alt: "Cuisine de l'Arko Max, ouverte sur le séjour",
          titre: "La cuisine",
          legende: "Ouverte sur le séjour, équipée et raccordée en atelier.",
        },
        {
          src: "/assets/arko/max/carousel/chambre.avif",
          alt: "Chambre séparée de l'Arko Max",
          titre: "La chambre",
          legende: "Une pièce à part, porte fermée — ce que le 20 m² ne permet pas.",
        },
        {
          src: "/assets/arko/max/carousel/salle-bain.avif",
          alt: "Salle de bain de l'Arko Max",
          titre: "La salle de bain",
          legende: "Douche, meuble et robinetterie livrés posés et raccordés.",
        },
      ],
    },
    atelier: {
      titre: ["Ce qui arrive chez vous", "ne se termine pas chez vous."],
      texte: ATELIER_TEXTE,
      image: {
        src: "/assets/arko/max/exterieur-approche.avif",
        alt: "L'Arko Max vu à l'approche, dans son environnement",
      },
    },
    durable: { titre: "Ce qu'il laisse au terrain : presque rien.", faits: FAITS },
    cloture: {
      titre: ["Six exemplaires pour", "cette collection Arko."],
      texte:
        "Chaque Arko Max porte son numéro. Le réserver demande un versement initial intégralement remboursable tant que le contrat n'est pas signé.",
    },
  },
};

export function contenuProduit(key: ProductKey): ContenuProduit {
  return CONTENUS[key];
}

/** Prix de base affiché, lu sur la source de vérité et jamais recopié. */
export function prixBase(key: ProductKey): number {
  return PRODUCTS[key].pricing.base;
}

/** Numéros encore libres — pool commun aux deux modèles (ce n'est pas 6 + 6). */
export function numerosLibres(key: ProductKey): number {
  const p = PRODUCTS[key];
  return Math.max(0, p.total - p.reserved);
}
