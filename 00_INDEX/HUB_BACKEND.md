# HUB_BACKEND — Howner / ARKO

## Rôle du HUB
Point d'entrée pour : Phase 4 — Supabase, Stripe, outil terrain, leads, email.

## À lire en priorité
1. `00_INDEX/PROJECT_STATE.md` — carte feature → fichier → cible + env manquantes.
2. ADR-007 (Supabase), ADR-008 (Stripe).
3. `PASSATION_RICHARD.md` — spécifications backend d'Albert.

## Documents clés
| Document | Contenu |
|---|---|
| `03_DECISIONS/ADR-007..014,017` | Décisions Phase 4 |
| `src/components/site/Reservation.tsx` | Réservation/acompte/waitlist (à brancher) |
| `src/components/site/LandTool.tsx` | Terrain : BAN réel, zonage à brancher |
| `src/lib/crm.ts` | **Référentiels CRM** — 9 statuts, 5 cibles commerciales (+ codes NAF), conseillers. Jamais redéclarés dans un écran |
| `src/shared/lib/recap-client.ts` | **Source unique** des paramètres du récapitulatif client — sert l'aperçu ET l'envoi |
| `src/shared/lib/brevo-render.ts` | Rendu local d'un template Brevo (aperçu seulement, jamais l'envoi) |
| `src/shared/lib/email.ts` | Brevo : envoi de template, ajout de contact, DOI (⚠ `addBrevoContactDOI` non appelé) |

## Décisions liées
| ADR | Sujet | Statut | Faisabilité |
|---|---|---|---|
| 026 | **Emails Brevo** — templates dashboard, contacts, listes | **Livré** ; amendé 2026-08-26 : Prospects = CRM / Newsletter = consentement ; ⚠ DOI non câblé | ✅ |
| 035 | **CRM interne** — leads, Kanban, journal d'appels, récapitulatif client | **En production** ; amendé 2026-08-27 : cible commerciale, statut de rebut, transport auto, relecture du récap | ✅ |
| 007 | Supabase schémas + RLS (`ahfhownerdb`) | Proposé | ✅ |
| 008 | Acompte Stripe + webhook | Proposé | 🟠 |
| 009 | Jauge/slots Realtime | Proposé | 🟠 |
| 010 | Waitlist insert | Proposé | ✅ |
| 011 | LandTool zonage GPU/IGN | Proposé | 🟠 |
| 012 | LandTool annonce Apify | Proposé | 🟠 |
| 013 | Contact terrain → leads | Proposé | ✅ |
| 014 | Service email transactionnel | Proposé — ouvert | ❓ |
| 017 | Enrichissement terrain Anthropic | Différé (option) | ⚪ |
| 027 | Fiche lead admin — terrain, affectation géo, GED double | Accepté — livré | ✅ |
| **035** | **Refonte du CRM interne** — suivi, journal d'appels, capture configurateur v2, GED double origine | **Accepté — livré sur branche** | ✅ |

> ADR-035 définit le **contrat de données** que la soumission du configurateur v2 (ADR-031) devra remplir : `config_v2` + colonnes `cfg_*` + `slot`. Migration `20260804_crm_leads.sql`, additive, **non appliquée**.

## Env requis (Phase 4)
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `APIFY_TOKEN`, `ANTHROPIC_API_KEY` (option). Jamais commités.

## Risques
| Risque | Gravité |
|---|---|
| RLS mal configurée → fuite leads/réservations | Critique |
| Double-booking slot | Haute (contrainte unique) |
| Service email non choisi | Haute (bloque confirmation) |

## Questions ouvertes
Fournisseur email (ADR-014). Repasser le MCP Supabase en écriture pour migrations (ADR-007).
