import type { RevealFrame } from "@/components/site/RevealScrub";
import type { Panel } from "@/components/site/Discover";

/**
 * Médias propres à l'Arko Max — 2026-08-19.
 *
 * Rendus fournis par Richard (Drive `plans_visuels` → `ARKO MAX`), réencodés
 * en AVIF 2560 px dans `public/assets/arko/max/`. Ils remplacent les films
 * Higgsfield génériques, qui montraient un volume qui n'est pas l'Arko Max.
 * L'Arko One garde les anciens tant qu'il n'a pas ses propres rendus.
 */
const DIR = "/assets/arko/max";

/**
 * « La Révélation » — l'extérieur se pose, puis on entre.
 *
 * Quatre plans pour trois images : la vue extérieure est jouée deux fois, une
 * fois pour la pose au sol, une fois pour le zoom d'entrée. Le `to` du plan 1
 * égale le `from` du plan 2, donc le fondu enchaîné entre deux images
 * identiques ne se voit pas — c'est un seul mouvement continu qui change de
 * régime. Le raccord se referme sur la cuisine, puis un panoramique vers la
 * gauche découvre le séjour.
 *
 * ⚠ Ces valeurs se lisent ensemble : déplacer un `at` sans reprendre le
 * chevauchement voisin casse le fondu (trou noir ou coupure sèche).
 */
export const MAX_REVEAL: readonly RevealFrame[] = [
  {
    src: `${DIR}/exterieur-approche.avif`,
    alt: "Le studio de jardin Arko Max vu de l'extérieur, en approche",
    tag: "L'approche",
    at: [0, 0.3],
    from: { scale: 1.12, y: -7 },
    to: { scale: 1, y: 0 },
  },
  {
    src: `${DIR}/exterieur-approche.avif`,
    alt: "Le studio de jardin Arko Max, façade vitrée — entrée dans le volume",
    tag: "Le seuil",
    at: [0.26, 0.54],
    from: { scale: 1, y: 0 },
    to: { scale: 1.85, y: 1 },
  },
  {
    src: `${DIR}/cuisine.avif`,
    alt: "Cuisine du studio de jardin Arko Max, ambiance bois",
    tag: "La cuisine",
    at: [0.48, 0.78],
    from: { scale: 1.32 },
    to: { scale: 1.04 },
  },
  {
    src: `${DIR}/salon.avif`,
    alt: "Séjour du studio de jardin Arko Max, ambiance bois",
    tag: "Le séjour",
    at: [0.72, 1],
    from: { scale: 1.12, x: -9 },
    to: { scale: 1, x: 0 },
  },
];

/**
 * « Découvrir » — six vues, une par écran.
 *
 * L'heure bleue a été retirée le 2026-08-19 (décision de Richard) : le film
 * `crepuscule.mp4` ne montre pas l'Arko Max. L'angle vitré reste un film, seul
 * média de la série qui tienne encore. Les cinq autres passent en rendus
 * propres au produit — l'écrin en zoom, les intérieurs et la terrasse en
 * fondu, pour que rien ne bouge sur des vues déjà très cadrées.
 */
export const MAX_PANELS: readonly Panel[] = [
  {
    id: "ecrin",
    kind: "photo",
    src: `${DIR}/ecrin.avif`,
    tag: "L'écrin",
    title: "Posé dans la forêt.",
    text: "Un volume net dans les pins, au petit matin.",
    motion: "zoom",
  },
  {
    id: "sejour",
    kind: "photo",
    src: `${DIR}/cuisine.avif`,
    tag: "Séjour-cuisine",
    title: "Vivre grand dans le juste.",
    text: "Cuisine îlot, plan en marbre, bandeau vitré sur le paysage.",
    motion: "fade",
  },
  {
    id: "chambre",
    kind: "photo",
    src: `${DIR}/chambre.avif`,
    tag: "La chambre",
    title: "Le calme, cadré sur l'essentiel.",
    text: "Une fenêtre comme un tableau, la lumière du matin.",
    motion: "fade",
  },
  {
    id: "bain",
    kind: "photo",
    src: `${DIR}/bain.avif`,
    tag: "La salle de bain",
    title: "Net, lumineux, sans superflu.",
    text: "Miroir rond, plan suspendu. Compacte, jamais étriquée.",
    motion: "fade",
  },
  {
    id: "loggia",
    kind: "video",
    src: "/assets/arko/video/loggia.mp4",
    poster: "/assets/arko/video/loggia-poster.jpg",
    tag: "L'angle vitré",
    title: "Le dehors entre. La lumière reste.",
    text: "La loggia se creuse et s'ouvre en grand.",
  },
  {
    id: "terrasse",
    kind: "photo",
    src: `${DIR}/terrasse.avif`,
    tag: "La terrasse",
    title: "Le prolongement, dehors.",
    text: "Terrasse bois sur pilotis, bandeau de fenêtres, volume net.",
    motion: "fade",
  },
];

/** Vue du studio posé sur son terrain — section « Le parcours ». */
export const MAX_CLAIRIERE = `${DIR}/clairiere.avif`;
