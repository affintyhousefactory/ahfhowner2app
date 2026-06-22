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
- **Arko One** — 20 m², 12 exemplaires, 59 900 € (grille confirmée).
- **Arko Max** — 40 m² (= ARKO historique), 5 exemplaires, 89 900 € (**grille à reconfigurer** — perM2/options/terrasse/footprint/`reserved` en attente ; `TODO` actuellement sur `ONE_PRICING` dans `site.ts` → à corriger dès données reçues).

Devis 3 couches (maison + livraison + frais terrain), **logique verrouillée** (ADR-005/020), montants par produit. Configurateur avec sélecteur One/Max (`/configurer?produit=`). Réservation d'un numéro avec acompte 1 500 €. Pas de multi-segment, pas de catalogue. Wordmark ARKO retiré de l'accueil ; noms produits conservés.

## Phases & backlog

| Phase | Périmètre | État | ADR |
|---|---|---|---|
| Phase 1 — Front | design, conversion, média, perf | ✅ Livré | 001,005,006 |
| Phase 1.5 — SEO | sitemap/robots/OG/JSON-LD | 🟢 P0+P1 livrés (2026-06-17) ; P2 polish restant | 018 |
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
| Email confirmations | `emails/contact-confirmation.tsx`, `emails/configurateur-recap.tsx`, `src/app/api/contact/route.ts` | absent — à implémenter Phase 4 | Resend + React Email | 026 |
| SEO | `sitemap.ts`, `robots.ts`, `opengraph-image.tsx`, `viewer/layout.tsx`, `lib/jsonld.ts`, `seo/JsonLd.tsx`, `llms.txt/route.ts` | ✅ P0+P1 (sitemap/robots/OG/twitter/canonical/noindex + JSON-LD Org/Product/FAQ + llms.txt) | P2 polish | 018 |

## Risques principaux

| Risque | Impact | Gravité | ADR |
|---|---|---|---|
| Légal acompte/arrhes + CGV non validés | Pas de vente | 🔴 Critique | 015 |
| RLS Supabase mal configurée | Fuite leads/réservations | 🔴 Critique | 007 |
| Service email non choisi | Bloque confirmation Stripe | 🟠 Haute | 026 |
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
BREVO_API_KEY=                     # serveur, jamais commité (ADR-026)
EMAIL_FROM=noreply@affinityhome.fr # expéditeur Brevo (ADR-026)
EMAIL_TO_AHF=contact@affinityhousefactory.com # copie interne (ADR-026)
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
| 014 | Service email transactionnel | **Remplacé → ADR-026** | ✅ |
| 015 | Légal acompte/arrhes/CGV | **Bloqué (avocat)** | 🔴 |
| 016 | Échéancier 10/30/40/20 % | Différé | 🟠 |
| 017 | Enrichissement terrain Anthropic | Différé (option) | ⚪ |
| 018 | Socle SEO | **Accepté — P0+P1 livrés** | ✅ |
| 019 | Gouvernance cognitive INDEX/HUB/_RUNTIME | Accepté | ✅ |
| 020 | Configurateur multi-produit (amende 005) | Accepté | ✅ |
| 021 | Architecture multi-pages + nav Tesla | Accepté | ✅ |
| 022 | Split produit One/Max + repositionnement | **Accepté — valider Albert** | 🟠 |
| 023 | Déploiement production Vercel | Proposé | ✅ |
| 026 | Emails Brevo templates dashboard + Supabase contacts | **Accepté — livré** | ✅ |

## Prochaines priorités (actionnable sans blocage externe)
1. **ADR-018 — SEO** : **P0+P1 livrés** (2026-06-17) — robots, sitemap, OG, twitter, canonical, `/viewer` noindex, JSON-LD (Organization/Product+Offer/FAQPage), `llms.txt`. Domaine `affinityhome.fr` (`SITE_URL`). **Reste P2** (polish, non bloquant) : manifest/PWA, skip-link, trim fonts, audit Lenis reduced-motion.
2. **ADR-007** — Supabase schémas + RLS (repasser MCP en écriture) → débloque 009/010/013.
3. **ADR-026 ✅ livré** — Emails Brevo : `/api/contact` + `/api/recherche-terrain` → `sendBrevoTemplate` (templates IDs `10`/`9`). Reste : migration SQL `contacts` (dashboard Supabase), bouton submit `PackTerrainContactForm`, SPF/DKIM prod.

## Tokens / MCP
Rotation tokens GitHub + Supabase **différée** → `memory/token-rotation-pending.md`.

## Dernier point

**2026-06-22 (bugfix contact + contenu FAQ/footer)** — `ContactForm.tsx` : Turnstile invisible passé de l'auto-execute silencieux à `execute()` au clic (`execution: "execute"`) + pattern `pendingFormDataRef` (soumission relancée dans `onSuccess`). Handlers `onError`/`onExpire` : vident la file d'attente, reset loading, affichent l'erreur — plus de bouton silencieux. `/api/contact route.ts` : fallback `EMAIL_TO_AHF || BREVO_TO_AHF` (mismatch env Vercel — AHF ne recevait pas les notifications contact). FAQ (`src/lib/site.ts`, 5 questions) : réponses réécrites et détaillées — délai + 3 conditions suspensives de déclenchement fabrication, Pack Recherche Terrain 1 500 € + Mandataire Partenaire Howner-Affinity qualifié carte T + remboursement si terrain non trouvé, paiement 6 paliers décret 6 fév. 2020, garanties 1/2/10 ans + transférabilité décennale + DO obligatoire, après-vente GPA. Footer : « Fabriqué » → « **Fabriquées** » (accord féminin pluriel avec « deux maisons »), suppression « fondé par Puigbo ». DNS howner.fr non encore configuré → contact form non testable en conditions réelles (Turnstile rejette le headless Playwright). **ADR-026 reste** : migration SQL `contacts`, `PackTerrainContactForm` submit, SPF/DKIM prod.

**2026-06-20 (ADR-026 Emails Brevo + devops)** — Emails transactionnels livrés : `sendBrevoTemplate` (Brevo REST + `templateId` + `params` Jinja2, pas de SDK tiers). `/api/contact` câblé (Turnstile + Supabase `contacts` + Brevo template `10`). `/api/recherche-terrain` migré de Resend → Brevo template `9`. `ContactForm.tsx` : tous champs obligatoires (tel, produit select, email regex), bouton disabled sur `loading` uniquement. Bugfix : `<Devis>` wrappé dans `<Suspense>` (build cassé silencieusement). Devops : `WATCHPACK_POLLING=true` dans script `dev` (hotreload WSL2 NTFS). Packages retirés : `resend`, `@react-email/components`, `@react-email/render`. Clés Turnstile test configurées en dev (`1x00000000000000000000AA`). **Reste ADR-026** : migration SQL `contacts` (dashboard Supabase), `PackTerrainContactForm` sans submit, SPF/DKIM prod. ADR-014 fermé.

**2026-06-20 (ADR-025 Configurateur pack terrain + devops WSL2)** — Intégration pack terrain dans `/configurer` : champs villes/zones/département selon le pack Affinity sélectionné, champs contact (nom/tel/email) retirés du formulaire inline (récupérés à la réservation), case CGV déplacée juste avant le bouton Réserver. Section "Frais complémentaires Hors proposition (hors total)" avec nouvelles estimations. API `source` ajouté (`configurateur` / `rechercheterrain`). Migration `20260620_recherche_terrain_source.sql`. `Reservation.tsx` : label renommé + `ConfigRecap` détaillé par ligne (modèle/bardage/cuisine/barre/chambre/intérieur). Devops : `next.config.ts` `watchOptions.pollIntervalMs: 500` (corrige file-watching Turbopack sur `/mnt/d` WSL2). `.claude/settings.json` créé (`Edit(*)`, `Write(*)`, patterns Bash courants — réduit les prompts de validation). ADR-025 amendé.

**2026-06-17 (ADR-018 SEO P1 + pages légales)** — **SEO P1** livré (build vert, 17 routes) : JSON-LD via `src/lib/jsonld.ts` + `src/components/seo/JsonLd.tsx` — `Organization` sitewide (+ adresse AHF, founder Puigbo), `Product`+`Offer` sur `/arko-one` & `/arko-max` (prix par produit, `LimitedAvailability`), `FAQPage` sur la home. `/llms.txt` (route statique, suit `SITE_URL`). Logo Organization **omis** (charte non figée ADR-002), prix **exposé** (déjà public). **Pages légales remplies** : `mentions-legales` + `confidentialite` contenu réel mutualisé AHF (`LegalShell` rendu conditionnel `pending`/`updated`, style `.legal-prose`), passées `index:true` + ajoutées au sitemap ; **CGV reste placeholder noindex** (ADR-015). ⚠ **Alerte Albert RGPD** : la politique de confidentialité déclare GA4/cookies/Brevo + bandeau de consentement non déployés sur ce site (doc mutualisée multi-sites AHF) — à arbitrer avant mise en prod indexée. Blocklist marque OK. Reste **P2** (polish non bloquant).

**2026-06-17 (ADR-018 — SEO P0 livré)** — Socle SEO P0 implémenté et **vérifié au build** (`next build` vert, 16 routes statiques). Nouveaux fichiers : `src/app/sitemap.ts` (6 routes indexables, légal + `/viewer` exclus), `src/app/robots.ts` (`disallow /viewer` + host + sitemap), `src/app/opengraph-image.tsx` (généré `next/og`, 1200×630, tokens charte), `src/app/viewer/layout.tsx` (`noindex,nofollow`). `layout.tsx` : `metadataBase` recâblé + twitter card + canonical `/`. Canonical self-référent ajouté sur toutes les pages (légal inclus). **Domaine de prod confirmé = `affinityhome.fr`** (ex-`howner.fr`), centralisé dans `SITE_URL` (`src/lib/site.ts`, override `NEXT_PUBLIC_SITE_URL`). Incident env corrigé : binaire natif `lightningcss` manquant (WSL) → `npm install lightningcss-linux-x64-gnu`. **Reste** : P1 JSON-LD (Organization/Product+Offer/FAQPage) + `llms.txt`, P2 polish. ADR-018 → « Accepté — P0 livré ».

**2026-06-17 (ingestion `claude-knowledge` + audit projet)** — Base de connaissances officielle ingérée dans `~/.claude/rules/` (14 thèmes, 119 fichiers : `claude-code`, `components`, `design`, `discovery`, `landing`, `landing-sections`, `mcp`, `modules`, `notion`, `saas`, `spa`, `supabase`, `vercel`, `workflow`). `~/.claude/CLAUDE.md` remplacé par celui du repo (charge les règles via `@import`). Audit projet contre les règles : **`PROFIL.md` créé** à la racine (convention `rules/discovery/profil-md-convention.md`) + câblé en tête de `CLAUDE.md` projet. **ADR-001 amendé** : dérogation actée (la règle landing impose Astro, Howner reste Next.js car livré). **Dette SEO confirmée** comme priorité 1 (ADR-018). Aucun code applicatif modifié.

**2026-06-16 (refonte multi-pages bi-produit)** — Site passé en **multi-pages** (App Router) : `/`, `/arko-one`, `/arko-max`, `/configurer`, `/terrain`, `/contact`, `/cgv`, `/mentions-legales`, `/confidentialite`. **Bi-produit** Arko One (20 m², 12 ex, 59 900 €) + Arko Max (40 m², **5 ex**, 89 900 €) via registre `PRODUCTS` (`src/lib/site.ts`). **Nav type Tesla** (méga-menu Produits, compteur 12+5). Configurateur **multi-produit** (sélecteur One/Max, devis qui suit la base — ADR-020, amende 005). Wordmark ARKO retiré de l'accueil (baseline « Une maison compacte faite pour vous », « Fabriqué au Pays-Basque »). Pages légales = placeholders (bloqué ADR-015). ADR-020/021/022 créés. `tsc` propre, 10 routes en 200, console clean. **À fournir** : grille Arko One (perM2/options/dimensions), `reserved` par produit, asset vidéo Arko One (fallback provisoire = footage Max). **3 alertes Albert** : repositionnement bi-produit, déverrouillage configurateur, retrait wordmark ARKO. Charte Affinity (ADR-002) toujours à valider.
