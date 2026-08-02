# Configurateur v2 — proposition d'interface

Complément d'**ADR-030**. La décision de parcours et de données est dans l'ADR ;
ce document porte les choix d'interface et le comportement des composants.

Maquette interactive (écrans 1→4 et 6 fonctionnels) — révision 5 :
<https://claude.ai/code/artifact/8275bfd1-b83d-490f-80c4-eada6d3d4fc3>

## Cadre

La charte Affinity existante s'applique telle quelle — `DESIGN.md` et le bloc
`@theme` de `globals.css`. Aucun nouveau jeton n'est introduit : accent
`--color-accent` réservé aux CTA, `--color-azure` en information seule,
micro-labels en mono capitales à tracking large (l'idiome déjà présent partout
dans les composants du site).

**Les visuels actuels sont conservés** (décision Richard, 2026-08-01). De
nouveaux arriveront ; la nomenclature cible `{modele}_{vue}_{ambiance}.webp`
(§12) s'adoptera au fil des remplacements, sans casser l'existant.

## Principe de composition

Un écran à la fois sur mobile, cible **390 px**. Trois zones fixes par écran :

1. **Progression** — 7 filets pleine largeur, compacts.
2. **En-tête court** — titre + une ligne d'intention.
3. **Corps déroulant**, puis **barre de prix ancrée en bas**, hors du flux de
   défilement, `env(safe-area-inset-bottom)` respectée.

La barre de prix apparaît à l'écran 1 et ne quitte plus la vue. C'est le point
d'ancrage de tout le parcours : sur 390 px, un prix qui défile hors de l'écran
oblige à remonter pour décider.

## Composants — décision et motif

| Composant | Comportement | Pourquoi |
|---|---|---|
| **Barre de prix ancrée** | Total + mention fixe + bouton suivant, ancrés bas | Rend chaque choix immédiatement arbitrable |
| **Delta transitoire** | `+ 7 900 €` s'affiche 2 s au-dessus du total, puis s'efface | Un total à cinq chiffres ne dit pas ce qu'on vient de décider |
| **Paliers de terrasse** | 4 barres dont la hauteur encode la taille relative ; prix dessous | Le §5 interdit le prix au m² ; la barre restitue la taille sans réintroduire le ratio |
| **Groupe structurel** | Les 3 options d'ossature dans un cadre distinct, mention en tête du groupe | La contrainte porte sur le groupe, pas sur chaque ligne — le dire une fois au bon niveau |
| **Filtrage par modèle** | Option incompatible **absente**, jamais grisée | Une option grisée invite à demander pourquoi ; une option absente ne pose pas la question (§15) |
| **Mention + dépliant** | Mention courte toujours visible ; détail au clic/toucher, atteignable au clavier | Une bulle au survol n'existe pas sur un téléphone (§10) |
| **Transport au km** | Distance déduite de la pré-analyse, détail du calcul affiché (grutage + km × €/km) | Seul calcul automatique ; varie avec le poids du modèle, donc se recalcule au changement d'unité |
| **Sélecteur de numéro** | 6 cases, confirmés barrés, le vôtre en évidence ; le CTA devient « Réserver le n° 04 » | Seul FOMO autorisé par le §6 : rareté réelle et vérifiable, jamais de compte à rebours |
| **« Demandé » après le choix** | Un numéro déjà demandé reste libre ; l'information n'apparaît qu'une fois ce numéro sélectionné | Un 3ᵉ état sur la grille n'est pas actionnable, crée de l'hésitation au pire endroit du tunnel et brouille le compteur |
| **Téléphone à indicatif** | Drapeau + préfixe + numéro dans une seule pilule (`react-phone-number-input`, `defaultCountry="FR"`) | Composant déjà en place dans `Reservation.tsx` — pas de nouveau motif à apprendre |
| **Porte conditionnelle** | CTA inactif tant que les CGV ne sont pas cochées, motif écrit sous le bouton | Un bouton qui refuse silencieusement laisse chercher l'erreur (§7 : case jamais pré-cochée) |

## Adaptation

| Élément | Mobile 390 px | Desktop ≥ 1024 px |
|---|---|---|
| Parcours | Un écran à la fois | Deux colonnes : choix à gauche, visuel + récap collants à droite |
| Barre de prix | Ancrée bas, safe-area | Panneau collant en colonne droite |
| Progression | 7 filets | Étapes nommées, cliquables en arrière |
| Modèles | Cartes empilées | Deux cartes côte à côte, visuel agrandi |
| Pré-analyse | Champ pleine largeur, bouton dessous sous 340 px | Champ + bouton sur une ligne |
| Numéros de série | 6 cases en grille | 6 cases alignées, plus hautes |
| Coordonnées | Prénom/Nom sur une ligne, reste empilé | Deux colonnes |
| Cibles tactiles | ≥ 48 px | Survol autorisé **en plus** du clic, jamais à sa place |

## Accessibilité — non négociable

- Toute commande est un `<button>` avec `aria-pressed` ou `aria-selected`, pas
  un `div` cliquable.
- `:focus-visible` visible sur chaque cible.
- Les mentions légales ne dépendent jamais du survol.
- `prefers-reduced-motion` neutralise le delta animé et les transitions.
- `font-variant-numeric: tabular-nums` sur toutes les colonnes de chiffres.

## Écran 0 — le filtre

Trois cibles tactiles pleine largeur, chacune avec sa situation explicitée. La
troisième — « un logement indépendant sur un terrain nu » — remplace le corps
par le bloc « prochainement » et **retire la barre de prix** : aucun montant
n'est jamais affiché sur cette branche. Critère de recette n°1 (§16).

## Écran 1 — pré-analyse du terrain

Le champ « Votre situation terrain » est repris tel quel : même placeholder
(`Ex : 12 rue de la Paix, 64100 Bayonne`), même bascule vers le numéro de
parcelle, même bouton « Pré-analyser ». Il est placé **après le choix du modèle
et avant le total** : une seule saisie rend le zonage PLU et la distance de
transport, donc elle doit précéder le prix.

Tant que l'adresse n'est pas saisie, la ligne transport reste « à estimer » et
n'entre pas au total.

## Écran 6 — réserver un numéro, sans paiement

Le CTA dit « Réserver ce numéro » : l'écran doit donc montrer **lequel**. Les six
numéros de la Série 01 sont affichés, les confirmés barrés et non cliquables.

Le formulaire fait quatre champs, tous obligatoires, puis deux cases dont aucune
n'est pré-cochée : opt-in email **facultatif**, acceptation des CGV
**obligatoire**. Le bouton reste inactif tant que la seconde n'est pas cochée.

Aucun paiement à cet écran — le devis et le lien arrivent après l'appel de
qualification.

## Coque du tunnel — une seule porte de sortie

Le parcours ne porte **ni navigation ni pied de page**. Une fois entré, chaque
lien sortant est un abandon ; il reste exactement une porte, le logo Howner en
haut à gauche, qui ramène à l'accueil.

Techniquement cela impose un **groupe de routes dédié** `src/app/(configurateur)`
plutôt qu'une mise en page imbriquée sous `(public)` : une mise en page enfant
s'ajoute à sa parente, elle ne peut pas en retirer la `<Nav>`. Sont conservés de
la coque publique `Analytics` et `CookieBanner` — le consentement (ADR-015) doit
être présent sur l'écran où l'on saisit ses coordonnées.

Entrée dans le tunnel : les deux CTA « Réserver » du méga-menu Modules pointent
sur `/configurer/v2?produit=one|max`. Le paramètre est lu **côté serveur** par la
page ; `useSearchParams` imposerait une frontière Suspense et ferait basculer le
parcours entier en rendu client.

**Sur 390 px, l'en-tête s'efface en descente et revient en montée.** La scène
collante et l'en-tête se disputent la même bande de 64 px : empiler deux barres
ne laisserait qu'un tiers d'écran aux options. L'en-tête sort donc du champ dès
qu'on descend et rentre au premier geste vers le haut — la porte de sortie est
toujours à un geste, jamais à un aller-retour. Seuil de 6 px sur le sens du
défilement : l'inertie de Lenis produit des micro-inversions qui, sans seuil,
feraient clignoter la barre.

**La scène ne rétrécit pas** (arbitrage Richard, 2026-08-02). Une hauteur qui
tombe de 232 à 132 px recadre le rendu : sur un visuel 4:3, `object-cover`
coupait le pied du module — terrasse et sol disparaissaient, et le module
semblait remonter dans le cadre. Un tiers d'écran constant vaut mieux qu'un
rendu qui s'ampute ; le sous-titre et les pastilles restent donc visibles en
permanence. C'est l'escamotage de l'en-tête, et lui seul, qui rend de la place
aux sections.

La réserve que l'en-tête occupe au-dessus de la scène transite par une variable
CSS (`--cfg-nav`, publiée sur la racine) : la scène vit dans la page, l'en-tête
dans la mise en page, et c'est la seule couture qui les relie sans remonter un
état partagé jusqu'au groupe de routes. Nulle quand l'en-tête s'est effacé, nulle
aussi au-delà de 1024 px où le comportement ne s'applique pas — la place n'y
manque pas et un en-tête mobile y serait du bruit.

## Ambiances — teinte et rendu

Chaque ambiance porte son `visuel` et sa `teinte` dans la grille (`config.ts`),
jamais dans un composant : le back-office (ADR-033) doit pouvoir en ajouter une
sans redéploiement.

La scène collante affiche le rendu extérieur de l'ambiance courante. Les rendus
sont **empilés et permutés en opacité**, pas montés à la demande — le budget
performance ci-dessous exige le préchargement de l'ambiance suivante, et un
montage conditionnel ferait apparaître un carré vide au moment précis où l'on
compare deux teintes. Un voile dégradé garde le nom du module lisible quelle que
soit la teinte du bardage derrière lui.

Le sélecteur signale la sélection par **la teinte de l'ambiance**, pas par
l'accent : trois boutons cerclés du même orange ne diraient pas lequel des trois
bardages on regarde.

## Ce qui reste ouvert

Câblés comme des drapeaux, pas comme des branches de code — basculer l'un ou
l'autre ne doit rien coûter :

- **Nombre d'ambiances** au lancement, deux ou trois (§17.3). Le sélecteur est
  un segmented control qui doit fonctionner à 2 comme à 3 items.
- **Bloc rentabilité** dans le parcours particulier (§17.5). Drapeau par usage.

## Budget performance (§14)

Contenu principal sous **2,5 s en 4G**. Grilles chargées une fois — aucun appel
réseau pour recalculer un prix. Ambiance suivante préchargée pour que le
changement soit instantané. Le poids des visuels est, selon la spec, le premier
facteur de perte de visiteurs sur ce type de parcours.
