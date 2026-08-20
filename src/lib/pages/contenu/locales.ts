/* ============================================================
   Contenu — les 4 pages locales (ADR-038, lot 4).
   Sources : `docs/specs/pages-seo/page-locale-{bayonne,anglet,biarritz,cote-basque}.md`
   (specs révisées par Richard le 2026-08-20).

   ⚠ CE FICHIER EST LA RÉPONSE À LA QUESTION « pourquoi pas quatre pages
   identiques ? ». Le socle commun ci-dessous (méthode, hors-site, modèles) est
   écrit **une fois** et partagé ; chaque ville n'apporte que ce qui lui est
   propre — et c'est justement cette part propre qui fait qu'un moteur indexe
   les quatre pages au lieu d'en retenir une seule.

   Angle de chaque page, à ne pas diluer en modifiant :
     · Bayonne     → l'accès. Parcelles enclavées, passages étroits, grutage,
                     et le PSMV du centre ancien.
     · Anglet      → la tension logement. Location longue durée contre meublé
                     de tourisme, encadrement communautaire, intimité des deux
                     bâtiments.
     · Biarritz    → la rareté des petites surfaces. Micro-densification,
                     étudiants et jeunes actifs, ouverture aux opérateurs.
     · Côte Basque → le terrain. Littoral contre intérieur, zones A et N,
                     STECAL, et le fait qu'il n'existe pas un PLU unique.

   ⚠ Faits locaux datés, repris des specs et **non vérifiés indépendamment** :
   le prélèvement SRU de Biarritz, la décision administrative sur le dispositif
   d'encadrement, l'état d'avancement du PLUi Côte Basque-Adour et la date
   d'approbation du PLUi Sud Basse Navarre. Ils sont attribués à leur source
   dans le texte et la page affiche sa date de vérification — un fait local
   daté qui se périme sans le dire est pire que pas de fait du tout.

   ⚠ Écarts au copy source imposés par la blocklist ADR-029 : les specs
   qualifient la construction et l'habitation du visiteur avec quatre termes
   proscrits, tous réécrits ici. Leurs mots-clés secondaires en contiennent
   également — ce sont des requêtes visées, jamais du texte à publier.

   ⚠ Les ancres `#arko-one`, `#arko-max` et `#contact-b2b` des specs n'existent
   pas : les deux premières deviennent les routes produit, la troisième pointe
   vers `/contact`.
   ============================================================ */

import type { SectionGuide } from "./guides";

export type PageLocale = {
  route: string;
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  chapo: string;
  /** Question qui ouvre la page — propre à chaque ville. */
  paragraphes: readonly string[];
  ctaHero: string;
  /** Sections propres à la commune. Le socle commun est ajouté par la page. */
  sections: readonly SectionGuide[];
  faq?: readonly { q: string; a: string }[];
  visuel: { src: string; alt: string };
  visuelSecondaire?: { src: string; alt: string };
  /** Date de dernière vérification des faits locaux datés. */
  verifieLe: string;
};

const CONFIGURER = "/configurer/v2";
const DIR = "/assets/arko/local";

/**
 * Socle commun aux quatre pages — écrit une fois, rendu partout.
 *
 * Ce qui est commun l'est légitimement : la méthode de qualification et le
 * principe de fabrication hors-site ne changent pas d'une commune à l'autre.
 * Le dupliquer en quatre exemplaires n'aurait rien apporté ; l'écrire ici le
 * rend corrigible en un seul endroit.
 */
export const SOCLE_LOCAL = {
  methode: {
    titre: "Notre méthode, quelle que soit la commune",
    intro:
      "Localiser, analyser, qualifier — et seulement ensuite configurer. L'ordre compte : configurer avant d'avoir regardé le terrain revient à dessiner un projet dont on ignore s'il est possible.",
    etapes: [
      "Localiser la parcelle — adresse, environnement, accès, premières caractéristiques du terrain.",
      "Comprendre le besoin — bureau, chambre, dépendance, logement indépendant, usage familial ou locatif.",
      "Pré-analyser l'urbanisme — zonage, implantation, emprise, hauteur, aspect extérieur, contraintes particulières.",
      "Vérifier l'accès — passage direct, accès latéral, transport, et le cas échéant scénario de levage.",
      "Positionner le bon modèle — en fonction de l'usage et de la parcelle, jamais de la seule surface.",
      "Approfondir la faisabilité — études et démarches nécessaires avant tout lancement de fabrication.",
    ],
    reserve:
      "Disposer d'un jardin ne signifie pas automatiquement qu'on puisse y construire ; à l'inverse, une parcelle difficile n'est pas automatiquement un projet impossible. C'est précisément ce que l'étude tranche.",
  },
  horsSite: {
    titre: "Pourquoi la fabrication hors-site change la donne sur une parcelle occupée",
    paragraphes: [
      "Les studios Arko reposent sur une ossature acier léger — Light Steel Frame — et sur une fabrication conduite pour l'essentiel en atelier. Le principe est de transférer le travail du chantier vers un environnement maîtrisé.",
      "Sur une parcelle déjà habitée, l'effet est concret : moins d'interventions successives dans le jardin, une préparation plus poussée avant livraison, une organisation plus prévisible et une installation finale concentrée sur une période courte.",
    ],
    reserve:
      "Cela ne supprime pas les travaux préparatoires : assise ou terrassement, réseaux, raccordements et adaptations au terrain restent à étudier. Mais le jardin cesse d'être, pendant des mois, un atelier à ciel ouvert.",
  },
  avertissement:
    "Chaque terrain est un cas particulier. La faisabilité dépend notamment du zonage, des règles d'implantation, de l'emprise au sol, des réseaux, des servitudes, des risques, de l'accès et de l'autorisation d'urbanisme éventuellement requise. Les informations de cette page sont générales et ne valent ni autorisation administrative, ni étude de faisabilité définitive.",
} as const;

export const PAGES_LOCALES: readonly PageLocale[] = [
  /* ————————————————— BAYONNE — l'accès ————————————————— */
  {
    route: "/studio-jardin-bayonne",
    metaTitle: "Studio de jardin à Bayonne | Arko by HOWNER",
    metaDescription:
      "Créer un bureau, une chambre ou un studio indépendant à Bayonne malgré un accès difficile : l'approche hors-site Arko et les scénarios d'installation à étudier.",
    eyebrow: "Studio de jardin — Bayonne",
    chapo:
      "À Bayonne, vouloir davantage d'espace ne signifie pas nécessairement vouloir déménager. Encore faut-il que le jardin soit atteignable.",
    paragraphes: [
      "Une chambre supplémentaire, un bureau séparé du logement, un espace pour accueillir un proche ou un petit logement indépendant peuvent trouver leur place dans un jardin existant. Mais la vraie question n'est pas seulement « ai-je assez de terrain ? ».",
      "Elle est aussi : que permettent les règles d'urbanisme de la parcelle, où implanter le studio par rapport à l'existant et aux limites, comment accéder au jardin, et une installation par levage est-elle techniquement envisageable ?",
    ],
    ctaHero: "Étudier la faisabilité de mon jardin",
    visuel: {
      src: `${DIR}/jardin-ville.avif`,
      alt: "Studio de jardin Arko implanté dans un jardin urbain clos, à l'arrière d'une habitation",
    },
    visuelSecondaire: {
      src: `${DIR}/livraison.avif`,
      alt: "Installation d'un studio de jardin Arko préparé en atelier, positionné sur son emplacement",
    },
    verifieLe: "20 août 2026",
    sections: [
      {
        titre: "À Bayonne, le sujet est rarement le bâtiment — c'est l'espace autour",
        paragraphes: [
          "Le tissu urbain bayonnais réunit des situations très différentes : habitations de ville, quartiers pavillonnaires, parcelles profondes, constructions mitoyennes, jardins accessibles uniquement en traversant le logement.",
          "Dans ces configurations, une extension accolée devient complexe : plusieurs semaines ou mois d'intervention sur place, des flux permanents d'artisans et de matériaux, des modifications importantes du bâti existant, un jardin occupé pendant toute la durée du chantier.",
        ],
        reserve:
          "Un studio indépendant suit une autre logique : créer les mètres carrés manquants sans transformer lourdement l'existant. Ce qui déplace le problème vers une question logistique — et c'est là que tout se joue.",
      },
      {
        titre: "Un jardin difficile d'accès n'est pas forcément un projet impossible",
        paragraphes: [
          "Un passage latéral très étroit, un portail trop petit, un mur de clôture, une implantation en mitoyenneté, une rue où les manœuvres sont limitées : dans une construction conventionnelle, tout ou partie du chantier doit malgré tout se faire dans le jardin.",
          "Avec une construction préparée en atelier, l'installation s'étudie comme une opération logistique, dont voici les paramètres.",
        ],
        etapes: [
          "l'accès routier jusqu'à la propriété",
          "les dimensions et la masse de l'unité transportée",
          "la distance entre la zone de levage et l'emplacement final",
          "les arbres, lignes, bâtiments et autres obstacles",
          "la portance et l'espace disponible pour un engin de levage",
          "les conditions de circulation et les autorisations éventuellement nécessaires",
          "la préparation de l'assise et des raccordements avant l'arrivée sur site",
        ],
        cta: { libelle: "Faire pré-analyser mon accès", href: CONFIGURER },
      },
      {
        titre: "Le grutage : un scénario à valider, jamais une promesse",
        paragraphes: [
          "Lorsque l'accès terrestre est insuffisant, une opération de levage peut, dans certains projets, permettre d'acheminer l'unité jusqu'à son emplacement. Le studio est préparé hors-site, transporté à proximité, puis positionné sur son assise.",
          "Mais la faisabilité d'un grutage dépend de la portée, de la masse à lever, de l'environnement immédiat, de la voirie, de la sécurité, de l'implantation de la grue et des conditions d'accès.",
        ],
        reserve:
          "Le grutage n'est donc jamais une prestation standard : c'est un scénario technique qui se valide au cas par cas. L'intérêt de la démarche est ailleurs — elle permet d'examiner des parcelles que le propriétaire aurait spontanément écartées en concluant qu'aucun camion ne peut y entrer.",
      },
      {
        titre: "Et dans le centre ancien ?",
        paragraphes: [
          "Le Grand Bayonne et le Petit Bayonne sont couverts par un Plan de sauvegarde et de mise en valeur. Les projets y sont soumis à des règles patrimoniales spécifiques, et les travaux concernés peuvent nécessiter l'accord de l'Architecte des Bâtiments de France.",
        ],
        reserve:
          "Rien sur cette page ne doit laisser penser qu'un studio s'implante de manière standard dans le centre ancien. La méthode y reste la même, simplement plus exigeante : localiser, analyser, qualifier — et seulement ensuite configurer.",
      },
      {
        titre: "Ce qu'un studio change, une fois l'accès résolu",
        paragraphes: [
          "Un bureau réellement séparé, d'abord : télétravailler depuis une pièce du logement ne procure pas la séparation qu'apporte un déplacement, même de quelques mètres.",
          "L'autonomie donnée à un adolescent ou à un jeune adulte, ensuite, quand le logement devient trop petit et que le réflexe serait d'en chercher un plus grand.",
          "L'accueil d'un proche, enfin — un parent, un enfant adulte — sans transformer durablement l'organisation intérieure.",
        ],
      },
    ],
    faq: [
      {
        q: "Peut-on installer un studio de jardin de 20 m² à Bayonne ?",
        a: "Cela dépend de la parcelle, du document d'urbanisme applicable, de l'emprise et des caractéristiques du projet. La surface seule ne permet jamais de conclure à la faisabilité ni à la procédure applicable.",
      },
      {
        q: "Peut-on gruter un studio au-dessus d'une habitation ?",
        a: "Une opération de levage peut être techniquement possible dans certains cas, mais elle exige une étude spécifique : masse de l'unité, portée, obstacles, accès, implantation de l'engin et conditions de sécurité.",
      },
      {
        q: "Mon jardin n'a pas d'accès voiture. Le projet est-il impossible ?",
        a: "Pas nécessairement. L'absence de passage carrossable est une contrainte sérieuse, mais elle justifie d'étudier un autre scénario logistique plutôt que d'écarter le projet. Une analyse du site reste indispensable.",
      },
      {
        q: "Faut-il une autorisation d'urbanisme ?",
        a: "Elle dépend de la nature, de la surface et des caractéristiques du projet, ainsi que des règles locales. Aucune surface n'est présentée ici comme automatiquement dispensée de formalités.",
      },
    ],
  },

  /* ————————————————— ANGLET — la tension logement ————————————————— */
  {
    route: "/studio-jardin-anglet",
    metaTitle: "Studio de jardin à Anglet | Arko by HOWNER",
    metaDescription:
      "À Anglet, valoriser son jardin avec un studio indépendant Arko : famille, étudiant, jeune actif, bureau ou location — selon la réglementation applicable.",
    eyebrow: "Studio de jardin — Anglet",
    chapo:
      "À Anglet, un jardin n'est pas seulement un espace extérieur : c'est une réserve d'usage.",
    paragraphes: [
      "Un endroit où créer un bureau, accueillir un proche, loger un enfant devenu étudiant, ou imaginer un espace indépendant qui suivra les évolutions de la famille.",
      "Dans une ville où le logement est particulièrement recherché, la question devient : peut-on mieux utiliser les mètres carrés de terrain que l'on possède déjà ?",
    ],
    ctaHero: "Vérifier le potentiel de ma parcelle",
    visuel: {
      src: `${DIR}/jardin-arbore.avif`,
      alt: "Studio de jardin Arko installé dans un jardin arboré, à distance de l'habitation principale",
    },
    visuelSecondaire: {
      src: `${DIR}/livraison.avif`,
      alt: "Studio de jardin Arko préparé en atelier, au moment de son installation sur la parcelle",
    },
    verifieLe: "20 août 2026",
    sections: [
      {
        titre: "Un même espace, plusieurs vies",
        paragraphes: [
          "Les besoins changent au fil des années : le télétravail s'installe, un enfant poursuit ses études à proximité, un jeune adulte veut plus d'autonomie, un parent doit être rapproché sans perdre la sienne, une activité demande un espace séparé.",
          "Plutôt que de modifier profondément le logement, un studio de jardin sépare physiquement les usages. Le même volume peut être successivement un bureau, le studio d'un enfant, l'espace d'un parent, puis un logement proposé à la location.",
        ],
      },
      {
        titre: "Location à l'année et location touristique : deux projets différents",
        paragraphes: [
          "Le Pays Basque connaît une forte tension sur le logement. La Communauté d'Agglomération Pays Basque a mis en place un encadrement des meublés de tourisme, avec notamment des règles de changement d'usage dans les communes concernées. La Ville d'Anglet rappelle l'obligation de vérifier l'éligibilité d'un logement à la location saisonnière, les démarches applicables et le numéro d'enregistrement.",
          "Ce dispositif d'encadrement a par ailleurs été conforté par la juridiction administrative, au regard de la tension du marché locatif local.",
        ],
        reserve:
          "Conséquence directe : un studio n'est pas présenté ici comme une solution de location courte durée automatique. Deux questions distinctes se posent — peut-on construire et implanter le studio sur la parcelle, et l'usage prévu est-il juridiquement possible, sous quelles conditions ? Construire un espace et obtenir le droit de l'exploiter sous une forme donnée sont deux sujets séparés.",
      },
      {
        titre: "Le logement permanent d'abord",
        paragraphes: [
          "Le contexte local invite à regarder autrement la valeur d'une petite unité indépendante : un enfant étudiant, un jeune actif, un membre de la famille, un proche en transition, ou une location meublée à l'année selon la configuration et le cadre applicable.",
        ],
        reserve:
          "L'objectif n'est pas de promettre une rentabilité, mais de montrer qu'une parcelle résidentielle peut accueillir un nouvel usage utile tout en conservant l'habitation principale.",
      },
      {
        titre: "Préserver l'intimité entre les deux bâtiments",
        paragraphes: [
          "Le sujet le plus déterminant d'un projet à Anglet n'est pas la surface : c'est la relation entre le studio et l'habitation. Un studio bien positionné doit donner la sensation d'un espace indépendant, et non d'une pièce posée au milieu du jardin.",
        ],
        puces: [
          "l'orientation des ouvertures et les vues directes",
          "un cheminement indépendant",
          "la terrasse et son exposition",
          "les plantations et écrans végétaux",
          "les zones de stationnement",
          "la proximité des réseaux",
          "la relation avec les propriétés voisines",
        ],
        cta: { libelle: "Vérifier le potentiel de ma parcelle", href: CONFIGURER },
      },
      {
        titre: "Le bon projet n'est pas celui qui rapporte le plus vite",
        paragraphes: [
          "La pression touristique amène naturellement à penser d'abord à la location de courte durée. La question plus utile est autre : quel usage de cet espace restera pertinent dans cinq, dix ou quinze ans ?",
          "Un projet conçu uniquement autour d'un régime locatif est sensible aux évolutions réglementaires. Un espace pensé pour être réellement habitable conserve plusieurs scénarios — bureau, enfant, proche, logement, nouvel usage familial.",
        ],
      },
    ],
    faq: [
      {
        q: "Peut-on louer un studio de jardin en courte durée à Anglet ?",
        a: "Cela dépend du droit de construire, des règles d'usage applicables localement — dont l'encadrement communautaire des meublés de tourisme et le changement d'usage dans les cas concernés — et des obligations déclaratives. Ces points se vérifient auprès de la commune avant d'arrêter une hypothèse d'exploitation.",
      },
      {
        q: "Un studio peut-il servir de logement à l'année ?",
        a: "Selon sa configuration, ses équipements, l'autorisation obtenue et le respect des règles applicables, un studio peut être conçu pour un usage habitable. L'usage projeté doit être identifié dès l'étude de faisabilité, car il conditionne le reste.",
      },
      {
        q: "Quelle distance faut-il entre l'habitation et le studio ?",
        a: "Il n'existe pas de distance idéale universelle : les règles d'implantation du document d'urbanisme, la forme de la parcelle et la recherche d'intimité comptent davantage. Un filtre végétal bien placé crée souvent plus de séparation que plusieurs mètres supplémentaires.",
      },
    ],
  },

  /* ————————————————— BIARRITZ — la rareté des petites surfaces ————————————————— */
  {
    route: "/studio-jardin-biarritz",
    metaTitle: "Studio de jardin à Biarritz | Arko by HOWNER",
    metaDescription:
      "À Biarritz, étudier la création d'un studio compact pour un étudiant, un jeune actif, un proche ou un projet de plusieurs unités : construction hors-site LSF et micro-densification.",
    eyebrow: "Studio de jardin — Biarritz",
    chapo:
      "À Biarritz, la question du logement n'est plus abstraite : le foncier est rare, la pression résidentielle est forte, et les petites surfaces manquent.",
    paragraphes: [
      "Étudiants, jeunes actifs, saisonniers, personnes seules ou proches d'une famille souhaitant rester sur le territoire cherchent tous le même type de bien — celui qui existe le moins.",
      "Dans le même temps, certaines propriétés disposent encore d'un terrain autour d'une construction existante. D'où une question simple : avant de chercher un nouveau terrain, peut-on mieux utiliser ceux qui sont déjà urbanisés ?",
    ],
    ctaHero: "Étudier un studio sur ma propriété",
    visuel: {
      src: `${DIR}/jardin-ville.avif`,
      alt: "Studio de jardin Arko compact implanté sur une parcelle déjà bâtie",
    },
    visuelSecondaire: {
      src: `${DIR}/livraison.avif`,
      alt: "Unité Arko préparée en atelier, positionnée sur son emplacement définitif",
    },
    verifieLe: "20 août 2026",
    sections: [
      {
        titre: "Une ville très attractive, confrontée à un besoin de logements",
        paragraphes: [
          "Biarritz concentre plusieurs tensions : attractivité résidentielle, activité touristique, rareté du foncier et besoin de logements permanents. Le sujet du logement social l'illustre — dans son rapport d'orientations budgétaires 2026, la Ville prévoit environ 2,6 millions d'euros au titre du prélèvement lié à l'article 55 de la loi SRU, dont le calcul tient compte du nombre de logements sociaux manquants sur la commune.",
        ],
        reserve:
          "Un studio de jardin n'est évidemment pas une réponse au déficit de logements sociaux, et une unité installée par un particulier ne devient pas un logement social parce qu'elle est compacte. Mais ce contexte pose une question qui, elle, nous concerne : comment produire davantage de petites unités là où le foncier est rare ?",
      },
      {
        titre: "La micro-densification : ajouter une unité sans refaire la parcelle",
        paragraphes: [
          "La densification classique consiste souvent à démolir, reconstruire, ou monter un programme immobilier. Il existe une autre échelle : examiner si une parcelle déjà bâtie peut accueillir une unité supplémentaire, sans supprimer le bâtiment principal.",
        ],
        puces: [
          "utiliser du foncier déjà intégré au tissu urbanisé",
          "conserver la construction existante",
          "créer une petite surface plutôt qu'un grand logement de plus",
          "répondre à un besoin familial ou locatif ciblé",
          "limiter l'ampleur du chantier",
        ],
        reserve:
          "Cette approche n'a rien d'automatique : emprise au sol, implantation, espaces libres, accès, stationnement, réseaux, patrimoine, risques et règles architecturales peuvent limiter ou empêcher le projet.",
      },
      {
        titre: "Un studio pour un étudiant : retrouver la bonne échelle",
        paragraphes: [
          "Le logement étudiant met en évidence une contradiction fréquente des territoires attractifs : on y cherche de petites surfaces alors que l'essentiel du parc existant n'a pas été conçu pour cet usage.",
          "Sur une parcelle compatible, un studio indépendant peut être étudié comme logement d'un enfant étudiant, d'un jeune adulte en transition, d'un stagiaire ou d'un alternant — ou comme petite unité proposée à la location dans le cadre applicable.",
        ],
        reserve:
          "Pour un jeune adulte, l'indépendance compte autant que les mètres carrés : un accès propre, une salle d'eau, une zone de couchage, un espace de travail, une kitchenette selon configuration.",
        cta: { libelle: "Étudier un studio sur ma propriété", href: CONFIGURER },
      },
      {
        titre: "D'une unité dans un jardin à plusieurs sur un foncier maîtrisé",
        paragraphes: [
          "Le besoin de petites surfaces ne s'arrête pas au calendrier universitaire : le bassin d'emploi local compte des jeunes actifs et une activité saisonnière importante. Un opérateur disposant d'un terrain peut donc vouloir étudier plusieurs logements compacts, un hébergement pour salariés, ou une petite résidence.",
          "À cette échelle, la fabrication hors-site prend un autre sens : répétabilité des modèles, préparation simultanée du site et des unités, standardisation de certains composants, contrôle en atelier, et moins d'opérations conduites intégralement sur le chantier.",
        ],
        /* Formulation imposée par la spec, et juste : « logement social » désigne
           un cadre juridique et financier précis. La marque ne peut pas
           s'attribuer un régime dont elle ne maîtrise ni le financement ni les
           conditions. */
        reserve:
          "Précision qui n'est pas de forme : « logement social » relève d'un cadre juridique, financier et opérationnel spécifique. La construction hors-site compacte peut être étudiée par des bailleurs, collectivités ou opérateurs dans le cadre de programmes dont ils définissent eux-mêmes le régime, le financement et les conditions réglementaires — ce n'est pas la même chose.",
        cta: { libelle: "Parler d'un projet de plusieurs unités", href: "/contact" },
      },
      {
        titre: "Une unité doit s'intégrer à Biarritz, pas seulement y être posée",
        paragraphes: [
          "L'environnement architectural et paysager y est particulièrement sensible. La valeur d'un projet dépend autant de son insertion — implantation, volumétrie, teintes, ouvertures, rapport au jardin existant — que de sa surface.",
        ],
      },
    ],
    faq: [
      {
        q: "Peut-on ajouter un logement sur une parcelle déjà bâtie à Biarritz ?",
        a: "C'est le principe de la micro-densification, et il n'a rien d'automatique. L'emprise au sol restante, les règles d'implantation, les espaces libres imposés, le stationnement, les réseaux et les prescriptions patrimoniales déterminent la réponse, parcelle par parcelle.",
      },
      {
        q: "Un studio Arko peut-il être un logement social ?",
        a: "Non, pas en tant que tel. Le logement social relève d'un cadre juridique, financier et opérationnel défini par des bailleurs, des collectivités ou des opérateurs. La construction hors-site peut être étudiée dans le cadre de tels programmes, mais c'est le porteur du programme qui en définit le régime.",
      },
      {
        q: "Peut-on envisager plusieurs unités sur un même terrain ?",
        a: "C'est une hypothèse à étudier avec le document d'urbanisme applicable et les caractéristiques du foncier. La répétition d'une unité standardisée devient alors un avantage industriel, mais l'urbanisme reste la première contrainte.",
      },
    ],
  },

  /* ————————————————— CÔTE BASQUE — le terrain ————————————————— */
  {
    route: "/studio-jardin-cote-basque",
    metaTitle: "Studio de jardin Côte Basque et Pays Basque | Arko by HOWNER",
    metaDescription:
      "Côte Basque ou Pays Basque intérieur : où implanter un studio Arko ? Foncier, PLU et PLUi, zones A et N, STECAL et faisabilité — avant de construire.",
    eyebrow: "Studio de jardin — Côte Basque",
    chapo:
      "Sur le littoral basque, trouver de l'espace est devenu difficile. En s'éloignant, le paysage change — mais pas toujours les possibilités.",
    paragraphes: [
      "Bayonne, Anglet, Biarritz et les communes côtières concentrent une forte demande, une urbanisation déjà dense et des contraintes foncières croissantes. À l'intérieur, certaines communes présentent des parcelles plus grandes et un habitat très différent.",
      "Cela donne l'impression qu'y construire un studio de jardin serait nécessairement plus simple. Ce n'est pas toujours le cas : une parcelle plus grande n'est pas automatiquement une parcelle constructible.",
    ],
    ctaHero: "Faire pré-analyser mon terrain",
    visuel: {
      src: `${DIR}/terrain-large.avif`,
      alt: "Studio de jardin Arko implanté sur un terrain ouvert du Pays Basque",
    },
    visuelSecondaire: {
      src: `${DIR}/livraison.avif`,
      alt: "Studio de jardin Arko livré préparé, installé sur son emplacement",
    },
    verifieLe: "20 août 2026",
    sections: [
      {
        titre: "Littoral : beaucoup de demande, peu d'espace disponible",
        paragraphes: [
          "La pression foncière du littoral pousse naturellement vers des solutions compactes. Un studio de jardin devient pertinent lorsqu'une propriété dispose encore d'une capacité d'implantation compatible avec le document d'urbanisme.",
        ],
        puces: [
          "emprise au sol déjà largement consommée",
          "recul imposé par rapport aux limites",
          "accès et stationnement",
          "prescriptions patrimoniales",
          "risques naturels et paysage",
          "capacité des réseaux",
        ],
      },
      {
        titre: "Intérieur : plus d'espace apparent, des règles différentes",
        paragraphes: [
          "En quittant l'agglomération littorale, on trouve davantage de grandes parcelles, de terrains agricoles, d'espaces naturels et d'habitat diffus. Visuellement, un terrain peut sembler idéal.",
          "Pourtant, une grande surface libre relève souvent d'une zone où les possibilités de construire sont très limitées. C'est le paradoxe du Pays Basque intérieur : plus de terrain physiquement disponible ne signifie pas plus de droits à bâtir.",
        ],
      },
      {
        titre: "STECAL : ce que le terme veut réellement dire",
        paragraphes: [
          "STECAL signifie « secteur de taille et de capacité d'accueil limitées ». Dans certaines zones agricoles ou naturelles d'un PLU ou d'un PLUi, le document d'urbanisme peut délimiter à titre exceptionnel des secteurs où certaines constructions sont admises, selon des conditions définies.",
          "La mauvaise lecture consiste à croire qu'on peut « demander un STECAL » pour y installer son studio. Ce n'est pas ainsi que le dispositif fonctionne : un STECAL est défini par le document d'urbanisme, correspond à un périmètre identifié, répond à une vocation et à des règles précises, reste exceptionnel, et ne constitue pas un droit général à bâtir.",
        ],
        reserve:
          "Le PLUi Sud Basse Navarre, approuvé le 28 février 2026, l'illustre : les documents de la Communauté d'Agglomération y mentionnent des STECAL dédiés au tourisme, aux activités ou aux équipements. La bonne question n'est donc pas « y a-t-il un STECAL ? » mais « que permet exactement le secteur où se trouve la parcelle ? ».",
      },
      {
        titre: "Zone A ou N : ne concluez ni oui ni non trop vite",
        paragraphes: [
          "Deux réactions opposées sont fréquentes lorsqu'un propriétaire découvre que sa parcelle est classée en zone agricole ou naturelle. « J'ai beaucoup de terrain, donc je peux construire » est faux comme principe général. « C'est une zone A ou N, donc rien n'est possible » peut l'être tout autant.",
          "Bâtiment existant, extensions ou annexes admises sous conditions, secteurs particuliers, destination du projet et dispositions locales doivent être regardés précisément. La méthode consiste à lire le règlement applicable, pas à raisonner sur la superficie.",
        ],
      },
      {
        titre: "Il n'existe pas un PLU du Pays Basque",
        paragraphes: [
          "Parler du « PLU du Pays Basque » est trompeur : le territoire comprend plusieurs documents et procédures selon les secteurs. Le PLUi Côte Basque-Adour porte ainsi sur Anglet, Bayonne, Biarritz, Bidart et Boucau.",
          "Au 20 août 2026, ce PLUi était arrêté sans être encore approuvé : les documents opposables se vérifient donc commune par commune, au moment du projet. D'autres secteurs disposent de leur propre PLUi ou sont engagés dans des procédures différentes.",
        ],
        reserve:
          "Conséquence pratique : « peut-on construire un studio de 20 m² au Pays Basque ? » n'a pas de réponse unique. Il faut une adresse.",
        cta: { libelle: "Faire pré-analyser mon terrain", href: CONFIGURER },
      },
      {
        titre: "La bonne localisation n'est pas forcément la plus proche de l'océan",
        paragraphes: [
          "Le littoral offre la proximité des pôles de vie, le bassin d'emploi, les services et l'attractivité — au prix d'un foncier cher et rare, de parcelles contraintes et de règles d'intégration exigeantes.",
          "L'intérieur offre des terrains parfois plus vastes et des configurations moins urbaines — au prix d'une constructibilité limitée, de zones agricoles ou naturelles, de questions d'assainissement, d'accès, de réseaux et de distances.",
        ],
        reserve:
          "Le bon projet est rarement celui qui maximise la surface disponible : c'est celui qui équilibre localisation, urbanisme, accès, réseaux, usage et budget.",
      },
    ],
    faq: [
      {
        q: "Peut-on construire un studio de jardin en zone agricole ou naturelle ?",
        a: "Les possibilités y sont très limitées et dépendent du règlement applicable : bâtiment existant, annexes ou extensions admises sous conditions, secteurs particuliers, destination du projet. Une zone A ou N n'interdit pas tout par principe, mais n'ouvre aucun droit général à bâtir.",
      },
      {
        q: "Un STECAL permet-il d'installer un studio ?",
        a: "Pas en soi. Un STECAL est délimité par le document d'urbanisme, répond à une vocation précise et reste exceptionnel. Le fait qu'une parcelle s'y trouve n'indique pas qu'un studio d'habitation y soit autorisé : c'est la destination du secteur et son règlement qui le disent.",
      },
      {
        q: "Vaut-il mieux chercher un terrain sur le littoral ou à l'intérieur ?",
        a: "Cela dépend de l'usage visé, du budget et de la tolérance à la distance. Quelques kilomètres peuvent transformer l'équation, dans les deux sens : le littoral coûte cher et contraint, l'intérieur offre de l'espace mais souvent moins de droits à construire.",
      },
    ],
  },
] as const;
