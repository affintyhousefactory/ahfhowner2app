# ADR-013 — Contact terrain → table `leads`

- **Statut** : Proposé
- **Date** : 2026-06-16
- **Phase** : 4
- **Faisabilité** : ✅ Élevée
- **Alerte Albert** : Non

## Contexte
Le formulaire de contact terrain (`LandTool.tsx`, ≈ L392) fait `setSent(true)` sans persistance. Le PASSATION demande un lead Supabase (table `leads` : email/tel + résultat d'analyse).

## Décision
À la soumission : `INSERT INTO leads (email, tel, analysis_json, created_at)` via route serveur. `analysis_json` = snapshot du formulaire + sortie d'analyse terrain (zone, « feu », distance, etc.).

## Faisabilité
- **Verdict** : ✅ Élevée — insert simple, données déjà disponibles côté client.
- **Dépendances externes** : Supabase (ADR-007).
- **Risques** : RGPD (email/tel) → consentement + RLS ; ne jamais exposer `leads` côté client.

## Conséquences
Dépend d'ADR-007. Le contenu d'`analysis_json` s'enrichit quand ADR-011/012 livrent le zonage réel.

## Sources
`PASSATION_RICHARD.md` §LandTool (contact → lead Supabase), `src/components/site/LandTool.tsx`.
