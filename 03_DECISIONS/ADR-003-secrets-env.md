# ADR-003 — Secrets & montants via variables d'environnement, jamais dans Git

- **Statut** : Accepté (partiel)
- **Date** : 2026-06-16
- **Phase** : 1+
- **Faisabilité** : ✅ En place ; reste `.env.example`
- **Alerte Albert** : Non

## Contexte
Aucun montant ni secret ne doit être codé en dur. `site.ts` lit déjà les montants depuis l'environnement (`NEXT_PUBLIC_RESERVATION_DEPOSIT_EUR`, `NEXT_PUBLIC_ARKO_BASE_EUR`, tarifs livraison) avec fallback constant. Les clés Phase 4 (Supabase, Stripe, Apify) ne sont pas encore configurées.

## Décision
- Montants commerciaux → `NEXT_PUBLIC_*` (client), lus via env avec fallback.
- Clés serveur (`SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `APIFY_TOKEN`, `ANTHROPIC_API_KEY`) → secrets serveur, **jamais commités**, jamais exposés client.
- Fournir un `.env.example` (placeholders uniquement).

## Faisabilité
- **Verdict** : ✅ Pattern déjà appliqué dans `site.ts`. Manque le `.env.example` documenté.
- **Dépendances externes** : aucune.
- **Risques** : confusion clé publique vs service-role (cf. ADR-007 RLS).

## Conséquences
`.gitignore` doit couvrir `.env.local`. Toute nouvelle intégration ajoute sa variable au `.env.example`.

## Sources
`src/lib/site.ts`, `PASSATION_RICHARD.md` (variables d'environnement Phase 4).
