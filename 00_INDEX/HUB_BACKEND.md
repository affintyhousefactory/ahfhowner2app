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

## Décisions liées
| ADR | Sujet | Statut | Faisabilité |
|---|---|---|---|
| 007 | Supabase schémas + RLS (`ahfhownerdb`) | Proposé | ✅ |
| 008 | Acompte Stripe + webhook | Proposé | 🟠 |
| 009 | Jauge/slots Realtime | Proposé | 🟠 |
| 010 | Waitlist insert | Proposé | ✅ |
| 011 | LandTool zonage GPU/IGN | Proposé | 🟠 |
| 012 | LandTool annonce Apify | Proposé | 🟠 |
| 013 | Contact terrain → leads | Proposé | ✅ |
| 014 | Service email transactionnel | Proposé — ouvert | ❓ |
| 017 | Enrichissement terrain Anthropic | Différé (option) | ⚪ |

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
