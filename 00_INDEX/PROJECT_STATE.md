# PROJECT_STATE — Howner / ARKO

> **Source de vérité canonique** de l'état projet (ADR-019). Lu à la reprise (`/resume`, `/memory-sync`).
> Mettre à jour la section « Dernier point » en fin de session. Ne pas dupliquer cet état ailleurs.

## Résumé exécutif
Site **mono-produit** de réservation **ARKO** (série limitée 12 exemplaires). **Front complet et validé** (Lighthouse 100/100/100/100, LCP 0.8s, CLS 0). **Backend (Phase 4) non démarré**. **Lancement commercial bloqué par le légal.** Sources de vérité : `src/lib/site.ts` (marque/pricing), `DESIGN.md` (charte), `03_DECISIONS/` (ADR).

## État actuel
- Phase 1 (front) livrée et validée. Phase 1.5 (SEO) auditée non implémentée. Phase 4 (backend) non démarrée. Légal bloqué.
- Charte **Affinity** appliquée le 2026-06-16 (ADR-002) — **à valider par Albert** (contredit le verrou « Argile & Encre » du PASSATION).
- MCP configurés : `github` (remote officiel), `supabase` (`ahfhownerdb`, read-only), `vercel` (OAuth). CLI Higgsfield + skills installés.

## Stack décidée

| Couche | Technologie | ADR |
|---|---|---|
| Framework | Next.js 16.2.9 App Router (Turbopack), React 19, TS | 001 |
| UI | Tailwind v4 (`@theme`), gsap, lenis, framer-motion | 001 |
| 3D | three / r3f / drei — **`/viewer` only** | 006 |
| Charte | Affinity (remap `@theme`) — `DESIGN.md` | 002 |
| Data (Phase 4) | Supabase `ahfhownerdb` (ref `msrjocrcewvqkcehruny`) | 007 |
| Paiement (Phase 4) | Stripe Checkout + webhook | 008 |
| Hébergement | Vercel | — |

## Produit
**ARKO** — maison compacte d'architecte 40 m², série 01, 12 exemplaires numérotés. Devis 3 couches (maison + livraison + frais terrain) — `Configurator.tsx` **verrouillé** (ADR-005). Réservation d'un numéro avec acompte 1 500 €. Pas de multi-segment, pas de catalogue.

## Phases & backlog

| Phase | Périmètre | État | ADR |
|---|---|---|---|
| Phase 1 — Front | design, conversion, média, perf | ✅ Livré | 001,005,006 |
| Phase 1.5 — SEO | sitemap/robots/OG/JSON-LD | ⏳ Audité, non implémenté | 018 |
| Phase 4 — Backend | Stripe, Supabase, terrain, leads | ⛔ Non démarré | 007→013 |
| Pré-lancement — Légal | acompte/arrhes, CGV | ⛔ Bloqué (avocat) | 015 |

## Carte feature → fichier → état → cible

| Feature | Fichier | État | Cible | ADR |
|---|---|---|---|---|
| Réservation + acompte | `Reservation.tsx` `submit()` | `setSent(true)` | Stripe Checkout + webhook | 008 |
| Slots / jauge | `Reservation.tsx`, `Gauge.tsx` | statique 4/12 | Supabase Realtime | 007,009 |
| Liste d'attente | `Reservation.tsx` `<Waitlist/>` | `setSent(true)` | insert Supabase | 010 |
| Analyse terrain (zonage) | `LandTool.tsx` | BAN réel + zonage heuristique | GPU/IGN réel | 011 |
| Analyse via lien d'annonce | `LandTool.tsx` mode `annonce` | dégradé | Apify + BAN | 012 |
| Contact terrain | `LandTool.tsx` (~L392) | `setSent(true)` | lead Supabase | 013 |
| Devis 3 couches | `Configurator.tsx`, `config-store.tsx` | ✅ juste — **ne pas toucher** | — | 005 |
| Email confirmations | — | absent | fournisseur à choisir | 014 |
| SEO | `layout.tsx` + fichiers absents | métadonnées de base | socle complet | 018 |

## Risques principaux

| Risque | Impact | Gravité | ADR |
|---|---|---|---|
| Légal acompte/arrhes + CGV non validés | Pas de vente | 🔴 Critique | 015 |
| RLS Supabase mal configurée | Fuite leads/réservations | 🔴 Critique | 007 |
| Service email non choisi | Bloque confirmation Stripe | 🟠 Haute | 014 |
| Charte Affinity non validée Albert | Dérive identité vs PASSATION | 🟠 Moyenne | 002 |
| API terrain externes (GPU/IGN/Apify) | Feature dégradée | 🟠 Moyenne | 011,012 |

## Variables d'environnement manquantes (Phase 4)

```
NEXT_PUBLIC_SUPABASE_URL=          # client
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # client
SUPABASE_SERVICE_ROLE_KEY=         # serveur, jamais commité
STRIPE_SECRET_KEY=                 # serveur
STRIPE_WEBHOOK_SECRET=             # serveur
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY= # client
APIFY_TOKEN=                       # serveur (mode annonce)
ANTHROPIC_API_KEY=                 # serveur, optionnel (ADR-017)
```
Montants déjà en env (`NEXT_PUBLIC_RESERVATION_DEPOSIT_EUR`, `NEXT_PUBLIC_ARKO_BASE_EUR`, tarifs livraison) — ADR-003.

## Index ADR (`03_DECISIONS/`)

| ADR | Titre | Statut | Faisabilité |
|---|---|---|---|
| 001 | Stack Next.js 16 App Router | Accepté (livré) | ✅ |
| 002 | Charte Affinity (`@theme`) | **Accepté — valider Albert** | ⚠️ |
| 003 | Secrets & montants via env | Accepté (partiel) | ✅ |
| 004 | Règles de marque absolues | Accepté | ✅ |
| 005 | Configurator/pricing verrouillé | Accepté (guardrail) | ✅ |
| 006 | Guardrails perf & média | Accepté (guardrail) | ✅ |
| 007 | Supabase schémas + RLS | Proposé | ✅ |
| 008 | Acompte Stripe + webhook | Proposé | 🟠 |
| 009 | Jauge/slots Realtime | Proposé | 🟠 |
| 010 | Waitlist insert | Proposé | ✅ |
| 011 | LandTool zonage GPU/IGN | Proposé | 🟠 |
| 012 | LandTool annonce Apify | Proposé | 🟠 |
| 013 | Contact terrain → leads | Proposé | ✅ |
| 014 | Service email transactionnel | **Proposé — ouvert** | ❓ |
| 015 | Légal acompte/arrhes/CGV | **Bloqué (avocat)** | 🔴 |
| 016 | Échéancier 10/30/40/20 % | Différé | 🟠 |
| 017 | Enrichissement terrain Anthropic | Différé (option) | ⚪ |
| 018 | Socle SEO | Proposé | ✅ |
| 019 | Gouvernance cognitive INDEX/HUB/_RUNTIME | Accepté | ✅ |

## Prochaines priorités (actionnable sans blocage externe)
1. **ADR-018** — SEO P0 (confirmer domaine `howner.fr` d'abord).
2. **ADR-007** — Supabase schémas + RLS (repasser MCP en écriture) → débloque 009/010/013.
3. **ADR-014** — choisir le fournisseur email → débloque ADR-008.

## Tokens / MCP
Rotation tokens GitHub + Supabase **différée** → `memory/token-rotation-pending.md`.

## Dernier point
**2026-06-16** — Gouvernance ADR (19 ADR), structure cognitive INDEX/HUB/_RUNTIME consolidée (purge contamination AHF_WEB2), `00_INDEX/PROJECT_STATE.md` canonique. Charte Affinity appliquée (ADR-002, à valider Albert). Aucun code applicatif modifié.
