# CURRENT_SESSION — Howner / ARKO

## Focus actuel
**Analyse terrain par adresse + calcul livraison GPS + schéma Supabase** — branche `feat/terrain-address-lookup` poussée, prête pour validation Preview Vercel avant merge.

## Décisions prises cette session
- **`ParcelleAnalyse.tsx`** : saisie par adresse (primaire) + bascule numéro de parcelle (secondaire). Pipeline BAN → apicarto `geom=Point` → GPU `/feature-info/du` + `/feature-info/sup` par coordonnées. Sauvegarde `plu_result` en sessionStorage en mode compact si `found=true`.
- **`/api/parcelle`** : GPU réécrit sur endpoints coordonnées (`/feature-info/du?lon&lat&typeName` + `/feature-info/sup?lon&lat`) — `/feature-info/parcel/{id}/` rejeté par l'API quel que soit le format. `source_ign=PCI` supprimé (retournait 1000 résultats Aix).
- **Calcul livraison GPS** (`Reservation.tsx`) : lit `plu_result.lon/lat` depuis sessionStorage, calcule haversine × `roadFactor` 1.3 × poids × tarif `0,24 €/t/km` + grutage. `TRANSPORT` ajouté dans `site.ts`.
- **`src/lib/supabase.ts`** : client lazy (`getSupabaseAdmin()`) — résout l'erreur `supabaseUrl is required` au build Vercel Preview.
- **`/api/reservation`** : stockage leads Supabase (non-bloquant) + colonnes PLU + email récap enrichi (PLU_*).
- **Migrations SQL** : `20260622_leads.sql` (table `leads` + RLS), `20260622_config_tarifs.sql` (`config_variables` transport/produits, `options_produits`, `options_bardage`).
- **`docs/supabase-environments.md`** : architecture Prod/Preview/Dev — scoping Vercel, création projets preprod/dev, workflow local `feat/*`.
- **ADR-022/025/026** mis à jour post-livraison.

## Décisions prises cette session (suite 2026-06-27)
- **Stripe retiré du MVP** (ADR-008 amendé) : paiement hors-ligne après qualification lead. Variables Stripe non à configurer sur Vercel.
- **Supabase Production** ✅ : 3 vars ajoutées scope Production → `ahfhownerdb`.
- **Supabase Preview** ✅ : 3 vars ajoutées scope Preview → `ahfhownerdb-preprod` (`ixozlavseaykxmjtkkrk`).
- **Supabase Development** ✅ : 3 vars + Brevo non-secrets + Turnstile test keys + `NEXT_PUBLIC_SITE_URL=http://localhost:3000` → scope Development.
- **`.env.local` resynchronisé** via `vercel env pull --environment=development` → pointe correctement sur preprod. `BREVO_API_KEY` absent du scope Development (emails non fonctionnels en local — acceptable).
- **Stripe retiré du MVP** (ADR-008 amendé) : paiement hors-ligne après qualification lead.

## Question en suspens
- Migrations automatiques : **GitHub Actions `supabase db push`** vs Supabase Branching (Pro) vs manuel. Pas encore tranché.
- Supabase local (CLI Docker) vs cloud `ahfhownerdb-dev` pour le scope Development. Non tranché.

## À fournir / blockers
- **Créer projet Supabase preprod** (`ahfhownerdb-preprod`, dashboard → new project, même org, région eu-west-1) → fournir les 3 clés pour configurer scope **Preview + Development** Vercel.
- **Appliquer migrations** sur preprod (SQL Editor) : `20260622_leads.sql`, `20260622_config_tarifs.sql` (+ `20260620_contacts.sql`).
- **Valider build Preview** (env vars Preview Supabase manquantes) → **merger PR** `feat/terrain-address-lookup`.
- **Coordonnées atelier** à affiner dans `config_variables` (`transport.usine_lat/lon` = Bayonne placeholder).
- **ADR-026 reste** : migration `contacts`, `PackTerrainContactForm` submit, SPF/DKIM prod.
- DNS howner.fr + CGV (ADR-015) toujours bloqués.

## Règle
Court : 300–1200 tokens. Backlog → `00_INDEX/PROJECT_STATE.md`.
