/* ============================================================
   Contenu — /bureau-pour-teletravail (ADR-038, lot 2).
   Source : `docs/specs/pages-seo/page-bureau-pour-teletravail.md`.

   ⚠ ANGLE DIFFÉRENCIANT — à ne pas perdre de vue en modifiant cette page.
   Elle est très proche de `/bureau-de-jardin`, et deux pages qui se disputent
   la même requête s'affaiblissent mutuellement. Le partage est le suivant :

     · `/bureau-de-jardin`      → **l'objet** : ce qu'est un bureau de jardin,
                                  l'ossature LSF, les modèles, la journée type.
     · `/bureau-pour-teletravail` → **la situation** : ce que le télétravail
                                  fait au logement, les profils, les
                                  alternatives (pièce détournée, extension),
                                  l'organisation qui en découle.

   D'où l'absence ici d'une section LSF développée : elle vit sur l'autre page,
   vers laquelle celle-ci renvoie explicitement. Dupliquer le bloc reviendrait
   à faire se concurrencer deux pages du même site.

   ⚠ Écarts au copy source, imposés par ADR-029 : les mentions de l'habitation
   du visiteur employaient le terme proscrit (22 fois) ; la meta description
   suggérée qualifiait les studios par un terme de la blocklist. Réécrits.

   ⚠ Aucune performance chiffrée, aucune promesse de valorisation immobilière,
   aucun régime administratif présenté comme automatique — les trois sont
   explicitement interdits par la spec.
   ============================================================ */

export const BUREAU_TELETRAVAIL = {
  hero: {
    eyebrow: "Bureau pour télétravail",
    chapo:
      "Le télétravail a supprimé le trajet. Il n'a pas supprimé le besoin d'un lieu de travail.",
    paragraphes: [
      "Une table de salle à manger dépanne quelques jours. Une chambre d'amis fait un bureau temporaire. Mais quand le télétravail devient régulier, les compromis se voient — et ils se paient en concentration, en confidentialité et en soirées qui n'en sont plus.",
    ],
    note: "Votre bureau est dans votre jardin. Pas dans votre logement.",
  },

  probleme: {
    titre: "Travailler de chez soi ne devrait pas signifier travailler n'importe où",
    intro: [
      "Le télétravail a changé notre manière d'habiter. Lorsqu'il s'installe dans la durée, ce sont toujours les mêmes contraintes qui reviennent.",
    ],
    points: [
      "le bruit et les interruptions",
      "le manque de confidentialité",
      "la difficulté à se concentrer",
      "un espace de travail à ranger chaque soir",
      "la confusion entre temps professionnel et temps personnel",
      "des visioconférences au milieu de la vie familiale",
      "l'impossibilité de recevoir un client dans de bonnes conditions",
    ],
    conclusion:
      "Un bureau indépendant rend ce que le travail à domicile fait disparaître : un lieu professionnel clairement identifié.",
  },

  benefices: {
    titre: "Un espace conçu pour travailler, pas une pièce détournée de son usage",
    arguments: [
      {
        titre: "Séparer vraiment le professionnel du personnel",
        texte:
          "Quelques mètres entre le logement et le bureau suffisent à créer une rupture physique. Le matin, vous allez au bureau. Le soir, vous le quittez — et le travail ne s'installe pas durablement au cœur des espaces familiaux.",
      },
      {
        titre: "Retrouver le calme et la concentration",
        texte:
          "Visioconférences, appels, rédaction, conception, gestion, création : l'espace n'est plus partagé avec les usages domestiques, et n'a plus à s'y adapter.",
      },
      {
        titre: "Libérer de la surface à l'intérieur",
        texte:
          "Installer son bureau dehors, c'est récupérer la pièce qui lui servait. Une chambre redevient une chambre, une mezzanine retrouve son usage, le salon cesse d'être un espace de travail improvisé.",
      },
      {
        titre: "Créer un cadre professionnel valorisant",
        texte:
          "Pour un indépendant, un dirigeant ou un consultant exerçant depuis son domicile, un espace dédié change la perception du lieu de travail : on y travaille, on y échange à distance, on y reçoit ponctuellement.",
      },
      {
        titre: "Rester proche de chez soi",
        texte:
          "Pas de trajet quotidien, pas de second local, pas de bureau à louer en ville. Votre espace professionnel reste accessible en quelques secondes.",
      },
    ],
  },

  serieux: {
    titre: "Beaucoup plus qu'un abri de jardin équipé",
    intro: [
      "Un bureau occupé plusieurs heures par jour ne peut pas être pensé comme une cabane aménagée. Il doit offrir les qualités d'un véritable espace intérieur : confort, luminosité, isolation, stabilité, durabilité, qualité architecturale et équipements adaptés à un usage quotidien.",
      "Les modèles Arko sont conçus dans cette logique, sur une ossature acier léger LSF préparée hors-site.",
    ],
    /* Renvoi explicite vers la page qui porte le sujet constructif : le bloc
       n'est pas dupliqué ici, il est lié. */
    lien: {
      texte: "La construction en détail — ossature, fabrication hors-site, modèles",
      href: "/bureau-de-jardin",
    },
  },

  profils: {
    titre: "Un bureau de jardin, pour qui ?",
    cartes: [
      {
        titre: "Salarié en télétravail",
        texte:
          "Retrouver un environnement calme plusieurs jours par semaine, sans immobiliser une pièce du logement.",
      },
      {
        titre: "Indépendant ou freelance",
        texte:
          "Disposer d'un espace professionnel permanent, et dissocier clairement l'activité du domicile.",
      },
      {
        titre: "Dirigeant",
        texte:
          "Travailler, mener ses visioconférences et recevoir ponctuellement dans un cadre plus professionnel.",
      },
      {
        titre: "Consultant",
        texte:
          "Un bureau confortable et calme, à la hauteur de journées de travail intensives.",
      },
      {
        titre: "Profession créative",
        texte:
          "Architecture, design, photographie, écriture, illustration, développement : un espace séparé préserve la concentration.",
      },
      {
        titre: "Couple en télétravail",
        texte:
          "Un format plus généreux permet d'organiser deux postes, plutôt que de voir chaque pièce disponible devenir un bureau.",
      },
    ],
  },

  alternatives: {
    titre: "Une autre manière de gagner de l'espace",
    intro:
      "Il ne s'agit pas d'opposer les solutions : chacune répond à un objectif différent. Le tableau situe le bureau indépendant lorsque le but est précisément de séparer.",
    entetes: ["Ce que vous cherchez", "Pièce intérieure", "Extension", "Bureau Arko"] as const,
    lignes: [
      { critere: "Séparation professionnelle / personnelle", piece: "Faible", extension: "Moyenne", arko: "Forte" },
      { critere: "Mobilise une pièce existante", piece: "Oui", extension: "Non", arko: "Non" },
      { critere: "Indépendance du lieu", piece: "Non", extension: "Partielle", arko: "Oui" },
      { critere: "Adapté aux visioconférences", piece: "Variable", extension: "Oui", arko: "Oui" },
      { critere: "Accès indépendant possible", piece: "Non", extension: "Selon projet", arko: "Oui" },
      { critere: "Conçu pour le travail", piece: "Rarement", extension: "Selon projet", arko: "Oui" },
    ],
  },

  patrimoine: {
    titre: "Vous n'ajoutez pas seulement un bureau. Vous ajoutez un usage à votre propriété.",
    intro: [
      "Aujourd'hui, un bureau de télétravail. Demain, selon le modèle, la configuration et les usages permis : un espace créatif, un studio indépendant, une chambre complémentaire, une pièce d'appoint.",
    ],
    conclusion:
      "Un espace supplémentaire bien conçu peut enrichir les usages possibles de votre propriété, sans modifier profondément l'organisation de l'existant.",
    reserve:
      "Tout changement d'usage dépend de la configuration retenue, des équipements et des règles d'urbanisme applicables. Nous ne promettons aucune valorisation chiffrée.",
  },

  design: {
    titre: "Un bureau que vous avez envie de regarder depuis chez vous",
    intro: [
      "Un bureau de jardin fait partie du paysage quotidien : son architecture compte autant que son usage. Lignes contemporaines, intégration au jardin, grandes ouvertures, lumière naturelle et finitions soignées ne sont pas un supplément — ce sont les conditions pour qu'il ne dépare pas.",
    ],
    phrase:
      "Votre bureau est visible depuis chez vous. Autant qu'il participe à votre architecture.",
  },

  parcours: {
    titre: "De votre besoin à votre futur bureau",
    etapes: [
      {
        titre: "Choisissez votre usage",
        texte: "Bureau individuel, double poste, réunion, création, polyvalence.",
      },
      {
        titre: "Sélectionnez votre modèle",
        texte: "Arko One ou Arko Max, selon votre besoin d'espace.",
      },
      {
        titre: "Configurez votre projet",
        texte: "Personnalisez votre studio : ambiance, finitions, équipements, options.",
      },
      {
        titre: "Étudions l'implantation",
        texte:
          "La faisabilité dépend du terrain, de son accès, des règles d'urbanisme applicables et de la configuration retenue.",
      },
    ],
    reserve:
      "Aucune autorisation, aucune pose et aucune faisabilité ne sont acquises d'avance : c'est l'étude du projet qui les établit.",
  },

  faq: [
    {
      q: "Peut-on installer un bureau pour télétravailler dans son jardin ?",
      a: "Un bâtiment indépendant peut être utilisé comme espace de travail, sous réserve que le projet soit compatible avec le terrain, les règles d'urbanisme applicables et, le cas échéant, les formalités administratives requises. Ces conditions se vérifient projet par projet.",
    },
    {
      q: "Quelle surface choisir pour un bureau de télétravail ?",
      a: "Cela dépend surtout des usages. Un bureau individuel demande moins d'espace qu'un bureau pour deux personnes, un coin réunion ou une pièce destinée à recevoir ponctuellement des clients. Le choix se fait à partir de l'usage, pas de la surface.",
    },
    {
      q: "Pourquoi un bureau indépendant plutôt qu'une pièce du logement ?",
      a: "Pour séparer la vie professionnelle de la vie personnelle, préserver les pièces existantes et disposer d'un environnement conçu pour travailler plutôt que d'une pièce détournée de son usage.",
    },
    {
      q: "Un bureau de jardin peut-il servir à autre chose plus tard ?",
      a: "Selon sa conception, ses équipements, son implantation et le cadre réglementaire applicable, un bâtiment indépendant peut offrir différents usages au fil du temps. C'est un avantage de conception, pas un changement de destination acquis d'avance.",
    },
    {
      q: "Quelle différence avec un abri de jardin aménagé ?",
      a: "Un studio Arko est conçu dès l'origine pour offrir les qualités d'un véritable espace intérieur : structure, enveloppe, confort, architecture et organisation adaptées à une occupation régulière — là où un abri est d'abord destiné au rangement.",
    },
    {
      q: "Arko One ou Arko Max pour un bureau ?",
      a: "Arko One convient à un bureau compact et individuel. Arko Max laisse davantage de latitude pour plusieurs postes, un espace réunion ou une configuration professionnelle polyvalente. Le configurateur permet d'affiner le choix.",
    },
  ],

  final: {
    titre: "Et si votre prochain bureau était dans votre jardin ?",
    texte:
      "Vous savez déjà pourquoi vous avez besoin de plus d'espace. Il reste à imaginer celui dans lequel vous aurez envie de travailler chaque jour.",
  },
} as const;
