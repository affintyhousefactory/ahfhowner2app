/* ============================================================
   Contenu — /bureau-de-jardin (ADR-038, lot 2).
   Source : `docs/specs/pages-seo/page-bureau-de-jardin.md`.

   ⚠ Écarts au copy source, imposés par ADR-029 :
   — le mot désignant l'habitation du visiteur est proscrit sur ce site ; les
     23 occurrences du brief deviennent « chez vous », « votre habitation »,
     « le logement principal ». Le sens ne change pas, le garde-fou tient.
   — la section 03 comparait le bureau à « un container habillé ». Le terme est
     à la blocklist : la comparaison passe par « un abri de chantier repeint »,
     qui dit la même chose sans le mot.

   ⚠ Prudence technique exigée par la spec (§03 et FAQ) : aucune performance
   chiffrée n'est affirmée — ni isolation, ni acoustique, ni thermique. Les
   caractéristiques réelles ne sont pas validées au dépôt, et la spec interdit
   explicitement de les inventer. Tout est formulé « selon la configuration ».
   ============================================================ */

export const BUREAU_DE_JARDIN = {
  hero: {
    eyebrow: "Bureau de jardin",
    chapo:
      "Travailler chez soi ne devrait pas signifier travailler dans son salon, sa chambre ou au milieu de la vie familiale.",
    paragraphes: [
      "Avec Arko, installez à quelques mètres de chez vous un espace de travail indépendant, lumineux et confortable, pensé comme un véritable bureau professionnel.",
    ],
    note: "Quelques pas pour aller travailler. Une vraie porte à fermer pour rentrer chez vous.",
  },

  concept: {
    titre: "Et si votre meilleur bureau était à dix mètres de chez vous ?",
    intro: [
      "Le télétravail a supprimé le trajet. Il n'a pas toujours supprimé les contraintes du travail à domicile : le manque de calme, la pièce partagée, les appels professionnels au milieu de la vie de famille, la difficulté à déconnecter le soir.",
      "Le bureau de jardin Howner recrée une frontière simple et naturelle entre les deux univers. Vous sortez, vous traversez votre jardin, vous entrez dans votre espace de travail. Le soir, vous fermez la porte et vous rentrez réellement chez vous.",
    ],
    benefices: [
      {
        titre: "Séparer",
        texte:
          "Une vraie frontière entre vie professionnelle et vie personnelle, matérialisée par une porte.",
      },
      {
        titre: "Se concentrer",
        texte: "Le calme d'un espace conçu pour travailler, et pour rien d'autre.",
      },
      {
        titre: "Recevoir",
        texte:
          "Un espace crédible et indépendant pour accueillir ponctuellement un client ou un partenaire.",
      },
      {
        titre: "Valoriser",
        texte:
          "Un espace architectural durable et polyvalent ajouté à la propriété.",
      },
    ],
  },

  serieux: {
    titre: "Votre activité mérite mieux qu'un bureau improvisé.",
    intro: [
      "Un bureau de jardin Howner n'est ni une cabane aménagée, ni un abri de chantier repeint, ni une dépendance dans laquelle on aurait posé un ordinateur.",
      "Les modèles Arko sont conçus comme de véritables espaces de vie et de travail, avec une approche architecturale et constructive exigeante.",
    ],
    /* Formulé en intentions de conception, pas en performances mesurées :
       aucune valeur n'est validée au dépôt et la spec l'interdit. */
    points: [
      "le confort thermique et l'isolation, selon la configuration retenue",
      "la qualité acoustique d'un volume dédié",
      "la lumière naturelle et de grandes ouvertures",
      "des finitions intérieures et extérieures premium",
      "une installation électrique pensée pour un usage professionnel",
      "le chauffage ou le rafraîchissement, selon les options choisies",
      "la connectivité et les équipements adaptés au télétravail",
      "la durabilité de l'ossature",
    ],
    reserve:
      "Le niveau d'équipement dépend de la configuration retenue : les caractéristiques précises se définissent avec votre projet, elles ne sont pas identiques d'un studio à l'autre.",
  },

  lsf: {
    titre: "Une architecture légère. Une vraie construction.",
    intro: [
      "Les bureaux Arko reposent sur une ossature Light Steel Frame : une structure métallique légère qui associe précision de fabrication, résistance, optimisation structurelle et liberté architecturale.",
    ],
    arguments: [
      {
        titre: "Précision",
        texte:
          "Une structure conçue et préparée avec une logique de fabrication maîtrisée, plutôt qu'une succession d'ajustements sur chantier.",
      },
      {
        titre: "Durabilité",
        texte:
          "Une ossature métallique stable et pérenne, adaptée à un espace destiné à rester en place.",
      },
      {
        titre: "Architecture",
        texte:
          "Une technologie compatible avec des lignes contemporaines et de larges ouvertures — l'écriture d'une vraie architecture, pas celle d'un abri de jardin.",
      },
      {
        titre: "Fabrication hors-site",
        texte:
          "Une part importante de la réalisation est préparée en atelier, ce qui réduit les interventions et les perturbations sur la propriété par rapport à un chantier traditionnel.",
      },
    ],
    phrase:
      "Arko reprend les codes de la construction contemporaine et les concentre dans quelques mètres carrés parfaitement pensés.",
  },

  modeles: {
    titre: "Quel Arko pour votre bureau ?",
    intro:
      "Deux formats, deux façons de travailler. Le choix se fait sur l'usage, pas sur la surface.",
    one: {
      accroche: "Compact à l'extérieur. Professionnel à l'intérieur.",
      texte:
        "Le format privilégié pour un bureau individuel premium : suffisamment séparé du logement principal pour changer réellement la façon de travailler.",
      usages: [
        "télétravail quotidien",
        "bureau de dirigeant",
        "activité de consultant",
        "cabinet ou espace de rendez-vous ponctuel",
        "studio créatif ou espace de concentration",
      ],
    },
    max: {
      accroche: "Plus qu'un bureau : un espace professionnel indépendant à domicile.",
      texte:
        "Le format pour les usages qui demandent du volume ou plusieurs fonctions dans un même espace, avec de vraies zones distinctes.",
      usages: [
        "grand bureau de direction",
        "deux postes de travail",
        "espace bureau et coin réunion",
        "activité indépendante avec accueil de clients",
        "studio professionnel polyvalent, appelé à évoluer",
      ],
    },
  },

  comparatif: {
    titre: "Quel bureau de jardin Arko est fait pour vous ?",
    lignes: [
      { besoin: "Bureau individuel", one: "Oui", max: "Oui" },
      { besoin: "Télétravail régulier", one: "Oui", max: "Oui" },
      { besoin: "Espace compact", one: "Oui", max: "—" },
      { besoin: "Deux postes de travail", one: "Selon aménagement", max: "Oui" },
      { besoin: "Coin réunion", one: "Selon aménagement", max: "Oui" },
      { besoin: "Accueil professionnel", one: "Possible", max: "Particulièrement adapté" },
      { besoin: "Espace multi-usage", one: "Possible", max: "Oui" },
    ],
    relance:
      "Vous hésitez ? Configurez votre projet et choisissez l'espace adapté à votre façon de travailler.",
  },

  journee: {
    titre: "Conçu pour les journées où vous avez vraiment besoin de travailler",
    recit: [
      "8 h 27. Vous prenez votre café, vous traversez le jardin, vous ouvrez votre bureau.",
      "8 h 30. Vous êtes au travail. Pas de voiture, pas de transport, pas de pièce à libérer à l'intérieur.",
      "À midi, vous êtes rentré en quelques secondes. Et quand la journée se termine, votre ordinateur reste au bureau — pas sur la table du salon.",
    ],
    benefices: [
      "la concentration d'un lieu qui n'a qu'un usage",
      "la confidentialité des appels",
      "une meilleure organisation de la journée",
      "une séparation nette entre le travail et le domicile",
      "la suppression du temps de transport",
      "le confort d'un espace dédié, aménagé selon votre activité",
    ],
  },

  evolutif: {
    titre: "Aujourd'hui votre bureau. Demain, peut-être autre chose.",
    intro: [
      "Votre besoin professionnel peut évoluer. Votre espace aussi.",
    ],
    usages: [
      "bureau",
      "studio créatif ou salle de musique",
      "espace de sport",
      "chambre d'appoint",
      "espace indépendant pour un proche",
      "pièce complémentaire du logement principal",
    ],
    reserve:
      "Tout changement d'usage ou d'aménagement dépend du projet, des équipements retenus et des règles d'urbanisme applicables à votre terrain.",
  },

  sansTravaux: {
    titre: "Agrandir votre espace de travail, pas votre logement.",
    intro: [
      "Transformer une chambre, condamner un garage, réaliser une extension attenante, louer un bureau en ville ou payer un espace de coworking : chacune de ces options se paie en surface intérieure, en travaux ou en trajets.",
      "Le bureau de jardin crée un espace professionnel dédié sans bouleverser l'organisation intérieure, et garde une qualité que les autres n'ont pas : la proximité.",
    ],
    phrase: "Assez proche pour y aller à pied. Assez loin pour vraiment travailler.",
  },

  faq: [
    {
      q: "Qu'est-ce qu'un bureau de jardin ?",
      a: "Un espace de travail indépendant implanté sur la propriété, à proximité du logement principal. Contrairement à une pièce de télétravail aménagée à l'intérieur, il crée une séparation physique entre l'activité professionnelle et la vie privée.",
    },
    {
      q: "Pourquoi installer son bureau dans le jardin ?",
      a: "Pour disposer d'un espace calme et dédié tout en restant à quelques mètres de chez soi. Cette séparation facilite la concentration, les appels professionnels et la déconnexion en fin de journée.",
    },
    {
      q: "Arko One ou Arko Max : lequel choisir pour un bureau ?",
      a: "Arko One privilégie une approche compacte, particulièrement adaptée à un bureau individuel. Arko Max ouvre davantage de possibilités : plusieurs postes, un coin réunion, ou plusieurs zones de travail dans un même volume.",
    },
    {
      q: "Un bureau de jardin peut-il être utilisé toute l'année ?",
      a: "Un studio Arko est conçu comme un espace habitable, isolé et équipé — pas comme un abri de jardin saisonnier. Le niveau de confort dépend de la configuration retenue : isolation, menuiseries, chauffage et rafraîchissement se définissent avec votre projet.",
    },
    {
      q: "Quelle autorisation faut-il pour installer un bureau de jardin ?",
      a: "Les formalités dépendent de la surface, de l'emprise au sol, du PLU, de la localisation du terrain et de l'usage projeté. Il n'existe pas de règle unique applicable à tous les dossiers : la faisabilité administrative se vérifie projet par projet, auprès de votre commune.",
    },
    {
      q: "Peut-on recevoir des clients dans un bureau de jardin ?",
      a: "Selon l'activité exercée, l'aménagement, le statut du local et les règles applicables, cela peut s'envisager. Les obligations varient selon la profession : elles se vérifient au regard de votre activité, avant d'engager le projet.",
    },
    {
      q: "Peut-on personnaliser son bureau Arko ?",
      a: "Oui. Le configurateur présente les modèles, les aménagements et les options réellement disponibles, et vous permet de composer une première version de votre projet.",
    },
  ],

  final: {
    titre: "Votre prochain bureau est peut-être déjà dans votre jardin.",
    texte:
      "Quelques mètres suffisent parfois pour changer complètement sa manière de travailler. Choisissez Arko One ou Arko Max, et imaginez un espace conçu autour de votre activité, à quelques pas de chez vous.",
  },
} as const;
