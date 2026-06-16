# ADR-007 — Supabase `ahfhownerdb` : schémas `reservations` / `waitlist` / `leads` + RLS

- **Statut** : Proposé
- **Date** : 2026-06-16
- **Phase** : 4
- **Faisabilité** : ✅ Élevée
- **Alerte Albert** : Non

## Contexte
La persistance (slots de réservation, liste d'attente, leads terrain) repose sur Supabase. Le projet **`ahfhownerdb`** (ref `msrjocrcewvqkcehruny`, eu-west-1, ACTIVE_HEALTHY) existe et le MCP est branché en **read-only**. Aucune table créée à ce jour.

## Décision
Créer les schémas (migrations versionnées) :
- **`reservations`** : `slot` (1..12, unique), `status`, `email`, `config_json`, `stripe_session_id`, `created_at`, `updated_at`. Contrainte unique sur `slot` (anti-double-booking).
- **`waitlist`** : `email`, `created_at` (append-only).
- **`leads`** : `email`, `tel`, `analysis_json`, `created_at`.
- **RLS obligatoire** sur les 3 tables. Lecture publique limitée (count slots pris) ; écritures via service-role côté serveur uniquement.

## Faisabilité
- **Verdict** : ✅ Élevée — infra prête, schéma simple.
- **Dépendances externes** : Supabase (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`). MCP à repasser en écriture pour appliquer les migrations (aujourd'hui `--read-only`).
- **Risques** : exposition leads/reservations si RLS mal posée → ne jamais exposer côté client (cf. ADR-003).

## Conséquences
Socle de ADR-008 (Stripe), ADR-009 (Realtime jauge), ADR-010 (waitlist), ADR-013 (leads). Migrations dans `supabase/migrations/`.

## Sources
`PASSATION_RICHARD.md` §3 (Supabase slots/waitlist/jauge), session config MCP Supabase (`ahfhownerdb`).
