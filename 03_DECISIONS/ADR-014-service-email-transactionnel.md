# ADR-014 — Service email transactionnel (confirmations)

- **Statut** : Proposé — **ouvert**
- **Date** : 2026-06-16
- **Phase** : 4
- **Faisabilité** : ❓ Ouvert (fournisseur indécis)
- **Alerte Albert** : Non (décision technique, à arbitrer)

## Contexte
Le flux de paiement (ADR-008) doit envoyer un email de confirmation après `checkout.session.completed`. Aucun fournisseur d'envoi n'est choisi dans le PASSATION (question ouverte).

## Décision
**À trancher** : choisir un fournisseur email transactionnel (candidats : Resend, Mailgun, SendGrid). Intégration côté serveur uniquement (clé secrète). Template confirmation de réservation (numéro de slot, montant acompte, prochaines étapes).

## Faisabilité
- **Verdict** : ❓ Ouvert — bloque le flux de confirmation Stripe tant que non choisi.
- **Dépendances externes** : fournisseur retenu + sa clé API (secret serveur).
- **Risques** : délivrabilité, configuration domaine (SPF/DKIM sur `affinityhousefactory.com`).

## Conséquences
**Bloque la complétion d'ADR-008**. À arbitrer rapidement (décision légère). Recommandation par défaut : Resend (DX simple, intégration Next).

## Sources
`PASSATION_RICHARD.md` (Open question : service email confirmations), ADR-008.
