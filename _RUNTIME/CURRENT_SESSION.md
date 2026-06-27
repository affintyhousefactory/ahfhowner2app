# CURRENT_SESSION — Howner / ARKO

## Focus actuel
**Prochaine étape** : SPF/DKIM prod (DNS registrar — bloqueur externe), puis ADR-007 RLS complet ou ADR-018 SEO P2.

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
