# Environnements Supabase — Prod / Preview / Dev

## Vue d'ensemble

Trois environnements étanches, un par contexte de déploiement :

| Environnement | Branche Git | Déploiement Vercel | Base Supabase |
|---|---|---|---|
| **Production** | `main` | `howner.fr` / `affinityhome.fr` | `ahfhownerdb` — `msrjocrcewvqkcehruny` |
| **Preview** | `dev`, `feat/*`, `fix/*` | URL Vercel Preview auto-générée | `ahfhownerdb-preprod` — `ixozlavseaykxmjtkkrk` |
| **Development** | toutes (local) | `localhost:3000` | `ahfhownerdb-dev` _(à créer)_ |

Les données de test n'atteignent jamais la prod. Les migrations sont appliquées en avance sur preprod/dev avant d'être mergées sur main.

---

## Fonctionnement Vercel

Vercel scope les variables d'environnement par contexte. Chaque variable a une ou plusieurs cases à cocher dans **Settings → Environment Variables** :

```
☑ Production   → déclenché par un push/merge sur main
☑ Preview      → déclenché par tout push sur une branche feature (feat/*, fix/*, etc.)
☑ Development  → utilisé par `vercel env pull` en local
```

Un même nom de variable peut avoir **trois valeurs différentes** selon le scope.

---

## Création des projets Supabase

### Projet preprod (`ahfhownerdb-preprod`)

1. Dashboard Supabase → **New project**
2. Nom : `ahfhownerdb-preprod` — même organisation, région `eu-west-1`
3. Une fois créé, noter :
   - `NEXT_PUBLIC_SUPABASE_URL` → `https://<ref-preprod>.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → clé anon (Settings → API)
   - `SUPABASE_SERVICE_ROLE_KEY` → clé service_role (Settings → API, **ne jamais exposer**)
4. Appliquer toutes les migrations dans **SQL Editor** :
   ```sql
   -- coller le contenu de chaque fichier dans supabase/migrations/ dans l'ordre chronologique
   -- 20260618_recherche_terrain.sql
   -- 20260619_recherche_terrain_modele_budget.sql
   -- 20260620_contacts.sql
   -- 20260620_recherche_terrain_source.sql
   -- 20260622_leads.sql
   ```

### Projet dev (`ahfhownerdb-dev`)

Même procédure. Peut aussi être un projet Supabase **local** via Docker si tu préfères travailler hors-ligne :

```bash
# Option A — projet Supabase cloud dédié (recommandé pour simplicité)
# Même démarche que preprod, nom : ahfhownerdb-dev

# Option B — Supabase local (Docker)
npx supabase init          # une seule fois dans le repo
npx supabase start         # lance postgres + studio + auth localement
# URL locale : http://localhost:54321
# anon key / service_role key affichées dans la sortie de `supabase start`
```

---

## Configuration Vercel — variables d'environnement

Dans **Vercel → Settings → Environment Variables**, configurer chaque variable avec le scope correct :

### `NEXT_PUBLIC_SUPABASE_URL`

| Scope | Valeur |
|---|---|
| Production | `https://msrjocrcewvqkcehruny.supabase.co` |
| Preview | `https://<ref-preprod>.supabase.co` |
| Development | `https://<ref-dev>.supabase.co` (ou `http://localhost:54321` si local) |

### `NEXT_PUBLIC_SUPABASE_ANON_KEY`

| Scope | Valeur |
|---|---|
| Production | clé anon du projet prod |
| Preview | clé anon du projet preprod |
| Development | clé anon du projet dev |

### `SUPABASE_SERVICE_ROLE_KEY`

| Scope | Valeur |
|---|---|
| Production | clé service_role prod — **ne jamais commiter** |
| Preview | clé service_role preprod |
| Development | clé service_role dev |

> Vercel injecte automatiquement les bonnes valeurs selon le contexte de build. Un `git push` sur `feat/mon-feature` reçoit les valeurs Preview ; un merge sur `main` reçoit les valeurs Production.

---

## Développement local — test d'une branche `feat/*`

### 1. Récupérer les variables d'environnement de dev

```bash
# Installe le CLI Vercel si ce n'est pas fait
npm i -g vercel

# Lien avec le projet (une seule fois)
vercel link

# Pull les variables d'environnement Development dans .env.local
vercel env pull .env.local
```

`.env.local` contiendra alors les valeurs du scope **Development**, c'est-à-dire les clés de `ahfhownerdb-dev`. Ce fichier est gitignorié — les secrets ne sont jamais commités.

### 2. Lancer le serveur local

```bash
npm run dev
# → http://localhost:3000
# → Supabase : base dev (ahfhownerdb-dev)
```

### 3. Flux complet pour une feature

```
feat/ma-feature (local)
  └─ npm run dev → localhost:3000 → Supabase DEV
  └─ git push → Vercel Preview → Supabase PREPROD
  └─ PR merge sur dev → Vercel Preview (dev) → Supabase PREPROD
  └─ PR merge sur main → Vercel Production → Supabase PROD
```

### 4. Appliquer une nouvelle migration en local

Si tu ajoutes un fichier dans `supabase/migrations/`, l'appliquer manuellement sur les trois bases :

```bash
# Dev : copier-coller le SQL dans Supabase Studio local ou dashboard dev
# Preprod : dashboard Supabase preprod → SQL Editor
# Prod : uniquement après validation sur Preview → dashboard prod
```

> **Convention** : ne jamais appliquer une migration directement en prod sans l'avoir testée sur preprod. La branche `feat/*` + Preview sert de validation avant merge.

---

## Isolation des données — règles

| Règle | Détail |
|---|---|
| Migrations prod uniquement après merge | Appliquer le SQL en prod seulement quand la PR est mergée sur `main` |
| Pas de service_role côté client | `getSupabaseAdmin()` est importé uniquement dans `src/app/api/` |
| RLS activé sur toutes les tables | `ALTER TABLE x ENABLE ROW LEVEL SECURITY` dans chaque migration |
| Pas de données réelles en dev/preprod | Utiliser des emails `@test.invalid` ou similaires pour les tests |

---

## Référence rapide

```
Prod    msrjocrcewvqkcehruny   → main          → howner.fr / affinityhome.fr
Preprod ixozlavseaykxmjtkkrk   → dev, feat/*   → <slug>.vercel.app (preview)
Dev     <ref-dev>               → local         → localhost:3000
```

Fichier de migration à appliquer sur chaque nouvelle base : `supabase/migrations/*.sql` dans l'ordre alphabétique/chronologique.
