# DESIGN — Charte « Heure bleue »

> Source de vérité visuelle depuis le 2026-08-25 (**ADR-041**, remplace la charte
> Affinity d'ADR-002). Appliquée par les tokens `@theme` de `src/app/globals.css`.
> **Les valeurs vivent dans les tokens, pas ici** : ce document explique, il ne
> duplique pas.

## Le parti

**Deux registres, une identité.**

| Registre | Où | Fond |
|---|---|---|
| **Nuit** | surfaces d'émotion — accueil, pages produit | encre `--color-nuit` |
| **Clair** | surfaces de lecture et d'outil — guides, pages légales, configurateur, formulaires | `--color-canvas` |

Ce qui **ne change pas** d'un registre à l'autre : la typographie, le dessin des
boutons, les filets, l'espacement, et la **famille** de l'accent.

Ce qui change : le fond, et la **valeur** de l'accent — parce qu'une teinte
lisible sur encre ne l'est pas sur blanc. C'est de la physique, pas du goût.

Pourquoi deux registres plutôt qu'un site tout sombre : les 20 pages éditoriales
sont du texte long, et ce sont les pages qui doivent se lire jusqu'au bout. Le
configurateur, lui, sert à comparer des montants. Le sombre y coûterait plus
qu'il n'apporterait.

## Palette

Les valeurs sont dans `@theme` (`globals.css`). Ici, ce qu'elles veulent dire.

**Registre clair** — `canvas` (base), `surface` (blocs et images), `paper`
(alternative douce), `ink` (texte et titres), `muted` (secondaire), `line`
(filets).

**Registre nuit** — `nuit` (fond), `nuit-doux` (bandeaux et clôtures),
`nuit-titre`, `nuit-texte`, `nuit-muted`, `nuit-faible`.

**Accent** — une seule famille chaude, deux valeurs :

| Token | Usage | Contraste mesuré |
|---|---|---|
| `accent` `#7a5c28` | bouton plein et lien sur fond clair | 6,2:1 avec texte blanc · 5,8:1 en texte sur canvas |
| `accent-ink` `#5f4720` | survol sur fond clair | 8,7:1 |
| `lumiere` `#e8c9a0` | accent sur nuit | 11,6:1 |
| `lumiere-ink` `#f4e0c4` | survol sur nuit | 14,3:1 |

**Le bleu slate d'Affinity (`#3a5a86`) est retiré.** Il jurait avec la lumière
des pages produit : sur la Preview du 2026-08-25, le méga-menu affichait des
boutons bleus au-dessus d'un hero chaud — deux chartes superposées à l'écran.
C'est ce constat de Richard qui a déclenché cette charte.

`--color-blue` (azure) subsiste pour les **états d'information** seulement, jamais
comme accent de marque.

Tous les contrastes ci-dessus sont **calculés**, pas estimés. Toute nouvelle
teinte destinée à porter du texte passe par le même calcul avant d'entrer ici.

## Typographie

Inchangée — c'est ce qui fait que la refonte ne dépayse pas.

- **Space Grotesk** en titrage (`--font-display`), graisse normale, interlettrage
  serré (`-0.02em` à `-0.035em` selon la taille).
- **Inter** en texte courant (`--font-sans`), graisse légère (300) sur les
  paragraphes d'accroche.
- **Space Mono** (`--font-mono`) pour les surtitres et les libellés : capitales,
  `letter-spacing` 0.16em à 0.24em. C'est la signature de la marque.

Échelle fluide par `clamp()` : `--text-display`, `--text-h1`, `--text-h2`,
`--text-h3`.

## Boutons

**Un seul composant** : `src/components/ui/Button.tsx` — `Button`, `IconButton`,
`Arrow`. Il n'existe pas d'autre façon d'écrire un bouton (voir ADR-040 §
Amendement : trois systèmes coexistaient, dont un doublon de flèche).

- **Angles nets.** Pas de pilule : le dessin s'accorde aux filets et aux cadres.
- **48 px de hauteur minimale**, partout. Sous 44 px, un bouton se rate au doigt.
- Variantes par le fond qu'elles habitent : `accent` / `outline` / `ghost` sur
  clair, `lumiere` / `contour-clair` sur nuit. Un bouton qui doit deviner sa
  teinte selon la page est un bouton qu'on oublie d'accorder.
- Effet magnétique sur les boutons actifs seulement — suivre le curseur sur un
  bouton désactivé promettrait une action qui n'aura pas lieu.

## Mouvement

Quatre moments, pas un de plus (ADR-040). Courbe unique :
`--ease-out-expo` = `cubic-bezier(0.16, 1, 0.3, 1)`.

1. **Ouverture** d'une page produit — dézoom de l'image + montée décalée.
2. **Entrées au défilement** — composant `Reveal`, dont l'état masqué vit en CSS
   sous `.js-motion` : le HTML servi reste visible, donc indexable.
3. **Chiffres** — incrémentés une fois à l'entrée dans le cadre.
4. **Barre d'action mobile** — révélée après le hero.

⚠ **Jamais de `<h1>` ou `<h2>` sous un bloc animé en JS.** Un titre en
`opacity: 0` sérialisé n'est pas indexé (leçon du 2026-08-19).

Tout est respecté sous `prefers-reduced-motion`.

## En-tête et pied de page

**Ils ne changent pas selon le registre**, et c'est volontaire :

- la barre porte un **fond clair permanent** (`bg-canvas/80` + flou) depuis le
  2026-08-20 — elle avait été corrigée pour survivre aux heros sombres ;
- le pied de page est **déjà sombre** (`bg-ink`) : une page nuit s'y fond, une
  page claire y trouve sa clôture.

C'est ce qui permet à un site à deux registres de rester un seul site.

## Ce qui reste hors charte

Le **back-office** garde son identité propre (violet `#7469F4`). C'est un outil
interne, pas une surface de marque : lui imposer la charte publique n'aurait
d'autre effet que de rendre deux mondes confusément semblables.

Les **pages légales** suivent le registre clair mais restent hors du contrôle de
vocabulaire (ADR-029 §17.10).
