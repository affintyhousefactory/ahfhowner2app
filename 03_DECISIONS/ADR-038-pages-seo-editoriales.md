# ADR-038 — Ouverture de 19 pages éditoriales SEO (usages, guides, local)

> Périmètre porté à **21 routes** le 2026-09-07 — voir § Amendement en fin de document.

- **Statut** : Accepté
- **Date** : 2026-08-20 — **amendée le 2026-09-07** (deux pages hors classeur : démarche RSE et hébergements professionnels ; périmètre porté à 21 routes ; clause anti-greenwashing ajoutée au §7)
- **Phase** : 1.5
- **Faisabilité** : ✅ Élevée (technique) · 🟠 Moyenne (éditorial et juridique)
- **Alerte Albert** : **Oui — le site passe de 8 à 27 URLs indexables et publie des contenus réglementaires (permis, taxes, meublés de tourisme) alors que le risque ADR-015 est ouvert.**

## Contexte

Richard a produit un classeur `PagesSite_SEO` (Drive, 2026-08-18, révisé le 2026-08-20) qui commande **19 pages** et pointe, pour chacune, une spec rédigée par Albert et les visuels à employer. Les 17 fichiers sources sont versés dans `docs/specs/pages-seo/` pour que cet ADR les cite par un chemin stable — même convention que la spec configurateur et le texte « À propos » (ADR-037).

Le site n'a aujourd'hui **8 URLs au sitemap**. Le chantier le porte à 27. Ce n'est plus un ajout de page, c'est un changement de nature : Howner passe d'une vitrine mono-produit à un site de contenu qui capte des recherches informationnelles très en amont de l'achat.

Le classeur, lu littéralement, n'était pas exécutable. Trois défauts, tous relevés avant d'écrire une ligne :

1. **Trois routes en collision.** Trois specs différentes visaient `/guide/reglementation-permis/` et deux visaient `/guide/prix-studio-jardin-habitable/`. Deux contenus ne peuvent pas vivre sur une URL. Le hub d'Albert (`guide-00-hub.md`) avait vu le problème et proposait une résolution ; le `README-livrable-guides.md` la documente.
2. **Le copy viole le garde-fou vocabulaire, massivement** — 74 « maison », 34 « tiny house », 8 « modulaire », 5 « clé en main », 2 « préfabriqué », 2 « catalogue », 1 « résidence principale » sur les 15 specs. `npm run check:vocabulaire` refuse tout cela (ADR-029).
3. **Les 4 pages locales sont commandées « identiques »** à la page haut de gamme, seule la ville changeant. C'est la définition d'une **page passerelle**, que les moteurs sanctionnent — et la sanction porte sur le domaine, pas seulement sur les 4 URLs.

Les quatre arbitrages ci-dessous ont été soumis à Richard le 2026-08-20 et tranchés par lui.

## Décision

### §1 — Périmètre : 19 pages créées, 2 pages vérifiées

19 routes nouvelles : **5 pages d'usage**, **1 hub + 9 guides**, **4 pages locales**. Les deux lignes du classeur qui visent `/studio-jardin-arko-one` et `/studio-jardin-arko-max` pointent le `contexte-refonte.md`, **déjà appliqué et en production le 2026-08-19** : elles relèvent d'une vérification de conformité et de l'intégration de leurs vrais visuels, pas d'une création.

### §2 — Les trois routes en collision sont renommées, d'après le hub

| Spec | Classeur | Route retenue |
|---|---|---|
| `guide-04-permis-studio-jardin-20m2` | `/guide/reglementation-permis/` | `/guide/permis-studio-jardin-20m2` |
| `guide-05-permis-studio-jardin-40m2` | `/guide/reglementation-permis/` | `/guide/permis-studio-jardin-40m2` |
| `guide-06-prix-reel-…` | `/guide/prix-studio-jardin-habitable/` | `/guide/prix-reel-studio-jardin-habitable` |

**Réserve éditoriale portée au dossier** : les guides 01, 04 et 07 traitent le même sujet sous trois angles (réglementation 20 m², permis 20 m², surface sans permis). Trois URL distinctes règlent la collision technique, pas la concurrence entre elles. Si les brouillons du lot 3 montrent un recouvrement trop fort, la fusion avec redirection permanente reste ouverte — c'est explicitement l'alternative proposée par le `README-livrable-guides.md`.

### §3 — Pas de slash final

Les 8 routes existantes n'en portent pas ; le classeur en met sur 15 lignes. Le site garde sa convention, Next redirige automatiquement la variante avec slash. Les URL telles qu'écrites au classeur restent donc valides pour un visiteur.

### §4 — Les quatre arbitrages de Richard (2026-08-20)

**(a) Le copy est réécrit, le garde-fou n'est pas assoupli.** Les 74 « maison » désignent presque toujours l'habitation existante du visiteur (« à dix mètres de la maison »), pas le produit — mais le contrôle ne lit pas un contexte, et lui apprendre des exceptions le rendrait interprétable. C'est exactement ce qui a laissé « clé en main » atteindre la production le 2026-08-02. Les tournures deviennent « votre habitation », « le logement principal », « chez vous ». Aucune page du chantier n'est exclue du contrôle.

**(b) « tiny house » est autorisé sur la seule page qui compare** — ADR-029 est amendée en ce sens le même jour. Le terme y désigne toujours le produit concurrent qu'on écarte, jamais un Arko. On ne se démarque pas de ce qu'on refuse de nommer, et c'est le mot que le visiteur tape. L'exception est **ciblée par terme et par chemin** (`sauf` dans `check-vocabulaire.mjs`), et non par exclusion de fichier : le reste du contrôle continue de s'exercer sur cette page.

**(c) Les pages locales portent 30 à 40 % de contenu propre** — contraintes d'urbanisme locales, typologies de parcelles, accès chantier, secteurs patrimoniaux. Sans cette matière, elles ne passent pas en ligne. Une page locale qui ne dit rien de local ne tient pas dans la durée, et met en risque le domaine entier.

**(d) Livraison en cinq lots**, une PR par lot, chacune vérifiée en Preview avant la suivante. La production ne bouge que sur accord explicite.

### §5 — Un registre, source unique des routes

`src/lib/pages/registry.ts` porte les 19 routes : `route`, `h1`, `libelle`, `resume`, `famille`, `spec`, `priorite`, `statut`. Sitemap, navigation, fil d'Ariane, hub et maillage interne en dérivent — **une route ne s'écrit qu'ici**.

`statut: "a-venir" | "publiee"` est la pièce maîtresse : entre le premier et le dernier lot, la majorité des routes n'a pas de page. Seules les `"publiee"` entrent au sitemap et au maillage. Déclarer une URL sans page coûte du budget de crawl pour un 404, et abîme la confiance accordée au sitemap.

Le maillage (2 à 4 liens par guide, exigé par la spec) dérive de `guidesVoisins()`, de façon **déterministe** : un ordre aléatoire changerait les liens à chaque rendu — instabilité pour un moteur, diff illisible pour un humain.

### §6 — Données structurées

Trois schémas ajoutés à `src/lib/jsonld.ts`, alimentés par le registre : `breadcrumbSchema()` (`BreadcrumbList`, sur toutes les pages du chantier), `articleSchema()` (`Article`, sur les guides), `guidesHubSchema()` (`CollectionPage` portant un `ItemList`, sur `/guide`).

**Aucun `FAQPage` par défaut** : ce schéma ne se pose que si les questions et réponses sont réellement visibles sur la page. Il sera ajouté au cas par cas, à la vue du rendu.

### §7 — Ce que ces pages ne feront pas

- **Aucun prix nouveau.** Les seuls montants affichables sont ceux déjà publics (`PRICING`, `site.ts`). Les guides parlent de structure de coût, pas de tarif Howner — sans quoi ils se périmeraient avec les grilles (règle du 2026-08-04).
- **Aucun avis juridique individualisé.** Les seuils nationaux ne remplacent jamais le PLU, les servitudes ni la lecture du terrain. Formule de référence du hub : « Un guide éclaire. Le terrain décide. »
- **Aucune promesse de délai fixe**, aucune absence de formalité annoncée, aucune performance thermique ou acoustique imputée à la seule structure LSF.
- **Aucun nom de fournisseur**, ADR-029 §67 — y compris dans les noms de fichiers d'images, qui deviennent des URL publiques.

### §8 — Ce que le lot 0 ne fait pas

Aucun composant d'habillage éditorial n'est créé ici. Les blocs communs aux specs (hero, cartes de bénéfices, duo One/Max, comparatif, parcours, bandeaux de conversion) **naîtront avec la première page** du lot 2, où ils seront éprouvés immédiatement. Une abstraction devinée avant tout usage se paie deux fois : à l'écriture, puis à la réécriture.

---

## Amendement du 2026-09-07 — deux pages hors classeur, et la première qui sort du gabarit

Deux pages sont créées ce jour à la demande de Richard, à partir de briefs qui
**ne viennent pas du classeur `PagesSite_SEO`** :

| Route | Objet | Source du brief |
|---|---|---|
| `/guide/demarche-rse-howner` | Démarche RSE — ce qui est mesuré, ce qui ne l'est pas | Drive, `PROMPT_CLAUDE_PAGE_GUIDE_RSE_HOWNER.md` |
| `/hebergements-professionnels` | Étude d'implantation pour exploitants d'établissements | Drive, `CTA HPA — Étude d'implantation ARKO.md` |

Le périmètre du §1 passe donc de **19 à 21 routes**. Les deux briefs sont
versés dans `docs/specs/pages-seo/` comme les dix-sept autres : un ADR qui cite
un fichier du Drive cite une adresse qui bouge.

### 1. Le §5 tient sans modification, et c'est le point à retenir

Ces deux pages n'ont **rien de commun** — l'une est un article du Guide, l'autre
une porte d'entrée commerciale ; l'une a son propre gabarit, l'autre réutilise
celui des pages d'usage. Elles se déclarent pourtant **au même endroit, avec le
même objet** : `route`, `h1`, `libelle`, `resume`, `famille`, `spec`,
`priorite`, `statut`.

C'est la preuve que le registre porte bien ce qu'il prétend porter — **des
routes, pas des gabarits**. Aucune des deux n'a demandé d'y ajouter un champ.
La règle est donc confirmée et étendue : **toute page éditoriale nouvelle se
déclare au registre, qu'elle vienne du classeur ou non.**

Les deux naissent en `statut: "a-venir"`, conformément au §5 : elles sont
servies, elles n'entrent au sitemap qu'une fois vérifiées en Preview. ⚠ Elles
sont pourtant déjà atteignables — le menu d'en-tête pointe la page
professionnels, l'accueil pointe les deux. **Ce n'est pas une entorse** : un
lien interne vers une page servie est licite ; ce que le §5 interdit, c'est
d'annoncer aux moteurs une URL sans page. La distinction mérite d'être écrite,
car elle se rejouera.

### 2. Première page du chantier qui ne passe pas par le gabarit commun

`/guide/demarche-rse-howner` vit dans le Guide mais **n'est pas rendue par
`ArticleGuide`**. Le §8 disait que les composants d'habillage naîtraient avec
la première page qui en aurait besoin ; c'est la première qui déborde de ceux
qui existent.

Motif, et il est éditorial avant d'être technique : `ArticleGuide` rend des
paragraphes, des puces et des tableaux. Or quatre blocs de cette page **sont
l'argument** et ne survivraient pas à une mise en puces — le cycle de vie doit
se lire comme une chaîne, la grille d'indicateurs doit montrer des cases vides
assumées, la trajectoire doit se lire comme un mouvement, les cartes du
territoire portent la seule partie non environnementale de la démarche.

**Mise en œuvre** : une route statique `/guide/demarche-rse-howner/page.tsx`,
sœur de `/guide/[slug]`. Next sert la statique avant la dynamique ; la page
n'entre donc pas dans `GUIDES`, et `[slug]` n'a pas à connaître son existence.
Le registre, lui, la connaît — c'est de lui que viennent son `h1`, son libellé
de fil d'Ariane et son statut.

> **Règle qui en découle** : sortir du gabarit se justifie par ce que le
> contenu perdrait à y entrer, jamais par une préférence de rendu. Une seconde
> page qui réclamerait le même traitement sans cette démonstration devrait
> d'abord essayer `ArticleGuide`.

### 3. Le §7 s'applique intégralement, et gagne une clause

Les deux pages respectent le §7 : aucun prix nouveau, aucun avis juridique
individualisé, aucune promesse de délai, aucun nom de fournisseur. La page
professionnels **n'affiche ni prix, ni volume, ni délai** — son brief l'exige
(« l'objectif n'est pas de vous proposer immédiatement un nombre d'unités »),
et c'est aussi pourquoi son appel mène au formulaire de contact et non au
configurateur : celui-ci répondrait par un prix à quelqu'un qui pose une
question de faisabilité.

**Clause ajoutée au §7, à cause de la page RSE :**

> **Aucune allégation environnementale qui ne puisse être démontrée.** Pas de
> chiffre, de label ni de certification inventés ; pas de formulation absolue
> (« écologique », « 100 % local », « bas carbone », « zéro déchet ») ; pas de
> déduction implicite — un studio compact n'est pas déclaré meilleur pour
> l'environnement, le hors-site n'est pas déclaré plus vertueux. Ce qui n'est
> pas mesuré s'annonce comme un indicateur en cours de constitution.
>
> Les ordres de grandeur publics affichés en regard des indicateurs (RE2020,
> déchets du bâtiment, valorisation, transport) portent leur source et la
> mention **« Repère public — pas notre chiffre »**. Celui de la RE2020 précise
> qu'un studio de jardin annexe n'entre pas dans le champ de cette
> réglementation : le citer sans cette réserve laisserait croire que nous y
> sommes soumis.
>
> Ces énoncés sont des **allégations environnementales au sens du code de la
> consommation**. Le régime est le même que celui du §7 sur les affirmations
> réglementaires : on ne publie que ce qu'on peut défendre.

Cette clause a une portée qui dépasse les pages du chantier. Elle a d'ailleurs
imposé de **réécrire la section « 04 — Ancrée dans le futur » de `/a-propos`**,
qui affirmait « objectif zéro déchet », « indéfiniment recyclable » et « le
respect de la Terre » — soit exactement ce que la page RSE écarte, à deux clics
de distance. Deux surfaces qui parlent d'écologie ne peuvent pas tenir deux
discours : **celle qui promet le plus décide de ce qu'on nous opposera.**

### Ce que cet amendement ne fait pas

- Il **ne fixe pas l'échéance de l'objectif de −10 %** annoncé sur la page RSE.
  Le texte publié dit « −10 % par rapport à notre première mesure fiable », avec
  la réserve qu'un pourcentage sans année de référence ne veut rien dire. Poser
  une échéance au jugé serait la seule vraie approximation de cette page.
  **Arbitrage attendu de Richard.**
- Il ne rouvre pas le §4 (arbitrages du 2026-08-20) ni le traitement des pages
  locales.
- Il ne bascule aucune des deux pages en `"publiee"` : la vérification en
  Preview reste la condition, et elle est humaine.

## Faisabilité

- **Verdict** : ✅ techniquement — pages statiques, aucune donnée, aucun appel externe. 🟠 éditorialement et juridiquement : le volume de copy est important et 9 pages portent des affirmations réglementaires.
- **Dépendances externes** :
  - **Matière locale attendue de Richard** pour le lot 4 (contraintes par commune). Sans elle, les 4 pages restent `"a-venir"`.
  - **Visuels ARKO One** — 53 extérieurs et 33 intérieurs disponibles au Drive, à trier au lot 1. Ils permettront enfin de retirer `placeholderMedia` de l'Arko One.
  - **Aucune image fournie pour les 10 pages guides** (colonne vide au classeur) : parti éditorial sobre, ou sélection à demander.
- **Risques** :
  - **Juridique (🟠, lié à ADR-015)** — publier sur le permis de construire, les taxes d'urbanisme et les meublés de tourisme engage la marque. Les specs portent les bonnes précautions et six sources officielles vérifiées au 19/08/2026, mais **ce contenu doit rejoindre le dossier avocat des CGV**.
  - **Cannibalisation SEO** entre les guides 01, 04 et 07 (voir §2).
  - **Pages passerelles** si le §4(c) n'est pas tenu sur les 4 pages locales.
  - **Poids de page (ADR-006)** — Lighthouse 100 et LCP < 0,8 s valent aussi pour ces pages. Les visuels passent en AVIF, `sizes` réel, aucune vidéo hors `useVisible`.
  - **Navigation** — 19 entrées ne tiennent pas dans une barre. Le regroupement par `famille` du registre est prévu pour ça ; l'arbitrage de présentation se prendra quand des pages seront réellement publiées.

## Conséquences

- **Sitemap** dérivé du registre pour ces pages : il ne peut plus déclarer une route sans page.
- **Contrôle vocabulaire enrichi** d'un mécanisme d'exception ciblée (`sauf`), distinct d'`EXCLUS` : `sauf` lève **un terme sur un chemin**, `EXCLUS` sort **un fichier entier** du contrôle. La première forme ne désarme pas le garde-fou, la seconde si — d'où le commentaire qui interdit d'employer `sauf` pour faire taire un échec.
- **ADR-029 amendée** le même jour (« tiny house », usage comparatif).
- **`project-access.json`** déclare le Drive partagé `0AAULY7mzIYw1Uk9PVA`, où vit le classeur. Il ne l'était pas : la lecture du 2026-08-20 s'est faite sur désignation explicite de Richard, propriétaire du fichier. La règle CCOWORK veut une déclaration écrite — c'est fait.
- **Chaque lot suivant** passe ses pages de `"a-venir"` à `"publiee"` **après** vérification en Preview, jamais avant.

## Sources

- `docs/specs/pages-seo/` — les 17 fichiers du chantier (classeur `PagesSite_SEO`, specs d'Albert, contexte de refonte).
- `docs/specs/pages-seo/guide-00-hub.md` — arbitrage des routes en collision, cadre de marque, sources réglementaires.
- `docs/specs/pages-seo/README-livrable-guides.md` — conflit d'URL documenté par Albert.
- `03_DECISIONS/ADR-029-repositionnement-produit-marque.md` — vocabulaire, §67 (aucun partenaire nommé), § Amendement du 2026-08-20 (« tiny house »).
- `03_DECISIONS/ADR-018-socle-seo.md` — sitemap, JSON-LD, `llms.txt`.
- `03_DECISIONS/ADR-015-legal-acompte-arrhes-cgv.md` — risque juridique ouvert, dossier avocat.
- `src/lib/pages/registry.ts`, `src/lib/jsonld.ts`, `src/app/sitemap.ts`, `scripts/check-vocabulaire.mjs`.
