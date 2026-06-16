# ADR-008 — Acompte via Stripe Checkout + webhook

- **Statut** : Proposé
- **Date** : 2026-06-16
- **Phase** : 4
- **Faisabilité** : 🟠 Moyenne
- **Alerte Albert** : Non (mais dépend du verdict légal ADR-015)

## Contexte
La réservation d'un numéro ARKO s'accompagne d'un acompte (1 500 € via `NEXT_PUBLIC_RESERVATION_DEPOSIT_EUR`). Aujourd'hui `Reservation.tsx` `submit()` fait `setSent(true)` — aucun paiement réel.

## Décision
- Route `POST /api/checkout` : crée une session Stripe Checkout. Metadata = `slot`, `email`, snapshot config (lu depuis `config-store`, **sans modifier le store** — cf. ADR-005).
- Vérifier le slot libre **avant** création de session (lecture `reservations`).
- Route `POST /api/stripe/webhook` : sur `checkout.session.completed` → marquer le slot `reserved` (Supabase) + déclencher email de confirmation (ADR-014).
- Écran de confirmation branché au retour `success_url`.

## Faisabilité
- **Verdict** : 🟠 Moyenne — flux Stripe standard mais plusieurs maillons (webhook, anti-double-booking, email).
- **Dépendances externes** : Stripe (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`), Supabase (ADR-007), service email (ADR-014).
- **Risques** : double-booking (mitigé par contrainte unique `slot` + check serveur) ; **conditions de remboursement de l'acompte non tranchées juridiquement (ADR-015)**.

## Conséquences
Dépend de ADR-007 (table reservations) et ADR-014 (email). Bloqué commercialement tant qu'ADR-015 (acompte vs arrhes) n'est pas validé.

## Sources
`PASSATION_RICHARD.md` §Réservation/acompte, `src/components/site/Reservation.tsx`, `config-store.tsx`.
