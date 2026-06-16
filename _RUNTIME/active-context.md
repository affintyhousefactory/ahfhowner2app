# ACTIVE CONTEXT — Howner / ARKO

## Contexte actif
Site mono-produit de réservation **ARKO** (12 exemplaires). Front livré ; backend Phase 4 en attente ; lancement bloqué par le légal.

## Priorités actives
1. SEO P0 (ADR-018) — sans dépendance hors confirmation domaine.
2. Débloquer Phase 4 : Supabase schémas (ADR-007), choix email (ADR-014).
3. Faire valider par Albert : charte Affinity (ADR-002) + légal (ADR-015).

## Contraintes
- Ne pas mélanger les projets (ce projet ≠ AHF_WEB2 : pas de segments/Brevo/Smart Nano-Max/Villa Arko).
- Ne pas dupliquer l'état hors `00_INDEX/PROJECT_STATE.md`.
- `_RUNTIME` reste court, jamais un backlog permanent.
- Guardrails : ne pas toucher `Configurator.tsx`/`config-store.tsx` (ADR-005) ; vidéos `useVisible` sauf Hero, 3D isolé `/viewer` (ADR-006).
- Marque (ADR-004) : termes interdits, « notre architecte intégrée », « Puigbo ».
- Secrets jamais dans Git (ADR-003).
