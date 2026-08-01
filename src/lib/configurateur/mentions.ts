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
  "Un module de 20 m² relève en général d'une déclaration préalable, un module de 40 m² d'un permis de construire. Le régime exact dépend de votre commune, du règlement local et de la présence d'un bâtiment existant. Loi littoral, périmètre protégé, zone inondable, recul de voirie : ces points sont vérifiés par notre équipe lors de l'étude de votre terrain.";

/** Écran 6 — texte du devis (ADR-030 § Écarts assumés, point 4). */
export const DEVIS_TEXTE = {
  intro:
    "Après votre échange avec notre conseiller, vous recevrez un devis détaillé mentionnant un échéancier et une demande de paiement de réservation validant votre exclusivité.",
  ligne: "Acompte de réservation Arko — remboursable, sans engagement de construction",
  conditions: "Conditions précisées dans les",
} as const;

/** Écran 6 — socle Signature (§4). ⚠ Contenu à valider par Howner (§17.2). */
export const SOCLE = {
  compris:
    "Ossature, isolation biosourcée, bardage, menuiseries triple vitrage, chauffage, électricité, plomberie, cuisine et salle d'eau, fondations sur pieux vissés, fabrication, transport, levage et pose.",
  charge:
    "Terrassement, raccordements aux réseaux, étude de sol si exigée, aménagement des accès camion et grue si nécessaire, mobilier et décoration.",
} as const;

/** Opt-in email — texte repris de `ContactForm.tsx`, inchangé (ADR-026). */
export const OPTIN_TEXTE =
  "J'accepte de recevoir des informations et actualités sur l'ARKO par email. Désinscription possible à tout moment.";
