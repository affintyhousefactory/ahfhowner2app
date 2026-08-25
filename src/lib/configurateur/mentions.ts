/**
 * Mentions du configurateur — textes exacts du §10 de la spec (ADR-030).
 *
 * Règle d'affichage, non négociable : « Une bulle ne suffit jamais pour une
 * mention essentielle : la mention courte est **visible sans interaction**, la
 * bulle donne le détail. » D'où la forme `{ courte, detail }` — le composant
 * `Mention` rend toujours `courte`, et `detail` dans un dépliant accessible au
 * clavier et au toucher.
 *
 * Ne pas reformuler : ces textes sont fournis au mot et vérifiés en recette
 * (§16). Toute retouche passe par un amendement d'ADR-030.
 */

export type MentionTexte = { courte?: string; detail: string };

export const MENTIONS = {
  usage: {
    detail:
      "Nos unités s'implantent sur un terrain déjà bâti, ou dans un établissement d'hébergement existant. La construction d'un logement indépendant sur terrain nu arrive prochainement : inscrivez-vous pour être informé en priorité.",
  },

  ambiance: {
    courte: "Visuel non contractuel — mobilier non inclus.",
    detail:
      "Visuel d'ambiance non contractuel. Teintes, matériaux et mobilier présentés sont indicatifs et peuvent varier selon les approvisionnements. Le mobilier et la décoration ne sont pas inclus. Les références exactes sont arrêtées au dossier de personnalisation, après réservation.",
  },

  /* Ajoutée le 2026-08-20 avec la rubrique d'ambiance intérieure. Distincte de
     `ambiance`, qui porte sur le bardage : les rendus intérieurs montrent du
     mobilier et des équipements dont l'inclusion dépend de la configuration —
     la réserve doit donc être plus explicite sur ce point précis. */
  ambianceInterieure: {
    courte: "Rendus non contractuels — aménagement selon configuration.",
    detail:
      "Rendus intérieurs non contractuels. Finitions, teintes, équipements et aménagements présentés sont indicatifs : ils dépendent de la configuration retenue et peuvent varier selon les approvisionnements. Le mobilier et la décoration ne sont pas inclus. Les références exactes sont arrêtées au dossier de personnalisation, après réservation.",
  },

  option: {
    courte: "Options fournies et posées — hors travaux de terrain.",
    detail:
      "Cette option est ajoutée à votre prix. Elle comprend la fourniture, la pose et la mise en service. Elle ne comprend pas les travaux de terrain ni les raccordements extérieurs. Sa faisabilité est confirmée à la visite technique.",
  },

  optionStructurelle: {
    detail:
      "Cette option modifie la structure de votre unité et entre dans l'étude d'exécution. Elle se choisit maintenant : elle ne pourra plus être ajoutée après votre réservation.",
  },

  prix: {
    courte: "Estimation indicative — seul le devis signé fait foi.",
    detail:
      "Estimation indicative, non contractuelle. Prix TTC, TVA 20 % (construction neuve). Seul le devis signé après visite technique fait foi. Les raccordements aux réseaux, les fondations et les travaux de terrain ne sont pas compris.",
  },

  terrain: {
    courte: "Informations transmises à notre équipe — pré-analyse indicative.",
    detail:
      "Ces informations nous servent à préparer l'étude de votre terrain. Aucune vérification d'urbanisme n'est faite automatiquement : votre parcelle est étudiée par nos soins, à la main, après votre réservation.",
  },

  creneau: {
    detail:
      "La série 01 est limitée à six unités. Votre réservation bloque un créneau de production pendant 30 jours, le temps de l'étude de votre terrain et de la visite technique. Passé ce délai sans signature, le créneau repart au premier inscrit sur la liste d'attente et votre réservation vous est intégralement remboursée.",
  },

  transport: {
    detail:
      "Forfait indicatif calculé depuis notre atelier de Bayonne, confirmé après vérification de l'accès du camion et de la grue.",
  },
} as const satisfies Record<string, MentionTexte>;

/**
 * Information d'urbanisme — générique, au conditionnel, jamais liée à la
 * parcelle saisie (§8). Affichée en statique à côté de la pré-analyse.
 */
export const URBANISME_GENERIQUE =
  "Un studio de jardin de 20 m² relève en général d'une déclaration préalable, un studio de 40 m² d'un permis de construire. Le régime exact dépend de votre commune, du règlement local et de la présence d'un bâtiment existant. Loi littoral, périmètre protégé, zone inondable, recul de voirie : ces points sont vérifiés par notre équipe lors de l'étude de votre terrain.";

/** Écran 6 — texte du devis (ADR-030 § Écarts assumés, point 4). */
export const DEVIS_TEXTE = {
  intro:
    "Après votre échange avec notre conseiller, vous recevrez un devis détaillé mentionnant un échéancier et une demande de paiement de réservation validant votre exclusivité.",
  /* « Acompte » → « versement initial » le 2026-08-22 : le §8.3 des CGV
     validées qualifie cette somme de versement initial de réservation,
     intégralement remboursable, qui « ne constitue pas un engagement
     définitif ». Un acompte, lui, engage fermement (art. 1590 du Code civil).
     Le §10 de la spec impose de ne pas reformuler ces textes ; ici la
     reformulation est imposée par un document opposable, et actée à
     l'ADR-015 § Amendement du 2026-08-22. */
  ligne: "Versement initial de réservation Arko — intégralement remboursable avant signature du contrat",
  conditions: "Conditions précisées dans les",
} as const;

/**
 * Un poste du socle. `href` et `note` sont réservés aux termes qui appellent
 * une explication : le sigle LSF ne dit rien à qui le lit pour la première
 * fois, et c'est précisément le poste le plus structurant du prix.
 */
export type PosteSocle = {
  texte: string;
  href?: string;
  /** Développé du terme, affiché en exposant au survol et au clavier. */
  note?: string;
  /**
   * Précision rendue **après** l'appel de note, pas avant.
   *
   * Sert au seul cas où le terme qui appelle la note est suivi de son
   * développé entre parenthèses : « VRD** (voirie et réseaux divers) ». Sans
   * ce champ, l'appel se poserait après la parenthèse et renverrait à
   * l'explication plutôt qu'au terme.
   */
  complement?: string;
};

/**
 * Écran de réservation — ce que le prix couvre, et ce qu'il ne couvre pas.
 * ⚠ Contenu à valider par Howner (§17.2).
 *
 * Structuré en postes plutôt qu'en une phrase depuis le 2026-08-20 : l'un
 * d'eux porte un lien, et découper une chaîne pour y glisser un lien aurait
 * mis la mise en forme dans la donnée.
 */
export const SOCLE = {
  compris: [
    {
      texte: "ossature LSF",
      href: "/a-propos#acier-leger",
      note: "technologie LSF, Light Steel Frame",
    },
    { texte: "isolation biosourcée" },
    { texte: "bardage joint debout" },
    { texte: "menuiseries double vitrage aluminium" },
    { texte: "chauffage électrique" },
    { texte: "électricité" },
    { texte: "plomberie" },
    { texte: "cuisine et salle d'eau" },
    { texte: "fondations sur pieux vissés" },
    { texte: "fabrication, transport, levage et pose" },
  ] as readonly PosteSocle[],
  /* « À votre charge » → « Non inclus » (2026-08-20) : la première formule
     désignait une dette du client avant même le devis. La seconde dit la même
     chose sans la faire porter à personne. */
  nonInclus: [
    { texte: "terrassement" },
    {
      texte: "travaux d'aménagement VRD",
      complement: " (voirie et réseaux divers)",
      note: "Prix estimatif entre 5 000 € et 15 000 € selon distance et difficultés de raccordement",
    },
    { texte: "raccordements aux réseaux" },
    {
      texte: "assainissement non collectif — micro-station",
      note: "Prix estimatif entre 4 000 € et 12 000 €",
    },
    { texte: "étude de sol si exigée" },
    { texte: "aménagement des accès camion et grue si nécessaire" },
    { texte: "mobilier et décoration" },
  ] as readonly PosteSocle[],
} as const;

/**
 * Appel de note d'un poste — `*`, `**`, `***`…
 *
 * Le rang est calculé sur l'ordre d'apparition **dans les deux listes réunies**,
 * « Compris » puis « Non inclus » : la note de l'ossature LSF est la première,
 * celles des VRD et de la micro-station suivent, alors qu'elles vivent dans
 * l'autre liste. Une numérotation par liste redonnerait `*` aux VRD et ferait
 * cohabiter deux notes différentes sous le même appel dans un même encart.
 *
 * Calculé, jamais écrit dans les données : un appel de note recopié à la main
 * se désynchronise au premier poste inséré.
 */
const POSTES_NOTES = [...SOCLE.compris, ...SOCLE.nonInclus].filter((p) => p.note);

export function appelDeNote(poste: PosteSocle): string | null {
  const rang = POSTES_NOTES.findIndex((p) => p.texte === poste.texte);
  return rang < 0 ? null : "*".repeat(rang + 1);
}

/** Opt-in email — texte repris de `ContactForm.tsx`, inchangé (ADR-026). */
export const OPTIN_TEXTE =
  "J'accepte de recevoir des informations et actualités sur l'ARKO par email. Désinscription possible à tout moment.";

/**
 * Branche « terrain nu » — CTA vers le formulaire de contact.
 *
 * Sujet « Autre demande » et message pré-rempli. ADR-029 : Howner est la seule
 * entité citée côté client, jamais une autre raison sociale.
 *
 * ⚠ `ContactForm` ne lit aujourd'hui que `?numero=` et `?ref=` — la lecture de
 * `sujet` et `message` est ajoutée avec cette fonctionnalité.
 */
export const CONTACT_TERRAIN_NU_MESSAGE =
  "Je souhaite être informé des options personnalisées que Howner peut me proposer en terme de recherche de terrain.";

export const CONTACT_TERRAIN_NU =
  `/contact?sujet=autre&message=${encodeURIComponent(CONTACT_TERRAIN_NU_MESSAGE)}`;
