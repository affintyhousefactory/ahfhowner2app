/* ============================================================
   Contenu — hub `/guide` et ses 9 articles (ADR-038, lot 3).
   Sources : `docs/specs/pages-seo/guide-00-hub.md` à `guide-09-*.md`.

   ⚠ RÈGLE ÉDITORIALE QUI PRIME SUR TOUT LE RESTE ICI (hub §« Sources ») :
   ces articles ne sont **jamais un avis juridique individualisé**. Le PLU, les
   servitudes, les secteurs protégés, l'usage projeté, l'emprise au sol, la
   surface de plancher et les caractéristiques du terrain peuvent modifier la
   procédure applicable. D'où la formule de référence du hub, reprise en clôture
   du hub : « Un guide éclaire. Le terrain décide. »

   ⚠ Toute affirmation réglementaire est formulée **au principe** (« en règle
   générale », « en principe », « sous réserve ») et adossée aux sources
   officielles ci-dessous, consultées le 19/08/2026. Aucune n'est présentée
   comme un acquis. « sans permis » n'est jamais employé comme argument
   commercial — les articles disent précisément l'inverse.

   ⚠ Écarts au copy source :
   — les termes de la blocklist sont réécrits : les mentions du mode de
     construction en atelier et les formules évoquant un tarif de série sont
     remplacées par des tournures neutres (« prix affiché », « le fait qu'un
     ouvrage soit fabriqué en atelier ou transportable ») ;
   — **le concurrent nommé du guide 02 est retiré, avec son prix**. Motifs au
     §Décision de l'ADR-038 : ADR-029 §67 ne cite aucune entité hors Howner ;
     une comparaison publicitaire nommée relève d'un régime encadré
     (art. L122-1 et s. du code de la consommation) ; et un prix concurrent
     recopié se périme sans prévenir. L'argument — comparer à périmètre
     équivalent — est conservé entier, il n'avait pas besoin du nom.

   ⚠ Aucun montant Howner n'apparaît ici : les articles renvoient au
   configurateur. Un prix écrit dans un guide se périmerait avec les grilles
   (règle du 2026-08-04).
   ============================================================ */

export type SectionGuide = {
  titre: string;
  paragraphes?: readonly string[];
  puces?: readonly string[];
  /** Liste ordonnée — pour les séquences où l'ordre a un sens. */
  etapes?: readonly string[];
  tableau?: {
    entetes: readonly [string, string];
    lignes: readonly { gauche: string; droite: string }[];
  };
  /** Nuance qui empêche de lire l'énoncé comme un engagement. */
  reserve?: string;
  cta?: { libelle: string; href: string };
};

export type Guide = {
  /** Route au registre — sert de clé de rapprochement. */
  route: string;
  metaTitle: string;
  metaDescription: string;
  /** Chapô éditorial. */
  chapo: string;
  /** Réponse directe, quand la spec en impose une haut de page. */
  reponseCourte?: string;
  sections: readonly SectionGuide[];
  aRetenir?: readonly string[];
  faq?: readonly { q: string; a: string }[];
};

/**
 * Sources officielles, communes aux neuf articles.
 *
 * Affichées sur chaque page, et pas seulement conservées en commentaire : un
 * article réglementaire qui ne montre pas d'où il tient ses règles demande
 * qu'on le croie sur parole. C'est aussi ce qui permet au lecteur de vérifier
 * une règle qui aurait changé depuis la date de vérification.
 */
export const SOURCES_REGLEMENTAIRES = [
  {
    libelle: "Code de l'urbanisme — constructions nouvelles",
    url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006074075/LEGISCTA000006176110/",
  },
  {
    libelle: "Article R.421-1 du Code de l'urbanisme",
    url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000051190132/",
  },
  {
    libelle: "Article R.421-9 du Code de l'urbanisme",
    url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006074075/LEGISCTA000006188272/",
  },
  {
    libelle: "RE2020 — Ministère de la Transition écologique",
    url: "https://www.ecologie.gouv.fr/politiques-publiques/reglementation-environnementale-re2020",
  },
  {
    libelle: "Simulateur officiel des taxes d'urbanisme",
    url: "https://www.impots.gouv.fr/simulateur-des-taxes-durbanisme",
  },
  {
    libelle: "Meublés de tourisme — Ministère de l'Économie",
    url: "https://www.economie.gouv.fr/particuliers/impots-et-fiscalite/gerer-mon-impot-sur-le-revenu/location-meublee-de-tourisme-quelles-sont-les-regles-respecter-pour-sa-residence",
  },
] as const;

/** Date à laquelle les sources ci-dessus ont été consultées (spec du 19/08/2026). */
export const SOURCES_VERIFIEES_LE = "19 août 2026";

const CONFIGURER = "/configurer/v2";

export const HUB_GUIDE = {
  eyebrow: "Guides Howner",
  chapo:
    "Permis, prix, implantation, location : les réponses utiles pour transformer une idée de studio de jardin en projet concret.",
  microRassurance:
    "Les règles varient selon votre commune et votre terrain. Nos guides donnent les bons réflexes avant de lancer un projet.",
  intro:
    "Un studio de jardin habitable est une construction à part entière. Surface, usage, implantation, raccordements et réglementation locale conditionnent la faisabilité. Cette bibliothèque rassemble les principales questions à examiner avant de configurer votre projet.",
  conversion: {
    titre: "Vous connaissez déjà votre usage ? Passez à votre configuration.",
    texte:
      "Surface, aménagement, niveau d'équipement : composez une première version de votre studio Arko et donnez une forme concrète à votre projet.",
  },
  formats: {
    titre: "Choisir son format",
    one: "Le format compact, pour un bureau, une chambre indépendante, un espace invité ou un projet locatif compact.",
    max: "Davantage d'espace, pour créer une dépendance habitable plus complète.",
  },
  reassurance: {
    titre: "Un guide éclaire. Le terrain décide.",
    texte:
      "Les seuils nationaux ne remplacent jamais la lecture du PLU, des servitudes, des règles d'implantation, des contraintes d'accès et de la destination du projet. Nous aidons à structurer un projet — nous ne transformons pas une règle générale en promesse de constructibilité.",
  },
} as const;

export const GUIDES: readonly Guide[] = [
  /* — 01 — */
  {
    route: "/guide/reglementation-permis",
    metaTitle:
      "Réglementation studio de jardin 20 m² : permis ou déclaration ? | HOWNER",
    metaDescription:
      "Les règles à vérifier pour un studio de jardin de 20 m² : déclaration préalable, PLU, implantation, taxes et points de vigilance.",
    chapo:
      "Le studio de 20 m² séduit parce qu'il permet de créer un espace réellement utile sans entrer, dans le cas général d'une construction nouvelle, dans la procédure du permis de construire. Encore faut-il ne pas confondre absence de permis et absence d'autorisation.",
    sections: [
      {
        titre: "20 m² : un seuil pratique, pas une zone de non-droit",
        paragraphes: [
          "Le Code de l'urbanisme prévoit qu'une construction nouvelle de plus de 5 m² et jusqu'à 20 m², lorsque sa hauteur reste dans les limites prévues par le texte, relève en principe d'une déclaration préalable. Le projet doit par ailleurs respecter le PLU ou le document d'urbanisme applicable.",
        ],
        cta: { libelle: "Configurer mon studio de 20 m²", href: CONFIGURER },
      },
      {
        titre: "Les six vérifications à faire avant de déposer une déclaration",
        etapes: [
          "Zonage du terrain — la parcelle doit permettre le type de construction et l'usage envisagé.",
          "Emprise au sol et surface de plancher — ces deux notions ne sont pas interchangeables.",
          "Implantation — recul par rapport aux limites, alignement, hauteur, aspect extérieur.",
          "Secteur protégé — abords d'un monument historique, site patrimonial ou site classé peuvent modifier les règles.",
          "Raccordements — eau, électricité, eaux usées et accès technique s'anticipent dès lors que le studio est habitable.",
          "Fiscalité d'urbanisme — une surface close et couverte peut générer une taxe d'aménagement.",
        ],
      },
      {
        titre: "Pourquoi un format compact est cohérent avec cette logique",
        paragraphes: [
          "Un format compact permet de penser le projet autour d'une enveloppe maîtrisée : usage clair, distribution intérieure optimisée, implantation étudiée dès le départ. La fabrication hors-site en LSF prépare un maximum d'éléments en environnement contrôlé avant l'installation sur le terrain.",
          "Le bénéfice n'est pas de contourner l'urbanisme : il est de concevoir un projet simple à comprendre — et donc simple à instruire.",
        ],
        cta: { libelle: "Découvrir Arko One", href: "/studio-jardin-arko-one" },
      },
      {
        titre: "Avant de choisir le modèle, choisissez l'usage",
        paragraphes: [
          "Bureau, chambre d'amis, logement pour un proche, espace professionnel ou location : l'usage détermine les équipements, les réseaux, le niveau de confort et parfois les obligations applicables.",
          "La bonne séquence est donc : usage, puis faisabilité locale, puis implantation, puis configuration, puis dossier administratif, puis préparation du terrain.",
        ],
      },
    ],
    aRetenir: [
      "20 m² ne signifie pas « sans formalité ».",
      "La déclaration préalable est généralement la procédure de référence pour une construction nouvelle de plus de 5 m² et d'au plus 20 m².",
      "Le PLU reste déterminant, quelle que soit la surface.",
      "Un projet habitable engage le confort, les réseaux, les taxes et l'accès — pas seulement une surface.",
      "La faisabilité se vérifie ; elle ne se garantit pas d'avance.",
    ],
    faq: [
      {
        q: "Faut-il un permis pour un studio de jardin de 20 m² ?",
        a: "Dans le cas général d'une construction nouvelle ne dépassant pas 20 m² d'emprise au sol et de surface de plancher, une déclaration préalable est normalement requise plutôt qu'un permis de construire. Des règles particulières peuvent s'appliquer, notamment en secteur protégé.",
      },
      {
        q: "Puis-je construire n'importe où sur mon terrain ?",
        a: "Non. Le PLU, les règles de recul, les servitudes et les secteurs protégés peuvent contraindre l'implantation, parfois fortement.",
      },
      {
        q: "Le studio est-il taxable ?",
        a: "Une construction close et couverte peut entrer dans le champ de la taxe d'aménagement. Le simulateur officiel des taxes d'urbanisme permet d'en estimer le montant selon les taux locaux.",
      },
    ],
  },

  /* — 02 — */
  {
    route: "/guide/prix-studio-jardin-habitable",
    metaTitle: "Prix d'un studio de jardin habitable : ce qui compose le budget | HOWNER",
    metaDescription:
      "Structure, équipements, fondations, transport, raccordements : comprendre ce qui compose réellement le budget d'un studio de jardin habitable.",
    chapo:
      "Deux studios de 20 m² peuvent afficher des budgets très différents. L'écart vient rarement de la seule structure : il vient de ce qui est réellement inclus.",
    sections: [
      {
        titre: "Le prix d'un studio de jardin ne se résume pas à sa surface",
        paragraphes: [
          "Isolation, menuiseries, salle d'eau, cuisine, chauffage, ventilation, fondations, transport, installation et raccordements pèsent autant que le volume construit.",
          "Le bon indicateur n'est donc pas « combien coûte un mètre carré ? », mais « combien coûte le projet, prêt à remplir l'usage prévu ? ».",
        ],
        cta: { libelle: "Configurer mon studio et mes options", href: CONFIGURER },
      },
      {
        titre: "Les principaux postes de coût",
        tableau: {
          entetes: ["Poste", "Ce qu'il faut vérifier"],
          lignes: [
            { gauche: "Conception", droite: "plans, adaptation du modèle, études" },
            { gauche: "Structure", droite: "système constructif, protection, durabilité" },
            { gauche: "Enveloppe", droite: "isolation, étanchéité, bardage, toiture" },
            { gauche: "Menuiseries", droite: "dimensions, vitrage, protections solaires" },
            { gauche: "Équipements", droite: "électricité, plomberie, ventilation, chauffage" },
            { gauche: "Pièces d'eau", droite: "douche, WC, vasque, production d'eau chaude" },
            { gauche: "Cuisine", droite: "kitchenette ou cuisine complète" },
            { gauche: "Fondations", droite: "plots, pieux, dalle ou autre système adapté au sol" },
            { gauche: "Transport", droite: "distance, convoi, grutage, contraintes d'accès" },
            { gauche: "Installation", droite: "levage, pose, réglages" },
            { gauche: "Raccordements", droite: "eau, électricité, assainissement" },
            { gauche: "Urbanisme et taxes", droite: "dossier, frais éventuels, taxe d'aménagement" },
            { gauche: "Finitions et options", droite: "terrasse, pergola, rangements, équipements" },
          ],
        },
      },
      {
        titre: "Les prix d'appel du marché donnent un ordre de grandeur, pas votre budget",
        paragraphes: [
          "Des offres d'entrée de gamme existent, souvent présentées avec une liste de prestations incluses. Elles sont utiles comme signal de marché, à condition de ne pas les transformer en comparaison automatique : prestations, matériaux, options, contraintes d'accès et niveaux de finition diffèrent d'un projet à l'autre.",
          "La seule comparaison qui ait un sens se fait à périmètre équivalent — même usage, mêmes équipements, mêmes prérequis de terrain.",
        ],
        /* Aucun concurrent nommé ni prix recopié : voir l'en-tête du fichier. */
        reserve:
          "Un devis attractif peut exclure les fondations, le grutage, les raccordements, l'adaptation au terrain ou certains équipements. Demandez systématiquement la liste des inclusions et des exclusions.",
      },
      {
        titre: "Configurer avant de comparer",
        paragraphes: [
          "Un studio premium sur ossature LSF se justifie si l'on valorise la précision d'une structure industrialisée, une fabrication hors-site organisée, un design cohérent, un niveau d'équipement défini avant lancement, et une vision claire de ce qui est inclus.",
        ],
        cta: { libelle: "Construire mon budget dans le configurateur", href: CONFIGURER },
      },
      {
        titre: "Arko One ou Arko Max ?",
        paragraphes: [
          "Arko One privilégie la compacité : bureau, chambre indépendante, suite invitée, petit logement ou usage locatif compact. Arko Max vise un programme plus généreux, avec davantage de possibilités de séparation des espaces et d'équipements.",
        ],
      },
    ],
    aRetenir: [
      "Le prix au mètre carré est le plus trompeur des indicateurs.",
      "Fondations, transport, levage et raccordements se chiffrent projet par projet.",
      "Une comparaison n'a de sens qu'à périmètre équivalent.",
      "La liste des inclusions et exclusions est le document le plus utile d'un devis.",
    ],
  },

  /* — 03 — */
  {
    route: "/guide/agrandir-sans-demenager",
    metaTitle: "Agrandir sans déménager : le studio de jardin | HOWNER",
    metaDescription:
      "Créer une chambre, un bureau ou un logement indépendant dans son jardin : une alternative au déménagement, et ce qu'elle suppose.",
    chapo:
      "Une famille évolue plus vite qu'un logement : télétravail, adolescent, parent à accueillir, activité indépendante, besoin d'intimité. Déménager n'est pas toujours la réponse la plus rationnelle.",
    sections: [
      {
        titre: "Vous manquez d'espace, pas forcément d'adresse",
        paragraphes: [
          "Lorsque le terrain et les règles locales le permettent, un studio de jardin crée une pièce vraiment séparée, sans transformer lourdement l'habitation existante.",
        ],
        cta: { libelle: "Imaginer mon nouvel espace", href: CONFIGURER },
      },
      {
        titre: "Les usages qui changent vraiment le quotidien",
        puces: [
          "un bureau de télétravail, isolé du rythme du logement",
          "une chambre d'amis avec salle d'eau",
          "un espace pour un adolescent ou un étudiant",
          "une dépendance pour accueillir un proche",
          "un cabinet ou une pièce professionnelle, sous réserve des règles d'usage",
          "un espace locatif, sous réserve de la réglementation applicable",
        ],
      },
      {
        titre: "Extension accolée ou studio indépendant ?",
        paragraphes: [
          "Une extension accolée modifie directement le bâti existant : façades, toiture, réseaux et circulation intérieure peuvent demander des interventions lourdes.",
          "Le studio indépendant suit une autre logique — créer un volume autonome dans le jardin. L'impact du chantier sur le quotidien est moindre, mais quatre points demandent alors une vraie attention.",
        ],
        puces: [
          "l'implantation et le cheminement depuis l'habitation",
          "les raccordements et l'accès livraison",
          "l'intimité, dans les deux sens",
          "la relation architecturale avec le bâtiment principal",
        ],
      },
      {
        titre: "Ce que la fabrication hors-site change",
        paragraphes: [
          "Une part importante de la construction est préparée avant l'intervention finale sur la parcelle. L'ossature LSF se prête à cette logique de précision.",
          "L'avantage recherché tient en une phrase : moins transformer l'existant pour gagner une pièce de qualité.",
        ],
        cta: { libelle: "Voir Arko One", href: "/studio-jardin-arko-one" },
      },
      {
        titre: "L'étape que l'on ne doit pas sauter",
        paragraphes: [
          "Avant tout engagement, la faisabilité urbanistique se vérifie. Pour une construction nouvelle jusqu'à 20 m², une déclaration préalable est généralement nécessaire ; au-delà, un permis de construire est en principe requis.",
        ],
        reserve:
          "Le choix du format ne se fait jamais sur la seule surface : l'usage, la configuration du terrain et le budget global comptent autant.",
      },
    ],
    aRetenir: [
      "Une pièce de plus ne suppose pas toujours une adresse de plus.",
      "L'extension accolée touche l'existant ; le studio indépendant l'épargne mais demande d'être relié.",
      "La faisabilité urbanistique se vérifie avant l'engagement, pas après.",
    ],
  },

  /* — 04 — */
  {
    route: "/guide/permis-studio-jardin-20m2",
    metaTitle: "Permis pour un studio de jardin de 20 m² : la règle et ses limites | HOWNER",
    metaDescription:
      "Pourquoi 20 m² est un seuil clé, ce que permet la déclaration préalable, et les cas où les règles locales changent la donne.",
    chapo:
      "Le seuil des 20 m² est recherché parce qu'il permet de créer une vraie pièce supplémentaire tout en restant, dans le cas général, dans une procédure plus légère que le permis de construire.",
    reponseCourte:
      "En règle générale, une construction nouvelle de plus de 5 m² et ne dépassant pas 20 m² d'emprise au sol et de surface de plancher relève d'une déclaration préalable, pas d'un permis de construire. Cette règle nationale ne dispense pas de vérifier le PLU ni les cas particuliers.",
    sections: [
      {
        titre: "Un seuil qui se lit précisément",
        paragraphes: [
          "Le Code de l'urbanisme ne raisonne pas en surface habitable : il raisonne notamment en emprise au sol et en surface de plancher. Deux notions distinctes, qu'un projet peut franchir séparément.",
        ],
        cta: { libelle: "Configurer un Arko One", href: CONFIGURER },
      },
      {
        titre: "Déclaration préalable : ce qu'elle vérifie réellement",
        paragraphes: [
          "Elle permet à l'administration de contrôler la conformité du projet aux règles locales : implantation, hauteur, aspect extérieur, emprise, contraintes patrimoniales et dispositions du PLU.",
          "Ce n'est donc pas une formalité sans enjeu — c'est un contrôle, simplement plus léger que celui du permis.",
        ],
      },
      {
        titre: "Trois erreurs fréquentes",
        puces: [
          "« C'est démontable, donc aucune autorisation » — le fait qu'un ouvrage soit fabriqué en atelier ou transportable ne suffit pas à écarter les règles d'urbanisme.",
          "« 20 m² habitables égalent 20 m² réglementaires » — la surface habitable n'est pas la notion utilisée en urbanisme.",
          "« Mon voisin l'a fait, donc je peux aussi » — deux parcelles voisines peuvent relever de prescriptions différentes.",
        ],
      },
      {
        titre: "Checklist avant dépôt",
        etapes: [
          "consulter le PLU et vérifier le zonage",
          "contrôler l'emprise au sol et la surface de plancher",
          "vérifier la hauteur et les limites séparatives",
          "identifier les servitudes et les secteurs protégés",
          "définir l'usage projeté",
          "anticiper les raccordements et l'accès",
          "estimer la fiscalité d'urbanisme",
        ],
        cta: { libelle: "Préparer mon projet dans le configurateur", href: CONFIGURER },
      },
    ],
    aRetenir: [
      "La déclaration préalable est la procédure de référence entre 5 et 20 m², pour une construction nouvelle.",
      "Emprise au sol et surface de plancher ne se confondent ni entre elles, ni avec la surface habitable.",
      "Un ouvrage transportable reste soumis aux règles d'urbanisme.",
      "Le format compact est un moyen d'optimiser un projet, jamais une promesse « sans permis ».",
    ],
  },

  /* — 05 — */
  {
    route: "/guide/permis-studio-jardin-40m2",
    metaTitle: "Permis pour un studio de jardin de 40 m² : ce qu'il faut anticiper | HOWNER",
    metaDescription:
      "Pour une construction nouvelle de 40 m², le permis de construire est en principe la référence. Les points à anticiper, et la confusion à éviter.",
    chapo:
      "À 40 m², le projet change d'échelle — et de procédure. C'est aussi l'article où circule la confusion la plus tenace de tout l'urbanisme des studios de jardin.",
    reponseCourte:
      "Un studio indépendant de 40 m² est une construction nouvelle : le permis de construire est en principe nécessaire. La règle « 40 m² en zone U » souvent citée concerne des travaux sur une construction existante — elle ne s'y transpose pas.",
    sections: [
      {
        titre: "Pour un studio indépendant de 40 m², le permis est la référence",
        paragraphes: [
          "Le Code de l'urbanisme pose le principe du permis de construire pour les constructions nouvelles, sauf exceptions. Celles de plus de 5 m² et jusqu'à 20 m² entrent généralement dans le champ de la déclaration préalable ; un studio indépendant de 40 m² dépasse ce seuil.",
        ],
        cta: { libelle: "Configurer un studio grand format", href: CONFIGURER },
      },
      {
        titre: "D'où vient alors la règle des 40 m² ?",
        paragraphes: [
          "Dans certaines zones urbaines couvertes par un PLU, des travaux exécutés sur une construction existante peuvent relever de règles spécifiques jusqu'à 40 m², dans les conditions de l'article R.421-14.",
          "Un studio de jardin indépendant n'est pas une extension : c'est une construction nouvelle. Transposer cette exception au studio est l'erreur la plus fréquente sur le sujet.",
        ],
        reserve:
          "Cette distinction n'est pas un détail de vocabulaire : elle change la procédure applicable, et donc le calendrier du projet.",
      },
      {
        titre: "Ce que le permis oblige à anticiper",
        puces: [
          "l'insertion architecturale",
          "le plan de masse et l'implantation",
          "les façades et les matériaux",
          "l'accès et les réseaux",
          "le stationnement, si le PLU l'impose",
          "la gestion des eaux",
          "les performances réglementaires applicables",
          "les contraintes liées aux risques et au terrain",
        ],
      },
      {
        titre: "Penser le projet comme un vrai espace habitable",
        paragraphes: [
          "À 40 m², la surface autorise davantage de fonctions : séjour, chambre distincte, salle d'eau, rangements, espace de travail. Cela rend le cadrage administratif et technique d'autant plus déterminant en amont.",
          "La fabrication hors-site en LSF permet ensuite de préparer le studio avec un niveau de définition élevé avant livraison — à condition que le terrain et les prérequis aient été validés.",
        ],
        cta: { libelle: "Découvrir Arko Max", href: "/studio-jardin-arko-max" },
      },
      {
        titre: "Le recours à un architecte est-il obligatoire ?",
        paragraphes: [
          "La réponse dépend notamment de la nature du demandeur et de la surface de plancher totale concernée par le projet. Il n'existe pas de réponse générique valable pour tous les dossiers.",
        ],
        reserve:
          "Ce point se vérifie au cas par cas, auprès des sources officielles à jour et de votre commune.",
      },
    ],
    aRetenir: [
      "40 m² indépendant : permis de construire en principe.",
      "La règle « 40 m² en zone U » vise certaines extensions, pas toute construction nouvelle.",
      "Le PLU se consulte avant de figer le modèle, pas après.",
      "Accès, fondations, réseaux et insertion se préparent dès la conception.",
    ],
  },

  /* — 06 — */
  {
    route: "/guide/prix-reel-studio-jardin-habitable",
    metaTitle: "Prix réel d'un studio de jardin : l'enveloppe complète | HOWNER",
    metaDescription:
      "Au-delà du prix affiché : taxes, accès, fondations, raccordements et options à intégrer pour estimer une enveloppe réaliste.",
    chapo:
      "Cet article s'adresse à qui a déjà vu des prix d'appel et cherche le coût total d'un projet. Le vrai budget commence là où s'arrête le prix affiché.",
    sections: [
      {
        titre: "Budget total = le studio, plus le terrain prêt à le recevoir",
        paragraphes: [
          "Un prix affiché peut couvrir le studio sans couvrir ce qui permet de l'installer réellement sur une parcelle. Pour comparer deux offres, il faut reconstituer l'enveloppe entière.",
        ],
        etapes: [
          "le produit et son niveau de finition",
          "les études nécessaires",
          "les fondations ou supports",
          "le transport",
          "le grutage et la manutention",
          "l'accès chantier",
          "le raccordement électrique",
          "l'eau potable",
          "l'évacuation des eaux usées, et l'adaptation éventuelle de l'assainissement",
          "les terrassements",
          "la taxe d'aménagement",
          "les aménagements extérieurs",
          "les options de confort et le mobilier",
        ],
        cta: { libelle: "Construire ma configuration", href: CONFIGURER },
      },
      {
        titre: "Les coûts qu'on découvre tard viennent presque toujours du terrain",
        paragraphes: [
          "Un accès étroit, une pente, une distance importante jusqu'aux réseaux ou un assainissement à adapter peuvent modifier fortement l'enveloppe. C'est pourquoi un prix produit ne peut pas être présenté comme un coût final.",
        ],
      },
      {
        titre: "La taxe d'aménagement s'intègre dès le début",
        paragraphes: [
          "La création de surfaces closes et couvertes d'une hauteur supérieure à 1,80 m peut être taxable. Le montant dépend notamment de la surface taxable et des taux applicables localement — le simulateur officiel permet de l'estimer.",
        ],
      },
      {
        titre: "Ce qu'une estimation honnête doit rendre visible",
        puces: [
          "le modèle retenu",
          "les équipements et les options",
          "les hypothèses de calcul",
          "ce qui reste à la charge du client",
          "les prérequis de terrain",
        ],
        reserve:
          "Une marge de sécurité pour les aléas de terrain a davantage de valeur qu'un prix d'appel difficile à comparer.",
        cta: { libelle: "Estimer mon projet", href: CONFIGURER },
      },
    ],
    aRetenir: [
      "Le prix affiché et le coût du projet sont deux nombres différents.",
      "Le terrain est la principale source d'écart entre les deux.",
      "La taxe d'aménagement s'anticipe, elle ne se découvre pas.",
      "Une estimation utile montre ses hypothèses et ses exclusions.",
    ],
  },

  /* — 07 — */
  {
    route: "/guide/surface-habitable-sans-permis",
    metaTitle: "Quelle surface habitable sans permis de construire ? | HOWNER",
    metaDescription:
      "Le seuil de 20 m² est souvent cité, mais « sans permis » ne veut pas dire « sans autorisation ». Les règles à connaître avant d'agir.",
    chapo:
      "La recherche « surface habitable sans permis » est fréquente, mais elle mélange plusieurs notions — et l'expression elle-même est trompeuse.",
    reponseCourte:
      "Pour une construction nouvelle classique, une surface supérieure à 5 m² et ne dépassant pas 20 m² d'emprise au sol et de surface de plancher relève généralement d'une déclaration préalable. Au-delà, le permis de construire est le principe. Autrement dit : 20 m² peut être « sans permis de construire », jamais « sans autorisation ».",
    sections: [
      {
        titre: "« Sans permis » : une expression à manier avec prudence",
        paragraphes: [
          "Le Code de l'urbanisme ne raisonne pas en surface habitable. Il utilise notamment la surface de plancher, l'emprise au sol et la hauteur — trois notions que l'expression courante confond en une seule.",
        ],
        cta: { libelle: "Configurer un format compact", href: CONFIGURER },
      },
      {
        titre: "Le repère pratique",
        puces: [
          "jusqu'à 5 m² : certaines constructions très petites peuvent être dispensées de formalité, sous conditions",
          "plus de 5 m² et jusqu'à 20 m² : déclaration préalable en principe, pour une construction nouvelle répondant aux critères",
          "au-delà de 20 m² : permis de construire en principe, pour une construction nouvelle",
        ],
        reserve:
          "Des règles renforcées peuvent s'appliquer dans certains secteurs protégés, où ces repères ne suffisent plus.",
      },
      {
        titre: "Pourquoi un studio de 20 m² reste un vrai projet immobilier",
        paragraphes: [
          "La procédure est plus légère ; le projet ne l'est pas. Il reste à traiter l'implantation, l'esthétique, l'isolation, la ventilation, l'électricité, la plomberie, l'assainissement, l'accès, les taxes et l'usage.",
          "La simplicité administrative relative ne doit jamais conduire à sous-estimer la conception.",
        ],
      },
      {
        titre: "Utiliser le seuil pour optimiser, pas pour contourner",
        paragraphes: [
          "Un format compact est cohérent avec les projets de 20 m². Mais il ne s'accompagne d'aucune promesse du type « posez-le où vous voulez » : ce qui tient dans la durée, c'est un studio dessiné pour s'insérer dans un projet correctement préparé.",
          "Passer à un format plus grand peut d'ailleurs être plus rationnel si l'usage exige une chambre séparée, du rangement ou une vraie zone de vie. Le permis n'est pas seulement un frein : c'est l'étape normale d'un projet plus ambitieux.",
        ],
        cta: { libelle: "Comparer mes besoins dans le configurateur", href: CONFIGURER },
      },
    ],
    aRetenir: [
      "« Sans permis » ne signifie jamais « sans autorisation ».",
      "L'urbanisme raisonne en surface de plancher, emprise au sol et hauteur — pas en surface habitable.",
      "Les secteurs protégés peuvent renforcer les règles applicables.",
      "Un projet de 20 m² reste un projet immobilier complet.",
    ],
  },

  /* — 08 — */
  {
    route: "/guide/logement-independant-jardin",
    metaTitle: "Créer un logement indépendant dans son jardin | HOWNER",
    metaDescription:
      "Pour un proche, un étudiant ou un usage locatif : les points d'attention pour créer un véritable espace autonome dans son jardin.",
    chapo:
      "Créer une pièce dans le jardin est une chose. Créer un logement confortable en est une autre : l'usage, l'intimité, les équipements, l'accès et les règles applicables se pensent ensemble.",
    sections: [
      {
        titre: "Pour quels usages ?",
        puces: [
          "un parent ou un proche",
          "un jeune adulte ou un étudiant",
          "une chambre d'amis premium",
          "un logement ponctuel",
          "un hébergement professionnel",
          "une location longue ou courte durée, sous réserve des règles locales",
        ],
        cta: { libelle: "Configurer mon espace indépendant", href: CONFIGURER },
      },
      {
        titre: "Ce qui fait un espace réellement autonome",
        paragraphes: [
          "Selon le programme retenu, l'autonomie tient à une liste précise — et c'est l'oubli d'un seul de ces points qui fait retomber un logement au rang de pièce d'appoint.",
        ],
        puces: [
          "couchage, salle d'eau et WC",
          "coin cuisine",
          "chauffage, ventilation, eau chaude",
          "alimentation électrique et évacuation des eaux usées",
          "connexion internet",
          "rangements",
          "traitement acoustique et visuel de l'intimité",
        ],
      },
      {
        titre: "Indépendant ne veut pas dire accessoire aux yeux de l'urbanisme",
        paragraphes: [
          "Le fait qu'un studio soit implanté dans le jardin d'un logement existant ne le dispense pas des règles applicables aux constructions nouvelles. À 20 m², la déclaration préalable est généralement la référence ; au-delà, le permis de construire devient en principe nécessaire.",
        ],
      },
      {
        titre: "Prévoir l'usage suivant, pas seulement le premier",
        paragraphes: [
          "Un studio prévu aujourd'hui pour un proche peut devenir demain un bureau, une chambre d'amis ou un espace locatif. Une distribution flexible et des réseaux correctement dimensionnés dès le départ coûtent peu ; les reprendre après coup coûte beaucoup.",
          "La fabrication hors-site sur ossature LSF sert cette exigence : qualité répétable, détails préparés en atelier, moins de travail improvisé sur la parcelle.",
        ],
        cta: { libelle: "Comparer Arko One et Arko Max", href: CONFIGURER },
      },
    ],
    aRetenir: [
      "L'autonomie tient à une liste d'équipements, pas à une surface.",
      "Un logement dans le jardin reste une construction nouvelle au sens de l'urbanisme.",
      "Les réseaux se dimensionnent pour l'usage d'après, pas seulement pour le premier.",
    ],
  },

  /* — 09 — */
  {
    route: "/guide/studio-jardin-location-saisonniere",
    metaTitle: "Studio de jardin et location saisonnière : ce qu'il faut vérifier | HOWNER",
    metaDescription:
      "Urbanisme, confort, exploitation et règles des meublés de tourisme : les conditions à vérifier avant de viser la location courte durée.",
    chapo:
      "Une unité indépendante avec accès, salle d'eau, couchage et kitchenette peut répondre à une demande de location courte durée. Mais avant de calculer un revenu, il faut vérifier que le projet est possible — et distinguer quatre questions que l'on confond souvent.",
    reponseCourte:
      "Quatre plans se superposent, et chacun peut bloquer seul : le droit de construire, les conditions d'usage fixées localement, les règles d'exploitation d'un meublé de tourisme, et la fiscalité. Construire un studio n'ouvre aucun droit automatique à l'exploiter en location touristique.",
    sections: [
      {
        titre: "Étape 1 — Le droit de construire",
        paragraphes: [
          "Le studio doit respecter le PLU, le zonage, les règles d'implantation et la procédure d'autorisation correspondant à sa surface.",
        ],
        cta: { libelle: "Configurer un studio pour usage locatif", href: CONFIGURER },
      },
      {
        titre: "Étape 2 — L'usage et les règles locales",
        paragraphes: [
          "La location touristique est de plus en plus régulée à l'échelle communale. Selon la commune, des règles de changement d'usage, des quotas ou des restrictions peuvent s'appliquer.",
          "La mairie est donc le premier interlocuteur, avant même de retenir une hypothèse d'exploitation.",
        ],
      },
      {
        titre: "Étape 3 — L'enregistrement du meublé de tourisme",
        paragraphes: [
          "L'enregistrement préalable des meublés de tourisme s'est généralisé au niveau national, et l'activité s'accompagne d'obligations déclaratives et fiscales.",
        ],
        reserve:
          "Ce cadre a évolué récemment et continue d'évoluer : les modalités exactes se vérifient auprès des sources officielles citées en bas de page, ainsi qu'auprès de votre commune.",
      },
      {
        titre: "Étape 4 — Concevoir pour les avis, pas pour la photo",
        paragraphes: [
          "Une location qui tient dans la durée se joue sur des points concrets, dont aucun n'apparaît sur une annonce.",
        ],
        puces: [
          "l'intimité et l'accès indépendant",
          "la qualité du couchage",
          "la salle d'eau et la ventilation",
          "le confort en été comme en hiver",
          "le rangement et la lumière",
          "l'isolation acoustique",
          "le stationnement, lorsqu'il est nécessaire",
          "la facilité d'entretien",
        ],
      },
      {
        titre: "Construire un calcul prudent",
        paragraphes: [
          "Un studio de jardin premium peut soutenir une offre locative qualitative par son design, sa préparation hors-site et la cohérence de ses équipements. Il ne garantit aucun rendement.",
          "Un calcul honnête intègre le prix moyen par nuit, un taux d'occupation prudent, la saisonnalité, les frais de plateforme, le ménage, l'assurance, la fiscalité, la taxe de séjour, l'entretien, l'énergie et le financement éventuel.",
        ],
        reserve:
          "Aucun rendement type n'est affiché sur ce site : il dépend de données locales et d'hypothèses qui n'appartiennent qu'à votre projet.",
        cta: { libelle: "Configurer le studio avant de chiffrer son exploitation", href: CONFIGURER },
      },
    ],
    aRetenir: [
      "Quatre plans se superposent : construire, occuper, exploiter, déclarer.",
      "Construire ne donne aucun droit automatique d'exploiter en location touristique.",
      "La commune peut restreindre l'usage même quand la construction est autorisée.",
      "Aucun rendement ne se promet — il se calcule, avec des hypothèses visibles.",
    ],
    faq: [
      {
        q: "Puis-je louer mon studio de jardin en courte durée ?",
        a: "Cela dépend du droit de construire, des règles d'usage de votre commune, des obligations propres aux meublés de tourisme et de votre situation fiscale. Ces quatre plans se vérifient séparément : l'un peut bloquer alors que les trois autres sont réunis.",
      },
      {
        q: "Faut-il enregistrer le meublé auprès de la commune ?",
        a: "L'enregistrement préalable des meublés de tourisme s'est généralisé au niveau national. Les modalités et les pièces demandées se vérifient auprès de votre commune et des sources officielles, le cadre ayant évolué récemment.",
      },
    ],
  },
] as const;
