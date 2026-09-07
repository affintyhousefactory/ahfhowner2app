/* ============================================================
   Contenu — page « Hébergements professionnels » (étude d'implantation).
   Source : `docs/specs/pages-seo/hebergements-professionnels.md`
   (brief de Richard, Drive « AHF - Plans_SiteWeb_Inspirations », 2026-09-07).

   ⚠ LA RÈGLE QUE LE BRIEF POSE, ET QUI GOUVERNE TOUTE LA PAGE :

       « L'objectif n'est pas de vous proposer immédiatement un nombre
       d'unités. »

   Elle a deux conséquences tenues ici :

   1. **Aucun prix, aucun volume, aucun délai n'est affiché.** Un exploitant qui
      cherche à valoriser une parcelle n'achète pas un produit sur étagère : il
      teste une faisabilité. Chiffrer avant d'avoir vu le site serait le
      contraire de ce que la page propose.
   2. **Le CTA mène au contact, pas au configurateur.** Le configurateur chiffre
      un studio et son transport — geste juste pour un particulier, faux ici :
      il répondrait par un prix à quelqu'un qui pose une question d'implantation.
      Décision de Richard du 2026-09-07.

   ⚠ Périmètre : campings et plein air **d'abord** — c'est la cible 1 du CRM et
   le fichier de prospection existant — mais la page nomme aussi les hôtels,
   domaines et gîtes (cible 2). D'où la route `/hebergements-professionnels`
   plutôt qu'une route « camping » qui aurait fermé la moitié du sujet. Une page
   strictement HPA reste possible plus tard si le référencement le justifie.

   ⚠ Marque (ADR-029) : « studio de jardin », « unité », « hébergement » —
   ces deux derniers sont des termes **imposés**. Le brief parlait d'un nombre
   de « modules » : repris partout en « unités », qui est le mot du référentiel
   et évite le voisinage d'un terme de la blocklist.
   ============================================================ */

export const HEBERGEMENTS_PRO = {
  route: "/hebergements-professionnels",

  metaTitle:
    "Hébergements pour campings et établissements — étude d'implantation Arko | HOWNER",
  metaDescription:
    "Camping, hôtellerie de plein air, domaine ou gîte : nous étudions avec vous l'implantation de studios Arko sur votre site — potentiel de la parcelle, accès, raccordements, urbanisme et phasage.",

  hero: {
    eyebrow: "Professionnels",
    chapo:
      "Vous envisagez de créer de nouveaux hébergements, de valoriser une parcelle disponible ou de faire évoluer votre offre ?",
    paragraphes: [
      "Howner étudie avec vous un projet d'implantation de studios Arko, en tenant compte de votre site, de vos usages, de vos contraintes d'accès et des premières contraintes réglementaires identifiées.",
      "L'objectif n'est pas de vous proposer immédiatement un nombre d'unités. C'est d'abord de savoir ce que votre terrain permet.",
    ],
    note: "Campings et hôtellerie de plein air, domaines, hôtels et gîtes.",
  },

  /* — Ce que l'étude regarde — les huit points du brief, dans son ordre. — */
  etude: {
    titre: "Ce que nous étudions avec vous",
    intro: [
      "Une première étude de faisabilité ne coûte rien et ne vous engage pas. Elle sert à écarter tôt ce qui bloquerait tard.",
    ],
    puces: [
      "Le potentiel de la parcelle",
      "Les implantations possibles",
      "Les modèles Arko adaptés à vos usages",
      "Les contraintes d'accès, de transport et de pose",
      "Les besoins en raccordements",
      "Les premières contraintes d'urbanisme",
      "Le phasage possible du projet",
      "Une première enveloppe économique",
    ],
    reserve:
      "Cette étude est indicative : elle prépare la discussion, elle ne remplace ni l'instruction d'une autorisation d'urbanisme, ni l'avis des services compétents sur votre commune.",
  },

  /* — Pourquoi on ne commence pas par un nombre — le cœur du brief. — */
  methode: {
    titre: "Pourquoi nous ne commençons pas par un nombre",
    cartes: [
      {
        titre: "Le terrain décide",
        texte:
          "Accès des engins, portance du sol, distances aux limites, réseaux disponibles : ce sont ces éléments qui fixent ce qui est implantable, pas une liste d'implantations théoriques.",
      },
      {
        titre: "L'usage avant le volume",
        texte:
          "Un hébergement de courte durée, une chambre de personnel saisonnier et un logement d'astreinte n'appellent ni la même surface, ni le même niveau d'équipement.",
      },
      {
        titre: "Un projet se phase",
        texte:
          "Commencer par quelques unités, mesurer le taux de remplissage réel, puis étendre : c'est souvent plus solide qu'un déploiement d'un seul tenant.",
      },
      {
        titre: "L'urbanisme se vérifie tôt",
        texte:
          "Le régime applicable dépend de votre zone, de votre classement et de la destination des hébergements. Nous en donnons une première lecture avant d'aller plus loin.",
      },
    ],
  },

  /* — Ce que vous obtenez à l'issue — ajouté au brief : il annonce le geste,
       pas son résultat, et un exploitant a besoin de savoir ce qu'il reçoit. — */
  livrable: {
    titre: "Ce que vous obtenez",
    puces: [
      "Un échange avec notre architecte intégrée sur votre site et vos usages",
      "Une lecture des implantations possibles, avec leurs contraintes",
      "Les points réglementaires à instruire, identifiés tôt",
      "Une première enveloppe économique, avec ce qu'elle couvre et ce qu'elle ne couvre pas",
    ],
    reserve:
      "Rien n'est facturé à ce stade, et rien ne vous engage. Seul un devis signé fait foi.",
  },

  cta: {
    titre: "Vous avez un terrain ou un projet en réflexion ?",
    texte:
      "Parlons-en et réalisons une première étude de faisabilité.",
    libelle: "Étudier mon projet d'implantation",
    /* Message d'amorce du formulaire de contact. Le visiteur reste libre de le
       réécrire — c'est le même mécanisme que la branche « terrain nu » du
       configurateur (`?sujet=` + `?message=`), déjà en production. */
    message:
      "Nous exploitons un établissement et souhaitons étudier une implantation de studios Arko.\n\nNotre site : \nNombre d'hébergements envisagés : \nHorizon du projet : \n",
  },
} as const;
