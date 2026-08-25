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

## Reste à faire (application par lots)

1. ✅ Socle — tokens, `DESIGN.md`, boutons, composants produit.
2. **L'accueil en registre nuit** — `Hero`, `Promesse`, `ProductsShowcase`,
   `Reassurance`, `Faq`, `StickyCta`.
3. **Les surfaces claires** — vérifier que les 20 guides, les pages légales et le
   configurateur restent justes avec le nouvel accent.
4. **Le méga-menu** — c'est le point de départ du constat de Richard : ses cartes
   produit et ses boutons doivent suivre.

## Hors périmètre

Le **back-office** garde son identité (violet `#7469F4`, 358 occurrences). C'est
un outil interne, pas une surface de marque.
