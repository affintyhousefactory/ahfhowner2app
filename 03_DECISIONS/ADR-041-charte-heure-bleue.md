# ADR-041 — Charte graphique « Heure bleue » (remplace la charte Affinity)

- **Statut** : Accepté — socle livré, application par lots
- **Date** : 2026-08-25
- **Décideur** : Richard
- **Faisabilité** : ✅
- **Remplace** : ADR-002 (charte Affinity)

## Contexte

ADR-040 a refait les deux pages produit en « Heure bleue ». Sur la Preview,
Richard a constaté ce que la juxtaposition produisait : le méga-menu servait des
boutons **bleu slate** au-dessus d'un hero en **lumière chaude**. Deux chartes se
superposaient à l'écran.

Sa demande : « refais la charte graphique et tout le site sur la base des pages
créées des studios ».

ADR-002 (charte Affinity, extraite d'affinityhome.io en juin) n'avait jamais été
validée par Albert et restait en attente depuis deux mois. Elle est remplacée.

## Décision

**Deux registres, une identité.**

| Registre | Surfaces | Fond |
|---|---|---|
| **Nuit** | accueil, pages produit | `--color-nuit` |
| **Clair** | 20 guides, pages légales, configurateur, formulaires | `--color-canvas` |

Ce qui ne change pas d'un registre à l'autre : typographie, dessin des boutons,
filets, espacement, **famille** de l'accent. Ce qui change : le fond et la
**valeur** de l'accent.

### Pourquoi pas tout en sombre

Option écartée par Richard après mise en balance : les 20 pages éditoriales sont
du texte long — ce sont précisément les pages qui doivent se lire jusqu'au bout —
et le configurateur sert à comparer des montants. Le sombre y coûterait plus
qu'il n'apporterait.

### L'accent quitte le bleu

Le slate `#3a5a86` est retiré. Une seule famille chaude, deux valeurs, **choisies
par le calcul de contraste et non à l'œil** :

- `--color-accent: #7a5c28` — 6,2:1 avec texte blanc (l'ancien accent était à
  7,03 : on reste dans le même ordre de lisibilité) ;
- `--color-lumiere: #e8c9a0` — 11,6:1 sur nuit.

L'azure `--color-blue` subsiste pour les **états d'information** seulement,
jamais comme accent de marque.

### Les teintes vivent dans les tokens

Les composants produit écrivaient 48 teintes en dur (`bg-[#0f1519]`,
`text-[#e8c9a0]`…). Toutes passent par `@theme`. **Il ne reste aucune teinte en
dur dans le périmètre produit** — vérifié.

C'est ce qui rend la charte modifiable : changer une valeur dans `@theme` change
le site, sans chercher les occurrences.

## Conséquences

- **L'accent change partout d'un coup** : 32 fichiers emploient `bg-accent` /
  `text-accent` / `border-accent`. Ils suivent le token sans être touchés — c'est
  l'intérêt, et c'est aussi ce qu'il faut regarder en Preview : le changement se
  voit sur le configurateur, les formulaires et le tunnel de réservation.
- **`DESIGN.md` est réécrit** : il explique désormais, il ne duplique plus les
  valeurs.
- **ADR-002 est remplacée**, deux mois après avoir été posée sans validation.
- **Alerte Albert** — changement de charte graphique du site entier.

## Amendement du 2026-08-25 — le CTA prend la teinte claire partout

Second constat de Richard sur la Preview : le bouton « Réserver » du menu était
en **bronze** quand le CTA de la page était en **lumière chaude**. Deux teintes
pour la même action, à quinze centimètres l'une de l'autre.

**Décision : garder la teinte claire des pages produit**, partout.

La variante `accent` du composant — celle par défaut, donc **42 boutons** —
devient `bg-lumiere text-ink` avec un **liseré `accent`**.

⚠ Le liseré n'est pas décoratif. La teinte claire ne donne que **1,47:1** sur le
fond de la barre de menu : sans lui, le bouton ne se détacherait pas de son fond,
alors que WCAG 1.4.11 exige 3:1 pour un composant d'interface. Le liseré bronze
est à **5,8:1**. Le texte, lui, est confortable : encre sur lumière, **11,7:1**.

**La valeur du token `--color-accent` ne change pas**, et c'est délibéré : huit
boutons de formulaire écrivent encore `bg-accent text-white` en dur. Éclaircir le
token les aurait rendus illisibles d'un coup — blanc sur beige clair, 1,58:1.
C'est la variante du composant qui change, pas la teinte.

Deux boutons écrits en ligne rejoignent le composant au passage : celui des
cartes du méga-menu (le premier repéré par Richard) et celui de l'écran
« terrain nu » du configurateur.

## Amendement 2 du 2026-08-25 — police, rayon, et les derniers boutons

Troisième passe sur la Preview. Richard : « la police sur les boutons du menu ne
semble pas être la même que celle des CTA des pages Arko », « voir également le
bouton des cookies », « laisser l'arrondi, homogénéiser les couleurs ».

**Ce n'était pas la police.** Les trois boutons employaient la même — seule la
**taille** variait : 0,95 rem au socle, 0,875 rem au menu (surcharge par
`className`), 0,78 rem aux cookies (qui n'était même pas passé par le
composant). Un écart de taille et de graisse se lit comme un changement de fonte.

Correctif : le socle porte désormais **police, graisse, interlettrage et rayon**,
et les tailles passent par une prop `size` — `sm` (40 px) ou `md` (48 px). Une
surcharge de taille par `className` n'a plus de raison d'être.

**Rayon** : `rounded-lg` (8 px). L'amendement 1 d'ADR-040 avait retenu des angles
vifs ; Richard demande de garder l'arrondi. `DESIGN.md` corrigé en conséquence.

**Les boutons restés en dehors du composant rejoignent la teinte commune** :
bandeau cookies (les deux boutons, désormais de vrais `<Button>`), formulaire de
contact, réservation v1, analyse de parcelle (ses deux registres), et surtout le
**CTA final du configurateur** — celui qui porte la conversion, au passage remonté
de 46 à 48 px.

`type="submit"` est ajouté au composant : c'est ce qui manquait pour que les
boutons de formulaire puissent y entrer.

⚠ Restent volontairement en bronze : les **états de sélection** (`Reservation`,
chips du configurateur), qui ne sont pas des boutons d'action, et
`RechercheTerrainForm` — domaine suspendu (ADR-028), qu'on ne réveille pas.

## Reste à faire (application par lots)

1. ✅ Socle — tokens, `DESIGN.md`, boutons, composants produit.
2. **L'accueil en registre nuit** — `Hero`, `Promesse`, `ProductsShowcase`,
   `Reassurance`, `Faq`, `StickyCta`.
3. **Les surfaces claires** — vérifier que les 20 guides, les pages légales et le
   configurateur restent justes avec le nouvel accent.
4. ✅ **Le méga-menu** — son bouton en ligne rejoint le composant.
5. ✅ **Les boutons de soumission** sont alignés (voir Amendement 2), hors
   domaine suspendu et états de sélection.

## Hors périmètre

Le **back-office** garde son identité (violet `#7469F4`, 358 occurrences). C'est
un outil interne, pas une surface de marque.
