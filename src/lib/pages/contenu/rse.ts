/* ============================================================
   Contenu — page « Démarche RSE » du Guide.
   Source : `docs/specs/pages-seo/guide-10-demarche-rse.md`
   (prompt de Richard, Drive « AHF - Plans_SiteWeb_Inspirations », 2026-09-07).

   ⚠ RÈGLE QUI PRIME SUR TOUT LE RESTE ICI — elle est la page elle-même :

       Ne jamais affirmer une qualité environnementale que Howner ne peut pas
       démontrer aujourd'hui.

   Concrètement, trois interdits tenus ligne à ligne :

   1. **Aucun chiffre, pourcentage, label ou certification n'est écrit.** Pas
      un seul. Ce qui n'est pas mesuré est présenté comme un indicateur à
      construire, jamais comme un résultat. La grille du §8 porte des états, pas
      des valeurs.
   2. **Aucune formulation absolue** : ni « écologique », ni « 100 % local », ni
      « bas carbone », ni « zéro impact ». Le vocabulaire est celui du
      mouvement — « nous mesurons », « nous cherchons à réduire », « nous
      privilégions lorsque c'est pertinent », « nous voulons pouvoir le
      démontrer ».
   3. **Aucune déduction implicite.** Un studio compact n'est pas déclaré
      meilleur pour l'environnement ; le hors-site n'est pas déclaré plus
      vertueux. Les deux sont présentés comme des hypothèses que la mesure doit
      confirmer — c'est la différence entre une démarche et un argument.

   ⚠ Les états de la grille d'indicateurs (`etat`) sont **la partie la plus
   fragile de cette page** : ce sont eux qui font la différence entre « nous
   mesurons » et « nous prétendons mesurer ». Ils sont volontairement pauvres —
   tout est `"a-construire"` sauf la distance de livraison, réellement calculée
   par le configurateur à chaque projet (`transportEur`, `distanceAtelierKm`),
   mais pas encore consolidée. **Ne faire passer un indicateur à
   `"mesure-en-cours"` que sur constat de Richard**, jamais par optimisme :
   c'est une allégation environnementale au sens du code de la consommation.

   ⚠ Marque (ADR-029) : « studio de jardin », accord au masculin. La blocklist
   s'applique intégralement à ce fichier — `npm run check:vocabulaire` le lit,
   et l'a d'ailleurs refusé une première fois pour un terme proscrit cité dans
   ce commentaire même. Un garde-fou qui ne s'applique pas à celui qui le
   documente n'en serait pas un.
   ============================================================ */

/** Une étape du cycle de vie, du sourcing à la fin de vie. */
export type EtapeCycle = {
  nom: string;
  /** Ce que Howner cherche à documenter à cette étape. */
  quoi: string;
};

/**
 * Repère public affiché en regard d'un indicateur.
 *
 * ⚠ **Ce n'est jamais un chiffre Howner.** C'est un ordre de grandeur publié
 * par une source officielle, qui donne au lecteur une échelle de lecture
 * pendant que notre propre mesure se constitue. La distinction doit rester
 * lisible à l'écran, faute de quoi le repère serait lu comme notre résultat —
 * exactement le glissement que cette page refuse.
 *
 * Chaque repère porte sa source **et son lien** : un chiffre public non
 * vérifiable ne vaut pas mieux qu'un chiffre inventé.
 */
export type Repere = {
  /** La valeur publique, telle que la source l'écrit. */
  valeur: string;
  /** Ce que cette valeur mesure — et, s'il y a lieu, pourquoi elle ne nous est pas applicable. */
  precision: string;
  source: string;
  url: string;
};

/**
 * État d'un indicateur. Deux valeurs, et deux seulement.
 *
 * Un troisième état « publié » viendra le jour où un chiffre Howner existe. Le
 * créer d'avance inviterait à s'en servir trop tôt.
 */
export type EtatIndicateur = "mesure-en-cours" | "en-constitution";

export type Indicateur = {
  libelle: string;
  etat: EtatIndicateur;
  /** Précision affichée sous le libellé — ce qui manque, ou ce qui existe déjà. */
  note?: string;
  /** Ordre de grandeur public, quand il en existe un qui éclaire vraiment. */
  repere?: Repere;
};

export const ETATS_INDICATEUR: Record<EtatIndicateur, string> = {
  "mesure-en-cours": "Mesure en cours",
  "en-constitution": "En cours de constitution",
};

export const RSE = {
  route: "/guide/demarche-rse-howner",

  metaTitle: "Démarche RSE Howner | Construire mieux et mesurer nos impacts",
  metaDescription:
    "La démarche RSE de Howner : conception sobre, mesure des impacts, réduction des pertes, fabrication hors-site et développement territorial. Sans greenwashing.",

  eyebrow: "Notre démarche",
  badge: "Notre principe : pas de greenwashing",

  chapo:
    "Chez Howner, la responsabilité ne commence pas par une promesse environnementale. Elle commence par une question simple : que pouvons-nous réellement mesurer, améliorer et démontrer ?",

  /* — 2. Notre conviction — */
  conviction: {
    titre: "La responsabilité ne se décrète pas. Elle se mesure.",
    paragraphes: [
      "« Durable », « responsable », « bas carbone », « écologique » : ces mots sont devenus si courants qu'ils ne disent plus grand-chose de celui qui les emploie. Nous avons choisi de ne pas les ajouter à la liste.",
      "Notre démarche part de l'autre bout. Identifier nos principaux impacts, rassembler les données qui existent, reconnaître celles qui manquent, fixer des axes d'amélioration, puis publier des résultats au fur et à mesure qu'ils deviennent fiables.",
      "C'est plus lent qu'une affirmation. C'est aussi la seule façon de pouvoir la défendre.",
    ],
    citation:
      "Une amélioration mesurée vaut mieux qu'une promesse impossible à démontrer.",
  },

  /* — 3. Construire moins grand — */
  sobriete: {
    titre: "La sobriété commence par la conception.",
    paragraphes: [
      "Un studio de jardin Arko occupe de 20 à 40 m². Cette surface n'est pas une contrainte subie : elle correspond à un usage précis, pensé pour être pleinement occupé plutôt que partiellement rempli.",
      "Concevoir petit oblige à décider. Chaque mètre carré doit servir, chaque rangement doit trouver sa place, chaque circulation doit se justifier. C'est un exercice de conception avant d'être un argument.",
    ],
    puces: [
      "Optimiser chaque mètre carré plutôt qu'ajouter de la surface",
      "Répondre à un usage identifié, pas à une surface cible",
      "Concevoir pour durer : qualité des composants, accès aux organes techniques",
      "Penser l'entretien et la maintenance dès le dessin, pas après la pose",
    ],
    reserve:
      "Réduire la surface peut contribuer à réduire les ressources mobilisées. Nous voulons pouvoir le vérifier plutôt que simplement l'affirmer : c'est l'objet des indicateurs présentés plus bas.",
  },

  /* — 4. Mesurer l'impact produit — */
  cycle: {
    titre: "Comprendre l'impact réel d'un Arko.",
    intro:
      "Un studio de jardin ne se résume pas à ce qui sort de l'atelier. Son impact se joue à chaque étape, depuis l'origine des matières jusqu'à ce qu'il devient quand il cesse de servir. Nous rassemblons progressivement les données de chacune.",
    etapes: [
      { nom: "Matières", quoi: "Nature, quantité et origine des composants mis en œuvre" },
      { nom: "Fournisseurs", quoi: "Données environnementales disponibles, FDES et PEP lorsqu'elles existent" },
      { nom: "Fabrication", quoi: "Énergie consommée à l'atelier, chutes et déchets générés" },
      { nom: "Transport", quoi: "Distance parcourue, masse transportée, conditions d'acheminement" },
      { nom: "Installation", quoi: "Préparation du terrain, fondations, raccordements" },
      { nom: "Utilisation", quoi: "Consommations d'usage et confort dans le temps" },
      { nom: "Entretien", quoi: "Fréquence, pièces concernées, réparabilité" },
      { nom: "Fin de vie", quoi: "Démontabilité, réemploi et filières de valorisation" },
    ] satisfies readonly EtapeCycle[],
    suivis: [
      "acier LSF",
      "isolants",
      "menuiseries",
      "bardages",
      "équipements techniques",
      "provenance des composants",
      "énergie de fabrication",
      "déchets et chutes",
      "transports",
      "entretien et réparabilité",
    ],
    reserve:
      "Ces éléments seront publiés progressivement, à mesure que leur collecte et leur fiabilité seront suffisantes. Nous préférons une page incomplète à une page qui affirmerait plus qu'elle ne sait.",
  },

  /* — 5. Réduire les pertes — */
  pertes: {
    titre: "Moins de pertes. Plus de maîtrise.",
    paragraphes: [
      "Fabriquer en atelier plutôt que sur le terrain change la nature de ce qu'on peut observer. Les découpes se planifient, les chutes se comptent, les quantités réellement consommées se connaissent — ce qu'un chantier dispersé rend beaucoup plus difficile.",
      "C'est cette capacité à mesurer qui nous intéresse en premier, avant tout gain supposé.",
    ],
    puces: [
      "Préparer et découper en série plutôt qu'ajuster à la pose",
      "Compter les chutes plutôt que les estimer",
      "Trier à l'atelier, où le tri est possible",
      "Réemployer lorsque la chute a une seconde vie utile",
      "Connaître les quantités réellement consommées, projet après projet",
    ],
    citation:
      "Notre objectif n'est pas de dire que le hors-site est automatiquement plus vertueux. Il est de pouvoir montrer où il nous permet réellement de mieux maîtriser les ressources.",
  },

  /* — 6. Impact territorial — */
  territoire: {
    titre: "Fabriquer ici, c'est aussi faire vivre ici.",
    paragraphes: [
      "La responsabilité d'un projet industriel ne se limite pas à son bilan matière. Créer un atelier, développer des savoir-faire, travailler avec des bureaux d'études, des entreprises et des transporteurs : tout cela produit des effets là où l'activité s'installe.",
      "Nous considérons ces effets comme faisant partie de notre démarche, et non comme un supplément d'image.",
    ],
    cartes: [
      {
        titre: "Compétences",
        texte:
          "Développer progressivement des savoir-faire de conception, de fabrication, de contrôle qualité, de logistique et de pose.",
      },
      {
        titre: "Partenaires",
        texte:
          "Travailler avec des entreprises, artisans et bureaux d'études locaux ou régionaux lorsque c'est pertinent.",
      },
      {
        titre: "Emploi et formation",
        texte:
          "Créer des postes et transmettre des compétences autour d'une organisation différente de la construction.",
      },
      {
        titre: "Valeur locale",
        texte:
          "Chercher à conserver une part significative de la valeur créée dans l'écosystème du territoire.",
      },
    ],
    citation:
      "La valeur d'un projet industriel se mesure aussi à ce qu'il crée autour de lui.",
    reserve:
      "Nous ne revendiquons pas un « 100 % local » : certains composants supposent des chaînes d'approvisionnement plus larges, et prétendre le contraire serait faux. Notre démarche consiste à mesurer progressivement l'origine de nos achats et à favoriser la proximité lorsqu'elle est compatible avec nos exigences techniques, économiques et environnementales.",
  },

  /* — 7. Nos engagements — */
  engagements: {
    titre: "Cinq engagements pour progresser",
    intro:
      "Ces engagements portent sur notre méthode, pas sur des résultats que nous n'avons pas encore. C'est ce qui les rend tenables.",
    items: [
      {
        titre: "Concevoir pour durer",
        texte:
          "Qualité de conception, accès aux organes techniques, réparabilité et durée de vie priment sur l'économie immédiate.",
      },
      {
        titre: "Mesurer avant d'affirmer",
        texte:
          "Ne revendiquer une amélioration environnementale que lorsque nous disposons de données suffisamment fiables pour la défendre.",
      },
      {
        titre: "Réduire les pertes",
        texte:
          "Suivre les matières, les chutes, les déchets et leur valorisation, puis agir sur ce que ces chiffres révèlent.",
      },
      {
        titre: "Faire progresser notre territoire",
        texte:
          "Développer les compétences et les partenariats autour de l'activité, et mesurer ce qui reste localement.",
      },
      {
        titre: "Publier nos progrès",
        texte:
          "Mettre à disposition des indicateurs simples, compréhensibles et vérifiables — y compris ceux qui progressent moins vite que prévu.",
      },
    ],
  },

  /* — 8. Les indicateurs — remontés en tête de page le 2026-09-07 (décision de
       Richard) : c'est la section qui prouve la méthode, elle passe donc avant
       les intentions qu'elle sert à vérifier. */
  indicateurs: {
    titre: "Des engagements aux données",
    intro:
      "Voici les indicateurs que nous voulons suivre, et où nous en sommes vraiment. Nos mesures sont en cours de constitution : aucun chiffre Howner n'est affiché tant qu'il n'est pas fiable. En regard, lorsqu'il en existe un, nous plaçons un ordre de grandeur public et sourcé — pour donner une échelle de lecture, jamais pour la faire passer pour la nôtre.",
    /* ⚠ Formulé sans base ni échéance inventées. Un « −10 % » sans année de
       référence ne veut rien dire, et en poser une au jugé serait la seule
       vraie approximation de cette page. L'échéance reste à arrêter par
       Richard ; elle sera publiée avec la première mesure. */
    objectif: {
      titre: "Notre objectif : −10 %",
      texte:
        "Sur chaque indicateur que nous parviendrons à mesurer, nous visons une réduction de 10 % par rapport à notre première mesure fiable.",
      reserve:
        "Un pourcentage n'a de sens qu'avec une base : l'année de référence sera celle où l'indicateur devient fiable, et nous la publierons avec lui. Tant qu'elle n'existe pas, cet objectif est une intention datée — pas un résultat.",
    },
    items: [
      {
        libelle: "Empreinte carbone d'un Arko",
        etat: "en-constitution",
        note: "Suppose la consolidation des données environnementales fournisseurs",
        repere: {
          valeur: "530 kgCO₂e/m² en 2025, 475 en 2028, 415 en 2031",
          precision:
            "Seuils de l'indicateur Ic construction que la RE2020 impose aux logements individuels neufs. Un studio de jardin annexe n'entre pas dans ce champ réglementaire : nous citons ces valeurs comme repère de secteur, pas comme une norme qui nous serait applicable.",
          source: "RE2020 — ministère de la Transition écologique",
          url: "https://rt-re-batiment.developpement-durable.gouv.fr/",
        },
      },
      { libelle: "Énergie consommée en fabrication, par studio", etat: "en-constitution" },
      {
        libelle: "Quantité de déchets générés",
        etat: "en-constitution",
        repere: {
          valeur: "46 millions de tonnes par an",
          precision:
            "Déchets produits chaque année par le secteur du bâtiment en France, toutes activités confondues — dont l'essentiel provient de la démolition et de la réhabilitation. C'est un volume national, pas un ratio par ouvrage : il situe l'enjeu, il ne se compare pas à un studio.",
          source: "Ministère de la Transition écologique",
          url: "https://www.ecologie.gouv.fr/dechets-du-batiment",
        },
      },
      {
        libelle: "Part des déchets valorisés",
        etat: "en-constitution",
        repere: {
          valeur: "70 % visés, 40 à 60 % constatés en construction neuve",
          precision:
            "Objectif de valorisation matière fixé par la directive-cadre européenne sur les déchets et repris à l'article 79 de la loi de transition énergétique. Le taux réellement atteint varie fortement selon l'activité.",
          source: "Ministère de la Transition écologique",
          url: "https://www.ecologie.gouv.fr/politiques-publiques/dechets-du-batiment-travaux-publics",
        },
      },
      { libelle: "Taux de perte matière sur l'acier LSF", etat: "en-constitution" },
      { libelle: "Part des composants disposant d'une FDES ou d'un PEP", etat: "en-constitution" },
      { libelle: "Distance moyenne fournisseurs → atelier", etat: "en-constitution" },
      {
        libelle: "Distance atelier → site d'installation",
        etat: "mesure-en-cours",
        note: "Calculée pour chaque projet dans le configurateur ; pas encore consolidée",
        repere: {
          valeur: "de l'ordre de 80 à 160 gCO₂e par tonne-kilomètre",
          precision:
            "Facteurs d'émission du transport routier de marchandises, très variables selon le porteur, son chargement et son taux de retour à vide. C'est la fourchette dans laquelle se situera notre livraison, pas notre résultat.",
          source: "Base Empreinte — ADEME",
          url: "https://base-empreinte.ademe.fr/",
        },
      },
      { libelle: "Part des achats réalisés en France et en Europe", etat: "en-constitution" },
      { libelle: "Heures de formation", etat: "en-constitution" },
      { libelle: "Accidents du travail avec arrêt", etat: "en-constitution" },
      { libelle: "Part des fournisseurs stratégiques évalués", etat: "en-constitution" },
    ] satisfies readonly Indicateur[],
    reserve:
      "Huit indicateurs n'ont pas de repère public qui les éclaire vraiment : nous préférons laisser la colonne vide plutôt que d'y placer un chiffre approchant. Un indicateur sans valeur n'est pas un oubli — c'est l'état réel de notre mesure aujourd'hui.",
  },

  /* — 9. Notre trajectoire — */
  trajectoire: {
    titre: "Une démarche qui progressera avec Howner",
    etapes: [
      { titre: "Mesurer", texte: "Structurer les données matières, fournisseurs, déchets et transports." },
      { titre: "Piloter", texte: "Définir les premiers indicateurs et les objectifs d'amélioration associés." },
      { titre: "Comparer", texte: "Mesurer les évolutions d'un modèle à l'autre, puis d'une année sur l'autre." },
      { titre: "Publier", texte: "Partager les résultats suffisamment robustes pour être communiqués." },
      { titre: "Améliorer", texte: "Utiliser ces résultats pour faire évoluer la conception, les achats et la fabrication." },
    ],
  },

  /* — 10. Conclusion — */
  conclusion: {
    titre: "Nous préférons progresser en transparence.",
    paragraphes: [
      "Aucune construction n'est sans impact, et la nôtre ne fait pas exception. Le prétendre serait la première des approximations.",
      "Notre responsabilité est donc moins d'avoir déjà toutes les réponses que de construire les outils qui permettent de poser les bonnes questions, de mesurer ce que nous faisons et d'améliorer nos choix à partir de ce que les données montrent.",
    ],
    citation: "Construire moins grand. Construire mieux. Et pouvoir démontrer pourquoi.",
  },

  faq: [
    {
      q: "Howner est-il une marque « écologique » ?",
      a: "Nous ne nous présentons pas ainsi. Tant que nous ne disposons pas de données suffisamment fiables sur les matières, la fabrication, le transport et l'usage de nos studios, revendiquer une qualité environnementale reviendrait à demander qu'on nous croie sur parole. Nous préférons annoncer ce que nous mesurons, et publier les résultats à mesure qu'ils deviennent solides.",
    },
    {
      q: "Pourquoi cette page n'affiche-t-elle aucun chiffre ?",
      a: "Parce que nous n'en avons pas encore qui soient vérifiables. La grille d'indicateurs présente ce que nous voulons suivre et l'état réel de chaque mesure. Elle se remplira progressivement — un indicateur sans valeur y est plus honnête qu'une estimation présentée comme un résultat.",
    },
    {
      q: "Un studio compact est-il forcément meilleur pour l'environnement ?",
      a: "Pas automatiquement, et nous nous gardons de l'affirmer. Réduire la surface peut contribuer à réduire les ressources mobilisées, mais cela dépend des matières employées, de la durée de vie de l'ouvrage et de son usage réel. C'est précisément ce que nos indicateurs doivent permettre de vérifier.",
    },
    {
      q: "Vos composants sont-ils fabriqués localement ?",
      a: "En partie seulement, et nous ne revendiquons pas un approvisionnement « 100 % local » : certains composants supposent des chaînes plus larges. Nous privilégions la proximité lorsqu'elle est compatible avec nos exigences techniques, économiques et environnementales, et nous travaillons à mesurer l'origine réelle de nos achats.",
    },
    {
      q: "Le hors-site est-il plus vertueux qu'un chantier classique ?",
      a: "Il permet surtout de mieux observer : les découpes se planifient, les chutes se comptent, les quantités consommées se connaissent. Cette capacité à mesurer est ce qui nous intéresse en premier. Les gains éventuels devront être établis par les données, pas par le principe.",
    },
  ],

  aRetenir: [
    "Nous ne revendiquons aucune qualité environnementale que nous ne pouvons pas démontrer aujourd'hui.",
    "La sobriété commence par la conception : un studio de jardin de 20 à 40 m² pensé pour un usage précis.",
    "Notre priorité est de mesurer — matières, fabrication, transport, entretien, fin de vie — avant d'affirmer.",
    "Notre démarche inclut le territoire : compétences, partenaires, emploi et valeur créée localement.",
    "Les indicateurs seront publiés à mesure qu'ils deviendront fiables, y compris ceux qui progressent lentement.",
  ],
} as const;
