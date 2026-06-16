# ADR-002 — Charte visuelle = Affinity (remap des tokens `@theme`)

- **Statut** : Accepté — **à valider par Albert**
- **Date** : 2026-06-16
- **Phase** : 1
- **Faisabilité** : ⚠️ Technique OK / gouvernance à valider
- **Alerte Albert** : **Oui — contredit le verrou design du PASSATION**

## Contexte
Le `PASSATION_RICHARD.md` verrouille explicitement le design system **« Argile & Encre »** (palette chaude crème `#f4f1ea` + accent vert `#1f5a3c`, police display Space Grotesk), avec consigne *« aucun changement couleur ou police »*. Le 2026-06-16, à la demande de l'utilisateur, la charte de `https://www.affinityhome.io/` a été extraite (`DESIGN.md`) et **appliquée** par remap du bloc `@theme` de `src/app/globals.css` : palette **froide** (canvas `#f6f7f9`, ink charcoal `#0d141a`, accent slate-blue `#3a5a86`).

## Décision
Adopter la charte Affinity comme nouvelle identité visuelle du site ARKO. La bascule est faite côté tokens (réversible : table de mapping dans `DESIGN.md`). Les polices restent inchangées (Space Grotesk display conservé) — passage tout-Inter non réalisé.

## Faisabilité
- **Verdict** : ⚠️ Techniquement appliqué et vérifié live (contraste AA préservé). **Mais en conflit de gouvernance** avec une directive ferme du PASSATION.
- **Dépendances externes** : aucune.
- **Risques** : direction artistique froide vs imagerie ARKO chaude (bois/forêt) ; surtout, **non validé par Albert** alors que le PASSATION fige la palette chaude.

## Conséquences
Tant qu'Albert n'a pas tranché, cette charte est **réputée provisoire**. Revert possible en un edit (table `DESIGN.md`). À remonter en alerte AHF_CORE (changement de positionnement visuel).

## Sources
`PASSATION_RICHARD.md` (Design system locked), `DESIGN.md`, `src/app/globals.css` (`@theme`).
