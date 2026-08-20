/* ============================================================
   Contenu — /studio-jardin-tiny-house (ADR-038, lot 2).
   Source : `docs/specs/pages-seo/page-studio-jardin-tiny-house.md`.

   ⚠ EXCEPTION DE VOCABULAIRE — ADR-029 § Amendement du 2026-08-20.
   Le terme « tiny house » est proscrit partout ailleurs sur le site. Il est
   autorisé ici, et uniquement ici, parce que la page **compare** le studio à
   ce produit : le mot y désigne toujours l'objet concurrent qu'on écarte,
   jamais un Arko et jamais une catégorie où Howner se rangerait. On ne se
   démarque pas de ce qu'on refuse de nommer.

   L'exception est portée par le champ `sauf` de `check-vocabulaire.mjs`, qui
   lève **ce terme sur ces chemins** — le reste de la blocklist continue de
   s'appliquer intégralement à ce fichier. Ce n'est pas une zone franche.

   ⚠ Ton imposé par la spec : aucune attaque du produit concurrent. La tiny
   house est présentée comme une bonne réponse à un autre projet — celui de se
   déplacer. Le site vend ce qui reste ; il ne dénigre pas ce qui bouge.

   ⚠ Deux liens de la spec ne sont pas repris : `/faq/` n'existe pas dans
   l'arborescence (la FAQ vit sur l'accueil), et les fiches produit sont
   citées par `PRODUCTS[].slug`, non par les anciennes routes `/arko-*` du
   brief — la note de la spec le prévoit explicitement.
   ============================================================ */

export const TINY_HOUSE = {
  hero: {
    eyebrow: "Studio de jardin ou tiny house",
    chapo:
      "Les deux répondent à une même envie : créer davantage d'espace avec une construction compacte, intelligente et rapide à mettre en œuvre. Mais elles ne répondent pas au même projet.",
    paragraphes: [
      "La tiny house privilégie la mobilité, la compacité extrême et un mode de vie minimaliste. Le studio de jardin Arko privilégie l'inverse : créer sur votre terrain un véritable espace architectural, confortable et durable, pensé pour rester en place et s'intégrer à votre propriété.",
    ],
    note: "Arko One et Arko Max sont construits sur une ossature Light Steel Frame, conçus hors-site puis installés sur votre parcelle.",
  },

  philosophies: {
    titre: "Deux philosophies, deux projets différents",
    intro: [
      "Une tiny house est pensée autour d'une contrainte forte : faire tenir un habitat complet dans un volume extrêmement réduit, souvent conçu pour être déplacé. C'est ce qui fait son charme, et c'est une vraie réponse pour qui veut voyager avec son logement.",
      "Mais lorsque l'objectif n'est pas de partir, et que vous disposez déjà d'un terrain, une autre question se pose : pourquoi accepter les contraintes d'un habitat mobile alors qu'on cherche justement à créer un espace durable dans son jardin ?",
    ],
    conclusion:
      "Le studio de jardin part du raisonnement inverse. Il ne cherche pas à rendre une remorque habitable : il cherche à créer un petit bâtiment contemporain, qui apporte des mètres carrés utiles et durables à une propriété existante.",
  },

  comparaison: {
    titre: "Ce qui sépare vraiment les deux approches",
    entetes: ["Critère", "Tiny house", "Studio de jardin Arko"] as const,
    lignes: [
      {
        critere: "Philosophie",
        tiny: "Habitat compact, potentiellement mobile",
        arko: "Espace indépendant et durable",
      },
      {
        critere: "Implantation",
        tiny: "Souvent liée à une logique de mobilité",
        arko: "Pensée pour durer au même endroit",
      },
      {
        critere: "Architecture",
        tiny: "Volume fortement contraint",
        arko: "Volume conçu autour de l'usage",
      },
      {
        critere: "Largeur intérieure",
        tiny: "Limitée dès que le modèle doit rouler",
        arko: "Non dictée par le gabarit d'une remorque",
      },
      {
        critere: "Organisation",
        tiny: "Mezzanine et escaliers fréquents",
        arko: "Plain-pied privilégié selon le modèle",
      },
      {
        critere: "Confort quotidien",
        tiny: "Optimisation maximale de chaque espace",
        arko: "Confort proche d'un petit logement",
      },
      {
        critere: "Accessibilité",
        tiny: "Peut être contrainte par les niveaux",
        arko: "Circulation plus conventionnelle",
      },
      {
        critere: "Rapport au jardin",
        tiny: "Objet autonome posé sur la parcelle",
        arko: "Projet intégré à la propriété",
      },
      {
        critere: "Usages",
        tiny: "Habitat minimaliste, nomade ou semi-nomade",
        arko: "Bureau, studio, chambre, dépendance, location",
      },
      {
        critere: "Fabrication",
        tiny: "Variable selon les constructeurs",
        arko: "Hors-site, sur ossature Light Steel Frame",
      },
    ],
    retenir:
      "Si votre projet est de vivre de manière nomade, la tiny house garde tout son sens. S'il est d'installer durablement un nouvel espace sur votre propriété, le studio de jardin devient la réponse la plus cohérente.",
  },

  remorque: {
    titre: "Ne plus construire autour d'une remorque",
    intro: [
      "La mobilité impose ses contraintes : dimensions, largeur, hauteur, poids, circulation intérieure — chaque centimètre compte. Cette logique produit des habitats ingénieux, mais elle multiplie les compromis.",
    ],
    compromis: [
      "un couchage en mezzanine",
      "des escaliers très compacts",
      "des rangements intégrés partout",
      "des espaces qui doivent servir à tout",
      "une largeur intérieure limitée",
      "du mobilier sur mesure pour gagner quelques centimètres",
    ],
    conclusion:
      "Dans un studio Arko, la priorité est ailleurs : le bâtiment est conçu autour de l'usage, pas autour de sa capacité à circuler sur la route. D'où une vraie sensation d'espace, une circulation naturelle, et une architecture plus proche d'un studio classique.",
  },

  plainPied: {
    titre: "Un espace de plain-pied, bien plus facile à vivre",
    intro: [
      "La mezzanine est emblématique : elle fait gagner beaucoup de place. Mais elle ne convient pas à tous les usages — ni à tous les âges.",
      "Pour une chambre d'amis, un espace destiné à des parents, un bureau professionnel ou un studio locatif, disposer d'un volume organisé de plain-pied change tout.",
    ],
    phrase: "On entre, on circule, on vit — sans transformer chaque déplacement en optimisation.",
  },

  durable: {
    titre: "Une construction pensée pour rester dans votre jardin",
    intro: [
      "Un studio Arko n'est pas un objet temporaire posé à côté de l'habitation existante : c'est une nouvelle composante de votre propriété. Architecture, façade, ouvertures, orientation, terrasse et accès au jardin se pensent comme un ensemble.",
    ],
    conclusion:
      "L'objectif est simple : que votre studio ne ressemble pas à un habitat ajouté après coup, mais à un espace naturellement intégré à la parcelle. C'est aussi pourquoi Howner privilégie une esthétique contemporaine et sobre, capable de dialoguer avec des architectures très différentes.",
  },

  choisir: {
    titre: "Il n'y a pas de vainqueur universel. Il y a votre projet.",
    tiny: {
      titre: "Choisissez plutôt une tiny house si…",
      points: [
        "vous cherchez un habitat minimaliste",
        "vous voulez pouvoir déplacer votre logement",
        "votre mode de vie est nomade ou semi-nomade",
        "l'expérience d'un espace volontairement ultra-compact vous attire",
      ],
    },
    studio: {
      titre: "Choisissez plutôt un studio de jardin si…",
      points: [
        "vous voulez une construction durable sur votre propriété",
        "vous cherchez un espace plus conventionnel à vivre",
        "il vous faut un studio indépendant, une chambre ou un bureau séparé",
        "vous envisagez une dépendance habitable ou un usage locatif",
        "vous voulez une architecture qui valorise votre jardin",
      ],
    },
  },

  polyvalence: {
    titre: "Beaucoup plus qu'un mini-logement",
    intro: [
      "Aujourd'hui bureau. Demain chambre d'amis. Puis espace pour un enfant devenu étudiant, logement pour accueillir un proche, ou studio locatif lorsque le contexte local et les autorisations le permettent.",
    ],
    phrase: "Le bâtiment reste. L'usage évolue.",
    conclusion:
      "Cette capacité à accompagner plusieurs étapes de la vie est l'argument majeur du studio de jardin face à un habitat conçu avant tout autour de l'ultra-compacité.",
  },

  architecture: {
    titre: "Un studio pensé comme une vraie pièce d'architecture",
    intro: [
      "Un studio Arko ne cherche pas à reproduire une habitation traditionnelle en miniature : son architecture assume le petit volume. De grandes ouvertures prolongent l'intérieur vers le jardin, la lumière naturelle devient une composante du projet, la terrasse étend l'espace de vie, et le jardin fait partie de l'expérience.",
    ],
    phrase:
      "L'enjeu n'est pas de vivre dans peu de mètres carrés. C'est de profiter beaucoup mieux de chacun d'eux.",
  },

  modeles: {
    titre: "Deux studios pour deux façons de créer de l'espace",
    one: {
      accroche: "Le studio essentiel.",
      texte:
        "Pour les projets qui cherchent un espace compact, indépendant et simple à intégrer dans un jardin existant.",
      usages: [
        "bureau de télétravail",
        "cabinet ou espace professionnel",
        "chambre indépendante ou studio invité",
        "espace loisirs",
        "première unité locative, selon le projet et la réglementation applicable",
      ],
    },
    max: {
      accroche: "Plus d'espace. Plus de possibilités.",
      texte:
        "Pour les projets qui demandent davantage de confort intérieur et une vraie capacité d'habitation, avec plusieurs zones de vie.",
      usages: [
        "studio habitable ou dépendance confortable",
        "hébergement premium",
        "studio locatif, selon la réglementation",
        "espace professionnel haut de gamme",
      ],
    },
  },

  convergence: {
    titre: "Vous aimez l'idée de la tiny house ? Vous aimerez sans doute l'espace d'un Arko.",
    intro: [
      "La tiny house a popularisé une idée essentielle : nous n'avons pas toujours besoin de construire plus grand. Howner partage cette conviction.",
      "Mais construire compact n'oblige pas à vivre contraint. Arko cherche cet équilibre : moins de surface, davantage de qualité d'usage.",
    ],
  },

  urbanisme: {
    titre: "Et concernant l'urbanisme ?",
    intro: [
      "Tiny house ou studio de jardin, la présence d'une construction sur un terrain reste soumise aux règles applicables au projet et à la parcelle : document d'urbanisme, surface et emprise, usage prévu, configuration du terrain, règles locales et autorisation éventuellement nécessaire.",
    ],
    /* Point juridiquement important, et volontairement conservé du brief : il
       protège autant le client que la marque. */
    phrase:
      "La mobilité apparente d'une tiny house ne constitue pas un moyen de contourner les règles d'urbanisme.",
    conclusion:
      "Howner privilégie l'approche inverse : concevoir dès le départ un projet destiné à être implanté dans un cadre réglementaire identifié, plutôt que de bâtir sur une promesse d'évitement administratif.",
  },

  final: {
    titre: "Et si votre tiny house idéale était finalement un studio de jardin ?",
    texte:
      "Choisissez la surface qui correspond à votre projet, comparez les deux modèles, et composez une première version de votre studio.",
  },
} as const;
