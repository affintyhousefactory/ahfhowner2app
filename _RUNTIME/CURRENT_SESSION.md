# CURRENT_SESSION — Howner / ARKO

## Focus actuel
**Chantier configurateur v2 ouvert** (spec Albert v1). ADR-029 écrite — repositionnement produit & marque, précondition des ADR-030→034. Aucun code applicatif touché à ce stade.
Deux risques 🔴 ouverts : **prix publics faux de 18 000 € sur l'Arko One** (ADR-029, à corriger au lot 1) et **CGV non confirmées avocat, live en prod** (ADR-015, depuis le 2026-07-13).

## Décisions prises — 2026-07-31 (ADR-029 — repositionnement produit & marque)
- **Spec Albert versée au dépôt** (`docs/specs/SPEC_CONFIGURATEUR_HOWNER_v1.md`, PR #63) — fidélité vérifiée à l'octet près (30 765 o hors en-tête). Accès Drive déclaré dans `project-access.json` (lecture seule, 2 dossiers).
- **Cadre de vente restreint** : annexe sur parcelle bâtie + hébergement professionnel. **Terrain nu fermé** → « prochainement », sans prix ni explication (critère de recette §16).
- **Vocabulaire inversé** : « maison » (105 occurrences), « maison individuelle », « résidence principale », « clé en main » interdits → module / unité / studio / hébergement / annexe.
- **Prix 77 900 / 99 900 €**, réservation **2 000 €** + acompte 30 %, **Série 01 = 6 unités**.
- **ADR-004 remplacée** par ADR-029. Blocklists **cumulatives** : « module » imposé, « modulaire » toujours interdit.
- **Périmètre : hors pages légales** (§17.10 + risque ADR-015).
- **Pas d'alerte Albert** — il est l'auteur de la décision. La règle CLAUDE.md ne s'applique pas quand il en est l'émetteur.
- **3 arbitrages remontés à Howner** : contradiction « clé en main » dans la spec (§1 vs §2/§12/§16) ; lecture cumulative module/modulaire ; « identité Howner seule » vs obligation de nommer l'éditeur légal (AHF SAS) en mentions légales.
- **Reste** : ADR-030→034, plan de chantier en affinage à distance.

## Décisions prises — 2026-07-31 (ADR-028 — correctif : le masquage admin ne tenait pas)
- **Défaut constaté en production** après le merge de la PR #58 : `/admin/{mandataires,affectations,ged,terrains}` renvoyaient **200** et le HTML servi contenait la **vraie page** (titre, boutons Inviter/Nouveau, liens de tri `?sort=zone_activite`, état de table) sous la page 404. Le composant serveur s'exécutait, **requêtes Supabase comprises**.
- **Cause** : `(admin)/admin/(protected)/layout.tsx` est un composant **client** (garde d'auth). Il streame en premier → statut 200 figé ; le `notFound()` du layout serveur enfant arrive trop tard et n'annule ni le statut ni le payload RSC déjà émis.
- **Correctif** (PR #59 → `dev`, PR #60 → `main`) : **`src/proxy.ts`** (Middleware renommé **Proxy** en Next 16) intercepte les 4 chemins admin avant tout rendu → 404 sec ; `guardMandataire()` ajouté en première instruction des **7 pages serveur** du périmètre en défense en profondeur. Matcher strictement borné : `/admin` et `/admin/leads` intacts.
- **Non touché** : surfaces publiques, portail mandataire et 29 routes API étaient **corrects dès #57** — 404 réel, aucun `<h1>`, aucun contenu de corps, aucune donnée. Seul l'objet `metadata` du segment reste évalué (cosmétique).
- **Vérifié en production** après déploiement : 4 écrans admin + sous-routes en **404 / `h1=0` / corps vide**, aucune fuite ; `/admin` + `/admin/leads` en 200 ; suspendues en 404 ; publiques en 200 ; API en 404 ; sitemap 7 URLs.
- **Règle actée** : une garde `notFound()` n'est fiable que si **aucun layout client ne la précède** dans l'arbre — sinon couper au proxy. Documentée dans ADR-028 + `docs/feature-flags.md`.
- **Leçon de méthode** : **un code HTTP 404 ne prouve pas un masquage**. Le contrôle `curl` de `docs/feature-flags.md` compte désormais les `<h1>` et la taille du corps en plus du statut.

## Décisions prises — 2026-07-30 (ADR-028 — suspension du domaine « Mandataire & Terrain »)
- **Suspension, pas suppression** : aucun fichier supprimé, aucune migration, aucune donnée ni compte touché. Interrupteur unique `FEATURES.mandataire` (`src/lib/features.ts`) piloté par `NEXT_PUBLIC_FEATURE_MANDATAIRE` — **variable absente = suspendu** (défaut sûr, à ne PAS configurer sur Vercel).
- **Motif** : finalité de marché et cible non mûres. Le site promettait un rappel « sous 48 h par un expert Mandataire Affinity » qu'AHF ne veut pas honorer.
- **Coupé** : portail mandataire (garde unique dans le layout de groupe), onboarding, écrans admin Mandataires/Affectations/GED/Terrains (layouts de segment), affectation + GED mandataire de la fiche lead, colonne Mandataire de la liste, widgets dashboard dérivés des dossiers, `/terrains` `/rechercheterrain` `/terrain` `/cgu-mandataire`, liens Footer/NAV, sitemap/robots/llms.txt, mode « Je cherche un terrain » du configurateur, **29 routes API / 36 handlers**.
- **Conservé** : réservation, pricing 3 couches **intact**, analyse PLU « J'ai un terrain », livraison GPS, `/contact`, Leads + fiche lead + **GED Client**, Brevo contact/récap.
- **Amende ADR-005** (UI configurateur, verrou de pricing tenu), ADR-018, ADR-025, ADR-027.
- **Vérif** : `tsc` propre ; `eslint` 322 erreurs avant / 322 après (dette préexistante, zéro régression).
- **Livré** : PR #57 → `dev`, PR #58 → `main` (2026-07-30). ⚠️ Le masquage des écrans admin ne tenait pas — voir la session du 2026-07-31 ci-dessus.
- **Alerte Albert** ✅ faite verbalement par Richard (retrait d'offre commerciale = changement de positionnement).
- **Reste** : test de réversibilité (`NEXT_PUBLIC_FEATURE_MANDATAIRE=true` sur une Preview) — non exécuté à ce jour.

## Décisions prises — 2026-07-20 (SEO home — HTML front indexable)
- **PR #54 mergée** (`fix/homepage-ssr-seo-reveal` → `dev`) puis **PR #55 (`dev`→`main`) mergée le même jour** — **correctif LIVE en production**, `dev` et `main` alignés. 1 commit (`cde0b8c7`), 6 fichiers front, aucune migration.
- **Diagnostic** : la home était déjà rendue côté serveur, mais servie **invisible** — framer-motion sérialisait `opacity:0` inline dans le HTML SSR (**23 blocs sur `/`, jusqu'à 64 sur `/arko-max`**). Sans JS = page blanche. Hiérarchie Hn cassée (méga-menu `<h3>` avant le `<h1>`, footer `<h2>` dupliquant le `<h1>`).
- **Correctif** : `Reveal.tsx` réécrit sans framer-motion (`IntersectionObserver` + classes CSS, API publique inchangée → Configurator ADR-005 non touché) ; état masqué déplacé dans `globals.css` sous `.js-motion` (posée sur `<html>` uniquement si JS s'exécute → pas de JS = contenu visible) ; `<script>` inline brut dans `layout.tsx` pose `.js-motion` avant le premier paint (écarte `next/script beforeInteractive` = flash) ; `Hero.tsx` `<h1>` sorti du conteneur `opacity:0` (parallaxe image conservée en framer) ; `Nav.tsx`/`Footer.tsx` titres décoratifs re-balisés `<p>`. **Aucun texte modifié.**
- **Vérifié sur Preview Vercel** (Googlebot, sans JS) : `opacity:0` inline **23 → 0**, plan des titres **H1 → H2 → H3** imbriqué, script synchrone présent, contenu FAQ visible. `tsc` + `eslint` OK.
- **Formulaires sans JS** (question Richard) : normal et **non-bloquant SEO** (Googlebot exécute le JS ; un form n'est pas du contenu indexable). `/configurer` rend son form au SSR ; `/contact` affiche un fallback vide car le form lit l'URL (`useSearchParams` → `<Suspense>`) ; `/rechercheterrain` n'a pas de form (page vitrine → CTA `/configurer`). Rendre les forms utilisables sans JS = refonte progressive enhancement (Server Actions + anti-spam sans JS) — non retenu (audience quasi nulle, hors SEO). Amélioration optionnelle repérée : squelette de form au lieu de carte vide sur `/contact` (non fait).

## Focus actuel
**Prod à jour** — `dev` et `main` alignés (0 commit d'écart). Aucun chantier de code en cours. Seuls points ouverts : blockers externes (CGV avocat, grille Arko Max, validations Albert) + reliquats non bloquants (SEO P2, placeholders Brevo template 15).

## Historique
**`fix/scrape-annonce-error-logging` mergée sur `dev`** (PR #51, 2026-07-10) — scope réel bien plus large que son nom : ADR-027 (fiche lead — recherche terrain, affectation géo, GED double), refonte CGV (attente confirmation avocat), révision blocklist marque ADR-004, refonte FAQ/hero/promesse/réassurance, fiabilisation import photos terrain, extraction IA Anthropic enrichie, contact Brevo direct.

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
- **PR #17 `dev`→`main` mergée** ✅ — migrations prod appliquées (`20260629_admin_tables`, `20260630_mandataires_invitation`). Production à jour.

## Questions en suspens
- Migrations automatiques : GitHub Actions `supabase db push` vs Supabase Branching (Pro) vs manuel. Pas tranché.
- Supabase local (CLI Docker) vs cloud `ahfhownerdb-dev` pour Development. Pas tranché.

## Blockers / À fournir
- ~~**SPF/DKIM prod**~~ ✅ corrigé manuellement (2026-07-10), plus de bloqueur.
- **CGV + légal** — nouvelle version CGV (`f3de62fe`) en attente confirmation avocat (ADR-015, seul point restant bloqué).
- **Coordonnées atelier** — `transport.usine_lat/lon` dans `config_variables` = placeholder Bayonne (43.4933, −1.4748) — à affiner avec l'adresse réelle.
- **Albert validation** — charte Affinity (ADR-002) + repositionnement bi-produit (ADR-022).
- **Arko Max pricing grid** — `perM2/options/terrasse/footprint/reserved` — données métier attendues.

## Règle
Court : 300–1200 tokens. Backlog → `00_INDEX/PROJECT_STATE.md`.
