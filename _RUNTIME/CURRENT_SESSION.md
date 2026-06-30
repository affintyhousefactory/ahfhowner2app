# CURRENT_SESSION — Howner / ARKO

## Focus actuel
**`feat/admin-portal` COMPLET** — Étapes 1→6 mergées sur `dev` via PR #14 (commit 614b5f0c). Portail admin opérationnel : dashboard, leads, mandataires, affectations, carte Leaflet, formulaire lead/mandataire, Pappers, validation/suspension, invitation onboarding.

## Décisions prises — 2026-06-29 (session brevo-contacts + admin-portal)
- **Brevo contacts opt-in livré** (PR #12 → dev → PR #13 → main) :
  - `addBrevoContact()` direct liste 7 (mandataires, base contractuelle)
  - `addBrevoContactDOI()` DOI liste 8 (prospects — ContactForm + Reservation + RechercheTerrainForm)
  - Template DOI = **13**, liste prospects = **8**, liste mandataires = **7**
  - Variables Vercel complétées : `BREVO_TO_AHF`, `EMAIL_TO_AHF` (Preview), listes + DOI template
- **Migration `20260629_mandataires_documents_bucket.sql` appliquée sur prod** ✅
- **Migration `20260629_admin_tables.sql` créée** sur `feat/admin-portal` — **PAS encore appliquée** (à appliquer sur preprod au merge dev, puis prod au merge main)
- **feat/admin-portal démarré** — Étapes 1+2 committées (branche en cours, non pushée) :
  - Route group `(admin)` : signin, layout sidebar sombre, auth guard rôle `admin`
  - Dashboard KPIs : CA brut, revenus AHF, rémunérations, alertes 48h, donuts, entonnoir, bar mandataires
  - Liste + fiche leads, liste + fiche mandataires, page affectations
  - `recharts` installé
- **Redéploiement prod** déclenché depuis branche `dev` par erreur (contenu identique à `main` — pas d'impact)

## Décisions prises — 2026-06-29 (session portail mandataire)
- **Workflow git 3 niveaux** instauré : `feat/*` → `dev` → `main`.

## Décisions prises — 2026-06-27
- **Supabase 3 scopes Vercel** configurés : Production (`ahfhownerdb`), Preview (`ahfhownerdb-preprod`), Development. `.env.local` resynchronisé via `vercel env pull --environment=development`.
- **6 migrations appliquées** preprod + prod via MCP Supabase OAuth (`apply_migration`) : `20260618_recherche_terrain.sql`, `20260619_*_modele_budget.sql`, `20260620_contacts.sql`, `20260620_*_source.sql`, `20260622_leads.sql`, `20260622_config_tarifs.sql`.
- **PR `feat/terrain-address-lookup` mergée** ✅ — analyse PLU adresse/IDU, calcul livraison GPS, schéma Supabase.
- **`PackTerrainContactForm` submit câblé** ✅ — sessionStorage bridge (`pack_terrain_zones`) → `Reservation.tsx` → `/api/recherche-terrain`.
- **Fix livraison "À estimer"** ✅ — `ConfigRecap` réactif via `plu_result_updated` DOM event.
- **Fix `plu_adresse` NULL IDU path** ✅ — `reverseGeocode()` BAN en `Promise.all` avec GPU (Voie B).
- **Fix champs PLU NULL leads** ✅ — `PluConsentBlock` useEffect + listener + auto-check.
- **ADR-008 amendé** : Stripe retiré du MVP — paiement hors-ligne. Variables Stripe non à configurer Vercel.
- **PR `fix/delivery-recap` mergée** ✅.

## Décisions prises — 2026-06-30 (portail mandataire + PR #17)
- **PR #16 mergée sur dev** : landing `/mandataire`, dashboard `/mandataire/dashboard`, signup épuré, forgot/reset-password
- **Template Brevo 15** (affectation) créé — `BREVO_TEMPLATE_AFFECTATION=15` en `.env.local` + Vercel dev. À ajouter Vercel Prod+Preview avant merge #17.
- **PR #17 `dev`→`main` ouverte** — en attente checklist : (a) Vercel `BREVO_TEMPLATE_AFFECTATION=15` Prod+Preview, (b) Supabase Redirect URL reset-password, (c) merge, (d) appliquer 2 migrations prod.

## Questions en suspens
- Migrations automatiques : GitHub Actions `supabase db push` vs Supabase Branching (Pro) vs manuel. Pas tranché.
- Supabase local (CLI Docker) vs cloud `ahfhownerdb-dev` pour Development. Pas tranché.

## Blockers / À fournir
- **SPF/DKIM prod** — DNS au registrar howner.fr (bloqueur externe). ADR-026.
- **DNS howner.fr** — à configurer au registrar (externe).
- **CGV + légal** — avocat (ADR-015, externe).
- **Coordonnées atelier** — `transport.usine_lat/lon` dans `config_variables` = placeholder Bayonne (43.4933, −1.4748) — à affiner avec l'adresse réelle.
- **Albert validation** — charte Affinity (ADR-002) + repositionnement bi-produit (ADR-022).
- **Arko Max pricing grid** — `perM2/options/terrasse/footprint/reserved` — données métier attendues.

## Règle
Court : 300–1200 tokens. Backlog → `00_INDEX/PROJECT_STATE.md`.
