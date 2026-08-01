# Configurateur v2 — proposition d'interface

Complément d'**ADR-030**. La décision de parcours et de données est dans l'ADR ;
ce document porte les choix d'interface et le comportement des composants.

Maquette interactive (écrans 1→4 fonctionnels) :
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
| **Chip de zone** | Zone de transport déduite et affichée, jamais saisie | Seul calcul automatique du configurateur (§5) |

## Adaptation

| Élément | Mobile 390 px | Desktop ≥ 1024 px |
|---|---|---|
| Parcours | Un écran à la fois | Deux colonnes : choix à gauche, visuel + récap collants à droite |
| Barre de prix | Ancrée bas, safe-area | Panneau collant en colonne droite |
| Progression | 7 filets | Étapes nommées, cliquables en arrière |
| Modèles | Cartes empilées | Deux cartes côte à côte, visuel agrandi |
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
