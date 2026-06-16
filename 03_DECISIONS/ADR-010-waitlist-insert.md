# ADR-010 — Waitlist insert Supabase

- **Statut** : Proposé
- **Date** : 2026-06-16
- **Phase** : 4
- **Faisabilité** : ✅ Élevée
- **Alerte Albert** : Non

## Contexte
Le composant `<Waitlist/>` (dans `Reservation.tsx`) fait `setSent(true)` sans persistance. Les 12 exemplaires épuisés, les intéressés doivent pouvoir laisser leur email.

## Décision
`INSERT INTO waitlist (email, created_at)` via une route serveur (ou Server Action simple) à la soumission du formulaire d'attente. Validation email côté serveur.

## Faisabilité
- **Verdict** : ✅ Élevée — table append-only triviale.
- **Dépendances externes** : Supabase (ADR-007).
- **Risques** : spam → validation + éventuel rate-limit.

## Conséquences
Dépend de ADR-007 (table waitlist). Indépendant de Stripe.

## Sources
`PASSATION_RICHARD.md` §3 (liste d'attente), `src/components/site/Reservation.tsx`.
