# DESIGN — Charte graphique Affinity (référence + appliquée)

> Extraite de https://www.affinityhome.io/ le 2026-06-15. Source de vérité visuelle.
> Appliquée au site ARKO le 2026-06-15 via remap des tokens `@theme` dans `src/app/globals.css` (réversible).

## Esthétique
Luxe minimal, éditorial, contemporain. Blanc dominant, beaucoup de respiration, photographie d'architecture en vedette. Radius subtil (pas ludique), ombres douces, UI retenue, sentence case.

## Palette

| Rôle | Hex | Notes |
|---|---|---|
| Ink / charcoal | `#0D141A` | texte & titres (variantes plateforme `#1D1E20`, `#18181A`) |
| Light / base | `#FFFFFF` | fond dominant |
| Off-white froid | `#F2F3F6` | sections alternées |
| Accent slate-blue | `#4A6FA5` | accent de marque (bespoke, relevé inline) |
| Accent AA-safe | `#3A5A86` | version foncée pour CTA (texte blanc ≥ 4.5:1) |
| Azure | `#357DF9` | bleu vif secondaire (lien / highlight) |
| Gris | `#727586` | texte secondaire |
| Bordure | `#DADCE0` | filets, séparateurs |

## Typographie
- **Inter** — corps ET titres (sans-serif géométrique, minimal). Variables source : `--font-primary` / `--font-secondary`.
- DM Sans présent en secondaire ponctuel.
- Tracking généreux sur labels, sentence case majoritaire, hiérarchie par taille nette.

## UI
- Border-radius : léger.
- Boutons : retenus, ombre douce, fond plein accent + texte blanc.
- Inputs : bordure fine, sans surcharge.
- Layout : grille modulaire, whitespace généreux, cartes pour les offres, asymétrie équilibrée.
- Imagerie : photo d'architecture/intérieur haut de gamme, lumière naturelle.

## Application à ARKO (mapping tokens)
Remplace la palette chaude « Argile & Encre ». Voir `src/app/globals.css` bloc `@theme`.
Polices ARKO conservées (Space Grotesk display) — passage tout-Inter optionnel, non encore fait.

| Token ARKO | Avant (chaud) | Après (Affinity) |
|---|---|---|
| `--color-canvas` | `#f4f1ea` | `#f6f7f9` |
| `--color-surface` | `#ffffff` | `#ffffff` |
| `--color-paper` | `#fbfaf6` | `#fbfcfd` |
| `--color-ink` | `#1a1714` | `#0d141a` |
| `--color-muted` | `#6e695e` | `#727586` |
| `--color-line` | `#e4ddd0` | `#dadce0` |
| `--color-accent` | `#1f5a3c` (vert) | `#3a5a86` (slate-blue AA) |
| `--color-accent-ink` | `#174630` | `#2c466b` |
| `--color-blue` | `#1659f0` | `#357df9` |
