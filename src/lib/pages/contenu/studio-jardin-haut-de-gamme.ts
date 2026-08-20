/* ============================================================
   Contenu — /studio-jardin-haut-de-gamme (ADR-038, lot 2).

   Source : `docs/specs/pages-seo/page-studio-jardin-haut-de-gamme.md`.
   Le texte vit ici et jamais dans le composant, comme `ABOUT` / `PROCESS` /
   `FAQ` (`site.ts`) : une page éditoriale se corrige sans ouvrir de JSX.

   ⚠ Trois écarts au copy source, tous imposés par la blocklist ADR-029 : le
   texte d'Albert qualifiait deux fois la structure par un terme proscrit de la
   blocklist (lignes 100 et 213 de la spec), et parlait de « modularité » de la
   gamme. Les deux premiers deviennent « adaptée à la fabrication hors-site »,
   qui dit la même chose et que la marque revendique déjà ; le troisième
   devient « la souplesse de la gamme ».

   Aucun prix ici : la page renvoie au configurateur, elle ne peut donc pas se
   périmer avec les grilles (règle du 2026-08-04).
   ============================================================ */

export const HAUT_DE_GAMME = {
  hero: {
    eyebrow: "Studio de jardin haut de gamme",
    chapo:
      "Un bureau indépendant. Une suite pour recevoir. Un espace de travail. Un hébergement premium. Un lieu pour créer, louer ou simplement gagner de précieux mètres carrés.",
    paragraphes: [
      "Avec Arko One et Arko Max, Howner traite le studio de jardin comme un véritable espace d'architecture : contemporain, confortable, durable, et pensé pour s'intégrer naturellement à votre projet.",
      "Nos studios sont réalisés hors-site en technologie Light Steel Frame (LSF), une ossature légère en acier qui conjugue précision de fabrication, liberté architecturale et maîtrise de la qualité.",
    ],
    note: "Vous choisissez votre modèle, vos usages et vos options. Howner vous accompagne de l'étude du projet à la fabrication, puis à l'installation sur site.",
  },

  /* Duo de modèles — les surfaces et les noms viennent de `PRODUCTS`, jamais
     recopiés : un changement de gamme ne doit pas se rattraper page par page. */
  modeles: {
    titre: "Deux studios de jardin. Deux façons d'agrandir votre quotidien.",
    intro:
      "Howner a conçu une gamme volontairement claire, autour de deux modèles complémentaires.",
    one: {
      accroche: "L'essentiel, parfaitement dessiné.",
      texte:
        "Arko One concentre tout ce que l'on attend d'un studio de jardin premium : une architecture contemporaine, des proportions équilibrées et un espace pensé pour être réellement utilisé au quotidien.",
      usages: [
        "un bureau indépendant à domicile",
        "un studio pour recevoir famille ou amis",
        "une chambre ou une suite indépendante",
        "un espace bien-être ou créatif",
        "un hébergement destiné à un projet locatif ou professionnel, selon la faisabilité",
      ],
      conclusion:
        "Sa surface compacte crée un espace supplémentaire qualitatif sans surdimensionner le projet.",
    },
    max: {
      accroche: "Plus d'espace. Plus de possibilités. La même exigence architecturale.",
      texte:
        "Arko Max s'adresse aux projets qui demandent davantage de volume, de polyvalence et de confort. Il devient un véritable espace de vie indépendant, capable d'accueillir plusieurs usages dans une même implantation.",
      usages: [
        "un grand studio de jardin prêt à vivre",
        "un espace professionnel indépendant",
        "un hébergement premium",
        "un espace de réception",
        "un investissement locatif",
        "un projet d'accueil ou d'hébergement professionnel",
      ],
      conclusion:
        "Son format permet de travailler plus librement les volumes, les circulations et les usages, sans quitter l'écriture sobre et contemporaine de la gamme Arko.",
    },
  },

  pourquoi: {
    titre: "Pourquoi choisir un studio de jardin Howner ?",
    intro: [
      "Un studio de jardin haut de gamme ne se résume pas à quelques mètres carrés supplémentaires. Il doit être agréable à regarder, confortable à vivre et cohérent avec son environnement.",
      "C'est pour cette raison que Howner associe architecture, fabrication hors-site et technologie LSF dans une même approche.",
    ],
    arguments: [
      {
        titre: "Une vraie écriture architecturale",
        texte:
          "Arko One et Arko Max ne sont pas dessinés comme de simples annexes techniques. Chaque modèle cherche l'équilibre entre lignes contemporaines, lumière, volumes, fonctionnalité et qualité perçue : le studio doit trouver sa place dans votre extérieur tout en affirmant une identité forte.",
      },
      {
        titre: "Une ossature Light Steel Frame précise et durable",
        texte:
          "La technologie LSF repose sur une ossature légère en acier formée avec précision. Pour un studio de jardin, elle apporte une grande précision dimensionnelle, une excellente stabilité géométrique, une structure légère adaptée à la fabrication hors-site, une réelle liberté de conception, une industrialisation qui facilite le contrôle qualité, une ossature non combustible et un acier recyclable adossé à une filière structurée.",
        /* Nuance exigée par la spec (« points de vigilance ») : ne jamais
           imputer les performances finales à la seule ossature. */
        reserve:
          "La performance finale du studio dépend de l'ensemble de sa conception : isolation, enveloppe, étanchéité, menuiseries, ventilation, équipements et qualité de mise en œuvre.",
      },
      {
        titre: "Une fabrication hors-site pour mieux maîtriser la qualité",
        texte:
          "L'essentiel du studio est préparé dans un environnement de fabrication contrôlé, avant son installation sur votre terrain. Howner organise mieux les étapes, réduit les aléas du chantier traditionnel et renforce le contrôle des finitions avant livraison. Le chantier sur site devient plus concentré, et plus lisible.",
      },
      {
        titre: "Une installation plus rapide sur votre terrain",
        texte:
          "Parce que le studio est largement préparé en amont, l'intervention sur site est limitée par rapport à une réalisation entièrement construite sur place : moins de nuisances, moins d'interventions dispersées, un avancement plus facile à suivre.",
        reserve:
          "Les délais réels dépendent de la configuration retenue, des études préalables, des autorisations éventuelles, de l'accessibilité du terrain et de la préparation du site.",
      },
      {
        titre: "Un studio pensé autour de votre usage",
        texte:
          "Un studio de jardin n'a de valeur que s'il répond exactement à votre besoin. La réflexion part donc de l'usage : travailler, recevoir, louer, héberger, ou créer un espace calme et indépendant. Le configurateur vous permet de commencer votre projet en choisissant le modèle et les principales caractéristiques de votre futur studio.",
      },
    ],
  },

  exigences: {
    titre: "Le haut de gamme, ce n'est pas seulement une question de finition",
    intro:
      "Pour Howner, un studio de jardin premium repose sur une combinaison d'exigences.",
    lignes: [
      {
        exigence: "Architecture",
        approche:
          "Des lignes contemporaines et une gamme dessinée comme un véritable espace d'architecture",
      },
      {
        exigence: "Structure",
        approche:
          "Ossature Light Steel Frame légère et précise, adaptée à la fabrication hors-site",
      },
      {
        exigence: "Fabrication",
        approche:
          "Préparation hors-site, pour renforcer la maîtrise des étapes et de la qualité",
      },
      {
        exigence: "Confort",
        approche:
          "Une conception destinée à créer un espace réellement habitable et agréable au quotidien",
      },
      {
        exigence: "Personnalisation",
        approche: "Choix du modèle, des usages et des options via le configurateur",
      },
      {
        exigence: "Installation",
        approche:
          "Intervention sur site rationalisée grâce à la préparation réalisée en amont",
      },
      {
        exigence: "Accompagnement",
        approche:
          "Un parcours allant de l'étude du projet à la fabrication et à l'installation",
      },
    ],
  },

  choisir: {
    titre: "Arko One ou Arko Max : quel studio choisir ?",
    one: {
      condition: "Choisissez Arko One si…",
      texte:
        "vous recherchez un studio compact, élégant et parfaitement optimisé autour d'un usage principal.",
      resume: "Format compact — bureau, suite indépendante, accueil ou projet locatif ciblé.",
    },
    max: {
      condition: "Choisissez Arko Max si…",
      texte:
        "vous souhaitez davantage d'espace, plusieurs zones de vie ou une utilisation plus polyvalente.",
      resume:
        "Volume généreux — hébergement premium, activité professionnelle ou espace de vie indépendant.",
    },
    hesitation: {
      titre: "Vous hésitez encore ?",
      texte:
        "Commencez par votre besoin. Le configurateur transforme votre idée en une première configuration de studio.",
    },
  },

  usages: {
    titre: "Un studio de jardin pour de nombreux usages",
    cartes: [
      {
        titre: "Bureau de jardin haut de gamme",
        texte:
          "Un espace de travail séparé du lieu de vie, calme et lumineux, qui rend sa frontière à la vie professionnelle.",
      },
      {
        titre: "Studio pour recevoir",
        texte:
          "Un espace indépendant, confortable et valorisant pour vos proches, sans bouleverser l'organisation de votre intérieur.",
      },
      {
        titre: "Studio pour location",
        texte:
          "Selon les caractéristiques du terrain, le cadre réglementaire applicable et la faisabilité du projet, un studio indépendant peut ouvrir un nouvel usage locatif sur une propriété existante.",
      },
      {
        titre: "Studio professionnel",
        texte:
          "Cabinet, espace de consultation, showroom, bureau indépendant ou espace d'accueil : la souplesse de la gamme Arko autorise de nombreux usages professionnels.",
      },
      {
        titre: "Espace bien-être ou créatif",
        texte:
          "Salle de sport, atelier, musique, lecture ou détente : une pièce réellement dédiée à une activité.",
      },
    ],
  },

  difference: {
    titre: "Penser le projet comme un produit d'architecture",
    intro: [
      "Nous ne cherchons pas simplement à ajouter une surface. Nous cherchons à créer un nouvel espace qui donne envie d'être utilisé chaque jour.",
    ],
    points: [
      "un dessin architectural cohérent",
      "une ossature adaptée à la fabrication hors-site",
      "une fabrication préparée et contrôlée en atelier",
      "une implantation étudiée en fonction du terrain",
      "une sélection d'options cohérente avec l'usage",
      "un accompagnement simple et transparent",
    ],
    conclusion:
      "Implantée au Pays Basque, Howner développe des studios de jardin contemporains pour les particuliers, les investisseurs et les professionnels qui cherchent un espace supplémentaire exigeant, durable et différenciant.",
  },

  parcours: {
    titre: "De votre idée à votre studio de jardin",
    etapes: [
      {
        titre: "Configurez",
        texte:
          "Sélectionnez votre modèle et commencez à définir votre projet en ligne.",
      },
      {
        titre: "Échangeons sur votre projet",
        texte:
          "Nous analysons avec vous l'usage envisagé, l'implantation, les contraintes du terrain et les principales caractéristiques de votre configuration.",
      },
      {
        titre: "Validation du projet",
        texte:
          "Les conditions techniques, réglementaires et opérationnelles nécessaires à la réalisation sont vérifiées avant le lancement de la fabrication.",
      },
      {
        titre: "Fabrication hors-site",
        texte:
          "Votre studio est préparé en atelier selon la configuration validée.",
      },
      {
        titre: "Installation",
        texte:
          "Une fois le site prêt et les conditions réunies, le studio est acheminé puis installé sur son emplacement.",
      },
    ],
  },

  final: {
    titre: "Imaginez maintenant le vôtre",
    texte:
      "Un studio de jardin Howner peut devenir votre bureau, votre espace d'accueil, votre investissement, votre studio indépendant — ou simplement cet espace qui manquait à votre quotidien.",
    relance: "Choisissez la surface qui correspond à votre projet, et commencez à la personnaliser.",
  },
} as const;
