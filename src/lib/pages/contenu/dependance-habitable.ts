/* ============================================================
   Contenu — /dependance-habitable (ADR-038, lot 2).
   Source : `docs/specs/pages-seo/page-dependance-habitable.md`.

   ⚠ Écarts au copy source, imposés par ADR-029 : les mentions de l'habitation
   du visiteur employaient le terme proscrit ; elles deviennent « habitation
   principale », « logement principal », « chez vous ». Le brief employait
   aussi deux formules de la blocklist dans ses consignes de rédaction — elles
   ne passent pas dans le copy.

   ⚠ Cadre de vente (ADR-029, et consigne n°11 de la spec) : cette page décrit
   une **annexe sur une parcelle déjà bâtie**. Rien n'y présente le logement
   indépendant sur terrain nu comme disponible — c'est précisément la
   configuration que la marque n'ouvre pas.

   ⚠ Urbanisme : la spec interdit explicitement l'argument « sans permis »
   comme promesse commerciale. Le parti retenu est l'inverse — on annonce que
   le projet et le terrain se vérifient d'abord.
   ============================================================ */

export const DEPENDANCE_HABITABLE = {
  hero: {
    eyebrow: "Dépendance habitable",
    chapo:
      "Une chambre indépendante, un studio pour recevoir, un espace pour un proche ou un projet locatif : transformez une partie de votre jardin en un espace supplémentaire confortable, durable et dessiné avec exigence.",
    paragraphes: [
      "Vous avez de la place dans votre jardin. L'enjeu n'est pas d'y ajouter quelques mètres carrés, mais de créer un espace où l'on a réellement envie de vivre, de recevoir ou de séjourner.",
      "Howner conçoit des studios de jardin premium, fabriqués hors-site sur une ossature acier léger LSF, pensés pour devenir une dépendance élégante et durable à proximité immédiate de votre habitation principale.",
    ],
    note: "Choisissez votre modèle, votre ambiance et vos options. La configuration est une première étape : la faisabilité se confirme après étude de votre projet.",
  },

  changements: {
    titre: "Quelques mètres dans le jardin. Beaucoup plus de possibilités au quotidien.",
    intro:
      "Créer une dépendance habitable permet de gagner de l'espace sans bouleverser l'organisation de l'habitation existante.",
    cartes: [
      {
        titre: "Recevoir sans se serrer",
        texte:
          "Une vraie chambre d'amis, mais indépendante : vos proches disposent de leur espace, de leur salle d'eau et de leur intimité.",
      },
      {
        titre: "Accueillir un proche",
        texte:
          "Un parent, un enfant adulte ou un proche garde son autonomie, à quelques mètres de vous plutôt qu'à plusieurs kilomètres.",
      },
      {
        titre: "Créer un studio dans son jardin",
        texte:
          "Pas un cabanon transformé après coup : un studio conçu dès le départ autour du confort, de la lumière, des usages et des équipements d'un véritable espace à vivre.",
      },
      {
        titre: "Imaginer un usage locatif",
        texte:
          "Selon la réglementation locale et la situation du projet, une dépendance peut répondre à un projet de location meublée ou touristique.",
      },
      {
        titre: "Préparer les usages de demain",
        texte:
          "Chambre aujourd'hui, espace pour un proche demain, studio indépendant ensuite : votre besoin peut changer, l'espace reste.",
      },
    ],
  },

  rupture: {
    titre: "Une dépendance habitable ne devrait pas ressembler à une annexe improvisée",
    intro: [
      "Créer un véritable espace habitable exige davantage qu'une structure posée au fond du jardin. La différence tient à ce qu'on y trouve, et à ce qui a été pensé avant.",
    ],
    points: [
      "une conception architecturale, pas un plan de rangement",
      "la qualité de l'enveloppe et des menuiseries",
      "la lumière naturelle, travaillée dès le dessin",
      "l'isolation et le confort thermique",
      "la ventilation, l'électricité, la plomberie",
      "une salle d'eau, et une cuisine selon le modèle et la configuration",
      "des finitions intérieures d'espace à vivre",
      "la durabilité de l'ossature",
      "l'intégration au jardin existant",
      "la préparation à une occupation réelle, pas occasionnelle",
    ],
    conclusion:
      "Chez Howner, la dépendance est pensée comme un espace à vivre dès le premier trait de conception.",
  },

  modeles: {
    titre: "Deux façons de créer votre dépendance habitable",
    intro:
      "Plutôt que de multiplier les variantes et les plans, Howner concentre son travail sur deux modèles complémentaires : des plans maîtrisés, des volumes étudiés, des ambiances personnalisables, une fabrication pensée pour la précision.",
    one: {
      accroche: "Compact à l'extérieur. Généreux dans son usage.",
      texte:
        "Le format adapté à une dépendance compacte : chambre indépendante, studio d'amis, espace pour un proche ou hébergement ponctuel. Sa surface contenue oblige à aller à l'essentiel — circulation optimisée, lumière, rangements, aucun mètre carré perdu.",
      usages: [
        "format studio, emprise compacte",
        "salle d'eau et espace de vie optimisé",
        "architecture contemporaine, plusieurs ambiances de finition",
        "options configurables",
        "ossature LSF, fabrication hors-site",
      ],
    },
    max: {
      accroche: "Quand la dépendance devient un lieu de vie à part entière.",
      texte:
        "Le format pour les projets qui demandent davantage d'autonomie et d'espace. Son organisation de type T2 sépare mieux les usages et se rapproche d'un petit appartement indépendant, tout en restant à proximité de l'habitation existante.",
      usages: [
        "organisation de type T2, espace de vie distinct",
        "chambre séparée et salle d'eau",
        "cuisine selon configuration",
        "architecture contemporaine, plusieurs ambiances",
        "ossature LSF, fabrication hors-site",
      ],
    },
  },

  comparatif: {
    titre: "Arko One ou Arko Max : quelle dépendance correspond à votre projet ?",
    lignes: [
      { besoin: "Organisation", one: "Studio", max: "Type T2" },
      { besoin: "Besoin d'emprise", one: "Compact", max: "Plus généreux" },
      { besoin: "Chambre d'amis", one: "Excellent choix", max: "Excellent choix" },
      { besoin: "Logement ponctuel d'un proche", one: "Adapté", max: "Très adapté" },
      { besoin: "Séjours prolongés", one: "Adapté", max: "Plus confortable" },
      { besoin: "Chambre séparée", one: "Non", max: "Oui" },
      {
        besoin: "Projet locatif, selon réglementation locale",
        one: "Possible selon projet",
        max: "Possible selon projet",
      },
      { besoin: "Niveau d'autonomie", one: "Élevé", max: "Très élevé" },
    ],
    relance:
      "Vous hésitez ? Commencez par votre usage : le configurateur vous permet de comparer les deux modèles et leurs options.",
  },

  construction: {
    titre: "Légère dans son mode constructif. Exigeante dans sa conception.",
    intro: [
      "Les studios Arko reposent sur une ossature en acier léger, dite LSF — Light Steel Frame. Cette technologie se prête particulièrement à la fabrication hors-site : les éléments structurels sont préparés avec précision avant l'installation de l'unité sur son emplacement définitif.",
    ],
    arguments: [
      {
        titre: "Précision",
        texte:
          "Une structure faite d'éléments industrialisés favorise la répétabilité et la maîtrise dimensionnelle.",
      },
      {
        titre: "Durabilité",
        texte:
          "L'acier forme une structure stable et pérenne lorsqu'il est correctement conçu et protégé dans son système constructif.",
      },
      {
        titre: "Liberté architecturale",
        texte:
          "La finesse de l'ossature autorise des volumes contemporains et un travail précis des ouvertures, des façades et de l'organisation intérieure.",
      },
      {
        titre: "Fabrication hors-site",
        texte:
          "L'essentiel du travail se fait en atelier plutôt que sur votre parcelle : moins d'interventions chez vous, des finitions contrôlées avant livraison, une logistique d'accès et de levage préparée en amont.",
      },
    ],
    conclusion:
      "Le résultat recherché n'est pas de montrer la technologie. C'est de la faire oublier une fois que vous êtes à l'intérieur.",
  },

  integration: {
    titre: "Votre dépendance doit compléter votre habitation, pas lui faire concurrence",
    intro: [
      "L'objectif n'est pas de reproduire l'existant à l'identique, mais de créer un dialogue entre l'habitation principale, le jardin et votre nouvel espace.",
    ],
    points: [
      "lignes contemporaines, bardages et teintes au choix",
      "grandes ouvertures et relation directe au jardin",
      "terrasse en option",
      "travail de la lumière selon l'orientation",
      "implantation étudiée selon le terrain",
    ],
    personnalisation: {
      titre: "Personnalisable, pas sur-mesure",
      texte:
        "Les plans et la structure des modèles Arko sont définis. Vous personnalisez ensuite votre studio par les choix proposés — ambiance, finitions, terrasse, confort, équipements et options disponibles selon le modèle. Ce principe préserve la cohérence du produit sans transformer chaque projet en prototype.",
    },
  },

  parcours: {
    titre: "De votre idée à votre dépendance : un parcours lisible",
    etapes: [
      {
        titre: "Configurez",
        texte: "Choisissez votre modèle, votre ambiance et vos principales options.",
      },
      {
        titre: "Présentez votre terrain",
        texte:
          "L'accès, l'implantation et les caractéristiques de la parcelle font partie intégrante de la faisabilité.",
      },
      {
        titre: "Échangez avec nous",
        texte:
          "Nous qualifions votre projet et identifions les points techniques ou administratifs à approfondir.",
      },
      {
        titre: "Validez votre projet",
        texte:
          "Prestations, options, conditions d'installation et prérequis sont précisés avant tout engagement définitif.",
      },
      {
        titre: "Fabrication et installation",
        texte:
          "Votre studio est préparé hors-site, puis livré et installé lorsque les conditions nécessaires sont réunies.",
      },
    ],
    reserve:
      "Toutes les parcelles ne peuvent pas accueillir un studio : c'est précisément ce que l'étude vérifie, avant que le projet n'aille plus loin.",
  },

  urbanisme: {
    titre: "Et les démarches pour installer une dépendance habitable ?",
    intro: [
      "Une dépendance habitable reste un projet d'aménagement immobilier : son implantation dépend de sa surface, de la configuration de la parcelle et des règles d'urbanisme de votre commune.",
      "Selon le modèle et la situation du terrain, une autorisation d'urbanisme peut être nécessaire. D'autres contraintes locales peuvent peser sur le projet : implantation, aspect extérieur, accès, environnement protégé, risques naturels ou prescriptions du document d'urbanisme.",
    ],
    phrase: "Nous commençons par vérifier votre projet et votre terrain avant d'aller plus loin.",
    reserve:
      "La configuration constitue une première étape. La faisabilité est confirmée après étude du projet — nous ne promettons aucune autorisation par avance.",
  },

  profils: {
    titre: "Une dépendance habitable pour chaque nouvelle étape de la vie",
    cartes: [
      {
        titre: "« Nous voulons pouvoir recevoir nos enfants et nos amis »",
        texte:
          "Les deux modèles conviennent : Arko One pour un accueil ponctuel, Arko Max pour des séjours plus longs.",
      },
      {
        titre: "« Un parent doit pouvoir vivre près de nous »",
        texte:
          "Arko Max en priorité, dès lors que le niveau d'autonomie recherché suppose une chambre séparée.",
      },
      {
        titre: "« Nous voulons créer un studio indépendant dans le jardin »",
        texte:
          "Arko One pour la compacité, Arko Max pour davantage d'espace et une organisation plus autonome.",
      },
      {
        titre: "« Nous voulons valoriser une partie de notre propriété »",
        texte:
          "Les deux modèles méritent l'examen. Tout projet locatif reste soumis à la réglementation applicable localement.",
      },
    ],
  },

  emotion: {
    titre:
      "Vous n'avez peut-être pas besoin de déménager. Peut-être simplement d'une pièce de plus.",
    lignes: [
      "Une chambre supplémentaire. Un endroit où recevoir. Un espace qui préserve l'autonomie d'un proche. Un studio qui donne un nouvel usage à votre jardin.",
      "Quand le besoin d'espace apparaît, la première réponse n'est pas nécessairement de changer de lieu de vie. Parfois, quelques mètres suffisent — à condition qu'ils soient bien dessinés.",
    ],
  },

  faq: [
    {
      q: "Qu'est-ce qu'une dépendance habitable ?",
      a: "Un espace distinct de l'habitation principale, implanté sur la même propriété et conçu pour des usages qui exigent un véritable niveau de confort : chambre, studio, accueil d'un proche ou autre usage autorisé.",
    },
    {
      q: "Quelle différence avec un abri de jardin ?",
      a: "Un abri de jardin sert d'abord au rangement ou à un usage annexe. Une dépendance habitable est pensée comme un espace à vivre, avec la conception, l'enveloppe, les équipements et le niveau de finition qu'appelle cet usage.",
    },
    {
      q: "Peut-on installer une dépendance habitable dans son jardin ?",
      a: "Cela dépend de la parcelle, des règles d'urbanisme locales, de la surface du projet et des caractéristiques de l'implantation. Nous qualifions le terrain et le projet avant toute validation.",
    },
    {
      q: "Faut-il une autorisation d'urbanisme ?",
      a: "Selon la surface, la commune et la situation du terrain, une déclaration préalable ou un permis de construire peut être nécessaire. La réglementation applicable se vérifie pour chaque projet : il n'existe pas de réponse unique.",
    },
    {
      q: "Peut-on accueillir un proche dans une dépendance ?",
      a: "C'est l'un des usages les plus fréquents. Arko One offre un format compact ; Arko Max permet une organisation plus indépendante, avec une chambre séparée.",
    },
    {
      q: "Peut-on louer une dépendance habitable ?",
      a: "Un usage locatif peut s'envisager, sous réserve des règles d'urbanisme, de destination, de fiscalité et de location applicables localement. Nous ne garantissons l'éligibilité d'aucun projet à la location.",
    },
    {
      q: "Quel modèle choisir entre Arko One et Arko Max ?",
      a: "Le choix dépend surtout de l'usage, de l'espace disponible et du niveau d'autonomie recherché. Arko One privilégie la compacité ; Arko Max offre une organisation de type T2.",
    },
    {
      q: "Comment une dépendance Howner est-elle fabriquée ?",
      a: "Sur une ossature acier léger LSF, préparée en grande partie hors-site avant livraison et installation — sous réserve de la validation du terrain et des prérequis du projet.",
    },
    {
      q: "Peut-on personnaliser son studio ?",
      a: "Oui, dans le cadre des choix prévus : ambiance, finitions, terrasse, confort, équipements. Les modèles sont personnalisables, ils ne sont pas conçus comme des projets intégralement sur-mesure.",
    },
    {
      q: "Comment savoir si mon terrain est adapté ?",
      a: "Le configurateur permet de commencer le projet, puis de nous transmettre les informations nécessaires à sa qualification. L'accès camion et grue, l'implantation, les réseaux et les règles locales font partie des éléments examinés.",
    },
  ],

  final: {
    titre: "Et si votre prochaine pièce était déjà dans votre jardin ?",
    texte:
      "Choisissez la surface qui correspond à votre projet, comparez les deux modèles, sélectionnez votre ambiance et vos options, puis transmettez-nous les premières informations sur votre terrain.",
    note: "Configuration indicative et sans engagement contractuel. Faisabilité, prestations et prix définitifs confirmés après étude et devis.",
  },
} as const;
