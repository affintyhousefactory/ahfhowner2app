# PROJECT_STATE — Howner / ARKO

> **Source de vérité canonique** de l'état projet (ADR-019). Lu à la reprise (`/resume`, `/memory-sync`).
> Mettre à jour la section « Dernier point » en fin de session. Ne pas dupliquer cet état ailleurs.

## Résumé exécutif
Site **mono-produit** de réservation **ARKO** (série limitée 12 exemplaires). **Front complet et validé** (Lighthouse 100/100/100/100, LCP 0.8s, CLS 0). **Backend (Phase 4) non démarré**. **Lancement commercial bloqué par le légal.** Sources de vérité : `src/lib/site.ts` (marque/pricing), `DESIGN.md` (charte), `03_DECISIONS/` (ADR).

## État actuel
- Phase 1 (front) livrée et validée. **Refonte multi-pages bi-produit** (Arko One + Arko Max) livrée le 2026-06-16 (ADR-020/021/022). Phase 1.5 (SEO) métadonnées par page posées, reste sitemap/robots/JSON-LD. Phase 4 (backend) non démarrée. Légal bloqué.
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
| Hébergement | Vercel | 023 |

## Produit
**Bi-produit** (ADR-022) — registre `PRODUCTS` (`src/lib/site.ts`) :
- **Arko One** — 20 m², 12 exemplaires, 59 900 € (grille provisoire `TODO ARKO ONE`).
- **Arko Max** — 40 m² (= ARKO historique), 5 exemplaires, 89 900 €.

Devis 3 couches (maison + livraison + frais terrain), **logique verrouillée** (ADR-005/020), montants par produit. Configurateur avec sélecteur One/Max (`/configurer?produit=`). Réservation d'un numéro avec acompte 1 500 €. Pas de multi-segment, pas de catalogue. Wordmark ARKO retiré de l'accueil ; noms produits conservés.

## Phases & backlog

| Phase | Périmètre | État | ADR |
|---|---|---|---|
| Phase 1 — Front | design, conversion, média, perf | ✅ Livré | 001,005,006 |
| Phase 1.5 — SEO | sitemap/robots/OG/JSON-LD | 🟡 P0 livré (2026-06-17) ; P1 (JSON-LD) + P2 restants | 018 |
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
| Devis 3 couches multi-produit | `Configurator.tsx`, `config-store.tsx` | ✅ logique verrouillée, paramétrée par produit | — | 005,020 |
| Email confirmations | — | absent | fournisseur à choisir | 014 |
| SEO | `layout.tsx`, `sitemap.ts`, `robots.ts`, `opengraph-image.tsx`, `viewer/layout.tsx` | ✅ P0 (sitemap/robots/OG/twitter/canonical/noindex viewer) | + P1 JSON-LD, P2 polish | 018 |

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
| 018 | Socle SEO | **Accepté — P0 livré** | ✅ |
| 019 | Gouvernance cognitive INDEX/HUB/_RUNTIME | Accepté | ✅ |
| 020 | Configurateur multi-produit (amende 005) | Accepté | ✅ |
| 021 | Architecture multi-pages + nav Tesla | Accepté | ✅ |
| 022 | Split produit One/Max + repositionnement | **Accepté — valider Albert** | 🟠 |
| 023 | Déploiement production Vercel | Proposé | ✅ |

## Prochaines priorités (actionnable sans blocage externe)
1. **ADR-018 — SEO** : **P0 livré** (2026-06-17) — `robots.txt`, `sitemap.xml`, OG image 1200×630, twitter card, canonical par page, `/viewer` noindex. Domaine confirmé `affinityhome.fr` (`SITE_URL`). **Reste P1** : JSON-LD (Organization / Product+Offer / FAQPage), `llms.txt` ; **P2** : manifest/PWA, skip-link, trim fonts.
2. **ADR-007** — Supabase schémas + RLS (repasser MCP en écriture) → débloque 009/010/013.
3. **ADR-014** — choisir le fournisseur email → débloque ADR-008.

## Tokens / MCP
Rotation tokens GitHub + Supabase **différée** → `memory/token-rotation-pending.md`.

## Dernier point
**2026-06-17 (ADR-018 — SEO P0 livré)** — Socle SEO P0 implémenté et **vérifié au build** (`next build` vert, 16 routes statiques). Nouveaux fichiers : `src/app/sitemap.ts` (6 routes indexables, légal + `/viewer` exclus), `src/app/robots.ts` (`disallow /viewer` + host + sitemap), `src/app/opengraph-image.tsx` (généré `next/og`, 1200×630, tokens charte), `src/app/viewer/layout.tsx` (`noindex,nofollow`). `layout.tsx` : `metadataBase` recâblé + twitter card + canonical `/`. Canonical self-référent ajouté sur toutes les pages (légal inclus). **Domaine de prod confirmé = `affinityhome.fr`** (ex-`howner.fr`), centralisé dans `SITE_URL` (`src/lib/site.ts`, override `NEXT_PUBLIC_SITE_URL`). Incident env corrigé : binaire natif `lightningcss` manquant (WSL) → `npm install lightningcss-linux-x64-gnu`. **Reste** : P1 JSON-LD (Organization/Product+Offer/FAQPage) + `llms.txt`, P2 polish. ADR-018 → « Accepté — P0 livré ».

**2026-06-17 (ingestion `claude-knowledge` + audit projet)** — Base de connaissances officielle ingérée dans `~/.claude/rules/` (14 thèmes, 119 fichiers : `claude-code`, `components`, `design`, `discovery`, `landing`, `landing-sections`, `mcp`, `modules`, `notion`, `saas`, `spa`, `supabase`, `vercel`, `workflow`). `~/.claude/CLAUDE.md` remplacé par celui du repo (charge les règles via `@import`). Audit projet contre les règles : **`PROFIL.md` créé** à la racine (convention `rules/discovery/profil-md-convention.md`) + câblé en tête de `CLAUDE.md` projet. **ADR-001 amendé** : dérogation actée (la règle landing impose Astro, Howner reste Next.js car livré). **Dette SEO confirmée** comme priorité 1 (ADR-018). Aucun code applicatif modifié.

**2026-06-16 (refonte multi-pages bi-produit)** — Site passé en **multi-pages** (App Router) : `/`, `/arko-one`, `/arko-max`, `/configurer`, `/terrain`, `/contact`, `/cgv`, `/mentions-legales`, `/confidentialite`. **Bi-produit** Arko One (20 m², 12 ex, 59 900 €) + Arko Max (40 m², **5 ex**, 89 900 €) via registre `PRODUCTS` (`src/lib/site.ts`). **Nav type Tesla** (méga-menu Produits, compteur 12+5). Configurateur **multi-produit** (sélecteur One/Max, devis qui suit la base — ADR-020, amende 005). Wordmark ARKO retiré de l'accueil (baseline « Une maison compacte faite pour vous », « Fabriqué au Pays-Basque »). Pages légales = placeholders (bloqué ADR-015). ADR-020/021/022 créés. `tsc` propre, 10 routes en 200, console clean. **À fournir** : grille Arko One (perM2/options/dimensions), `reserved` par produit, asset vidéo Arko One (fallback provisoire = footage Max). **3 alertes Albert** : repositionnement bi-produit, déverrouillage configurateur, retrait wordmark ARKO. Charte Affinity (ADR-002) toujours à valider.
