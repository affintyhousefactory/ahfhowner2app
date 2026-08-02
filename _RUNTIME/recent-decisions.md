# RECENT DECISIONS — Howner / ARKO

## Décisions récentes

### 2026-08-02 (ADR-030 — mise en œuvre du configurateur v2)
- **Colonne de sections dépliantes** retenue contre le stepper : l'écran 0 étant descendu en section 05, le stepper n'avait plus d'avantage. → ADR-030 § Amendement.
- **Groupe de routes `(configurateur)`** pour servir `/configurer/v2` sans nav — une mise en page imbriquée ne peut pas retirer la `<Nav>` de sa parente.
- **Scène à hauteur constante** : le rétrécissement mobile est rejeté après essai (`object-cover` coupait le pied du module). C'est l'en-tête qui s'efface.
- **CTA « Tester mon terrain » retiré** de l'accueil et des pages produit : son repli menait au configurateur v1, que plus aucun bouton ne dessert.
- **Le vocabulaire s'apprécie sur le texte rendu, pas sur le code.** « clé en main » était servi sur les pages produit, coupé par un retour à la ligne JSX, invisible au contrôle. → ADR-029 § Amendement.
- **Plus de test local** (dev server, Playwright, `next build`) : HMR aveugle sur `/mnt/d`, laptop lent. Gate = `tsc` + `eslint` + `check:vocabulaire` + Preview Vercel.

### 2026-06-17 (ingestion `claude-knowledge` + audit)
- **Base de connaissances officielle ingérée** dans `~/.claude/rules/` (14 thèmes, 119 fichiers). `~/.claude/CLAUDE.md` remplacé par celui du repo (charge les règles via `@import`). Backup : `CLAUDE.md.pre-ingest-2026-06-17.bak`.
- **`PROFIL.md` créé** à la racine du projet (convention `rules/discovery/profil-md-convention.md`) + câblé dans `CLAUDE.md` projet (directive lecture obligatoire).
- **ADR-001 amendé** : dérogation actée — `rules/landing/landing-page-quality-checklist.md` impose Astro pour les nouvelles landings, Howner reste Next.js 16 (projet livré, Lighthouse 100, refonte coût > bénéfice). Prochaine landing SaaS partira en Astro.
- **Dette SEO confirmée** comme priorité 1 (ADR-018) — règles `seo-setup.md` + `landing-page-quality-checklist.md` exigent robots.txt, sitemap.xml, llms.txt, OG image, JSON-LD.

### 2026-06-16 (refonte multi-pages bi-produit)
- **Bi-produit** Arko One (20 m²/12 ex/59 900 €) + Arko Max (40 m²/5 ex/89 900 €) via registre `PRODUCTS`. → ADR-022 (valider Albert).
- **Multi-pages** App Router (10 routes) + **nav type Tesla** (méga-menu Produits, compteur 12+5). → ADR-021.
- **Configurateur multi-produit** (sélecteur One/Max, `?produit=`) — verrou ADR-005 amendé (logique seule). → ADR-020.
- **Wordmark ARKO retiré de l'accueil** (baseline « Une maison compacte faite pour vous », « Fabriqué au Pays-Basque ») ; noms produits gardés. → ADR-022 (amende 004).
- **project-access.json** créé (isolation MCP : github/supabase, Gmail/Drive verrouillés).

### 2026-06-16
- **Gouvernance ADR adoptée** — 19 ADR dans `03_DECISIONS/` (faisabilité ponctuée). → ADR-001→019.
- **Charte Affinity appliquée** — remap `@theme`, remplace « Argile & Encre ». → ADR-002 (**à valider Albert**).
- **Supabase = `ahfhownerdb`** (ref `msrjocrcewvqkcehruny`) retenu pour Phase 4. → ADR-007.
- **Structure cognitive** INDEX/HUB/_RUNTIME + `00_INDEX/PROJECT_STATE.md` canonique ; purge contamination AHF_WEB2. → ADR-019.
- **MCP** github (remote officiel) / supabase (read-only) / vercel (OAuth) configurés ; CLI Higgsfield + skills installés.

## Règle
Les décisions durables doivent être formalisées dans `03_DECISIONS/`. Ce fichier reste un journal court.
