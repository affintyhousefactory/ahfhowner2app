# ADR-008 — Réservation et paiement acompte

- **Statut** : Différé (paiement hors-ligne — 2026-06-27)
- **Date** : 2026-06-16
- **Amendé** : 2026-06-27
- **Phase** : 4+
- **Faisabilité** : ⚪ Non prioritaire
- **Alerte Albert** : Non

## Contexte
La réservation d'un numéro ARKO s'accompagne d'un acompte (1 500 €). Aujourd'hui `Reservation.tsx` `submit()` fait `setSent(true)` — aucun paiement réel. Le tunnel de qualification a évolué : le client contacte d'abord par configurateur ou formulaire de contact, puis AHF qualifie le lead avant tout encaissement. Stripe n'est donc pas nécessaire dans le MVP.

## Décision (amendée 2026-06-27)
**Paiement hors-ligne** : la réservation reste une prise de contact (formulaire → lead Supabase → relance manuelle AHF). L'encaissement de l'acompte intervient après qualification du client, hors site (virement ou autre moyen convenu). **Stripe est retiré du périmètre MVP.**

Décision précédente (archivée) : Route `POST /api/checkout` Stripe Checkout + webhook → marquage slot `reserved` + email de confirmation. Suspendue — conditions de remboursement non tranchées (ADR-015) et tunnel de vente revu.

## Faisabilité
- **Verdict** : ⚪ Non prioritaire — paiement en ligne à réévaluer si le volume de leads le justifie.
- **Dépendances supprimées** : Stripe (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`) — variables non à configurer en Vercel.
- **ADR-015** (légal acompte/arrhes) reste bloqué mais ne bloque plus le lancement du formulaire de contact.

## Conséquences
- `Reservation.tsx` reste sur `setSent(true)` (lead Supabase) — aucune modification à prévoir.
- Variables Stripe retirées des sections env de `PROJECT_STATE.md`.
- ADR-016 (échéancier) reste Différé, inchangé.

## Sources
`PASSATION_RICHARD.md` §Réservation/acompte, `src/components/site/Reservation.tsx`, `config-store.tsx`.
