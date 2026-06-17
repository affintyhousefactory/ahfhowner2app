# ADR-023 — Déploiement production sur Vercel

- **Statut** : Proposé
- **Date** : 2026-06-17
- **Phase** : 1.5 → All (déploiement continu)
- **Faisabilité** : ✅ Élevée
- **Alerte Albert** : Non

## Contexte

Le site `affinityhome.fr` est livré (Phase 1 + SEO P0) et prêt pour un déploiement public. Vercel est déjà mentionné dans la stack (PROJECT_STATE) sans décision formalisée. Le MCP Vercel est configuré (OAuth). Les variables d'environnement sont partiellement définies (ADR-003), le domaine de production est `affinityhome.fr` (centralisé dans `NEXT_PUBLIC_SITE_URL`, `src/lib/site.ts`). Phase 4 (Stripe/Supabase) ajoutera des fonctions serverless — la stratégie de déploiement doit anticiper ce besoin sans bloquer la mise en ligne actuelle.

## Décision

**Déployer sur Vercel** avec les conventions suivantes :

### Projet Vercel
- Connecter le repo GitHub `Howner-ARKO2` (branche `main` = production).
- Framework preset : **Next.js** (auto-détecté).
- Node.js : **20.x** (LTS, compatible Next.js 16.2.9).
- Build command : `next build` (Turbopack activé en dev, build prod standard).
- Output directory : `.next` (par défaut).

### Domaine
- Domaine principal : `affinityhome.fr` (DNS CNAME/A → Vercel).
- Alias `www.affinityhome.fr` → redirect 301 vers apex.
- TLS : auto (Let's Encrypt via Vercel).

### Variables d'environnement (ADR-003)
| Variable | Environnement Vercel | Source |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Production | `https://affinityhome.fr` |
| `NEXT_PUBLIC_RESERVATION_DEPOSIT_EUR` | All | montant acompte |
| `NEXT_PUBLIC_ARKO_BASE_EUR` | All | prix base |
| `SUPABASE_SERVICE_ROLE_KEY` | Production + Preview | secret Supabase (Phase 4) |
| `STRIPE_SECRET_KEY` | Production | secret Stripe (Phase 4) |
| `STRIPE_WEBHOOK_SECRET` | Production | secret webhook (Phase 4) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | All | clé publiable Stripe (Phase 4) |
| `NEXT_PUBLIC_SUPABASE_URL` | All | URL Supabase (Phase 4) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All | clé anon Supabase (Phase 4) |
| `APIFY_TOKEN` | Production | token Apify (Phase 4) |
| `ANTHROPIC_API_KEY` | Production | optionnel ADR-017 |

Règle : les variables `NEXT_PUBLIC_*` peuvent aller en Preview ; les clés serveur (`SERVICE_ROLE`, `STRIPE_SECRET`, `APIFY`, `ANTHROPIC`) **Production uniquement** par défaut.

### Preview deployments
- Chaque branche/PR génère un déploiement preview automatique sur `*.vercel.app`.
- Les previews utilisent les variables `NEXT_PUBLIC_*` seulement (pas de clés serveur Phase 4 en preview par défaut).
- URL preview non indexée (header `X-Robots-Tag: noindex` par Vercel).

### Webhook Stripe (Phase 4)
- Endpoint webhook : `https://affinityhome.fr/api/stripe/webhook`.
- Configurer le webhook dans le dashboard Stripe **vers le domaine de production uniquement** (pas les previews).

### Monitoring
- Vercel Analytics : **désactivé** par défaut (RGPD — à activer si DPO valide).
- Logs serverless : rétention 1 jour (plan hobby) → passer Pro si Phase 4 trafic justifié.

## Faisabilité

- **Verdict** : ✅ Élevée — Next.js App Router est le use case natif de Vercel. Aucune configuration custom requise pour Phase 1.5.
- **Dépendances externes** :
  - Accès DNS du registrar `affinityhome.fr` pour pointer vers Vercel.
  - Compte Vercel (hobby ou Pro) connecté au repo GitHub.
  - MCP Vercel configuré (OAuth déjà actif dans `project-access.json`).
- **Risques** :
  - Plan Hobby : limite 100 Go bande passante/mois, fonctions serverless 10s timeout. Suffisant Phase 1.5 ; à réévaluer Phase 4 (webhook Stripe < 10s OK, terrain Apify potentiellement long → API route avec streaming ou background job).
  - `lightningcss` : l'incident binaire natif était WSL-spécifique → Vercel Linux x64 natif, aucun impact.
  - Variables d'environnement Phase 4 **ne doivent jamais** être commitées (ADR-003 — guardrail absolu).

## Conséquences

- `main` = production → toute merge sur `main` déclenche un déploiement automatique. Adopter une politique de branches : `feat/*` → PR → merge → deploy.
- `NEXT_PUBLIC_SITE_URL=https://affinityhome.fr` doit être défini dans Vercel **avant** le premier déploiement (sitemap, canonical, OG — ADR-018).
- Phase 4 : ajouter les secrets au fur et à mesure, sans modifier le code applicatif (env-driven).
- Mettre à jour PROJECT_STATE.md colonne ADR de la ligne "Hébergement Vercel" → ADR-023.

## Sources

- `src/lib/site.ts` — `SITE_URL`, `PRODUCTS`
- `00_INDEX/PROJECT_STATE.md` — stack, variables d'env manquantes
- `ADR-003` — politique secrets & montants via env
- `ADR-018` — SEO (sitemap, canonical, OG image liés au domaine prod)
- `project-access.json` — périmètre MCP Vercel
