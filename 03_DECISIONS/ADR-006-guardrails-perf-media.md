# ADR-006 — Guardrails performance & média

- **Statut** : Accepté (guardrail)
- **Date** : 2026-06-16
- **Phase** : 1
- **Faisabilité** : ✅ Guardrail
- **Alerte Albert** : Non

## Contexte
Le front atteint Lighthouse 100/100/100/100 (desktop), LCP 0.8s, CLS 0. Cette performance repose sur des règles précises de chargement média et d'isolation du bundle 3D.

## Décision
- **Vidéos** : chargées via le hook `useVisible` (init `false`) — pas d'auto-load. **Exception unique** : la vidéo du Hero (chargement direct autorisé).
- **Bundle 3D** (`src/components/arko3d/*`) : importé **uniquement** sur la route `/viewer` ou pour la génération média hors-ligne — **jamais** dans le flux principal (Reservation/Configurator/LandTool).
- **Cibles perf** : ne pas régresser (Lighthouse 100, LCP < 0.8s).

## Faisabilité
- **Verdict** : ✅ Guardrail — à respecter sur toute modif de composant média/3D.
- **Dépendances externes** : aucune.
- **Risques** : auto-load vidéo → LCP 0.8s → 1.6s ; import 3D dans le flux principal → bloat bundle → perte des cibles.

## Conséquences
Toute nouvelle vidéo passe par `useVisible`. Toute feature 3D reste cantonnée à `/viewer`. Vérifier Lighthouse après changement média.

## Sources
`PASSATION_RICHARD.md` (guardrails perf), `src/components/arko3d/useVisible.ts`.
