# PASSATION — HOWNER / ARKO (front → back)

Le front est **terminé, validé, livré** : design, conversion, médias, perf
(Lighthouse desktop **100 / 100 / 100 / 100**, LCP 0,8 s, CLS 0). Tous les
formulaires sont **présents et prêts à câbler** — aucune transaction réelle
n'est encore branchée. Ce document liste **uniquement** ce qu'il reste à faire
côté back, où, et avec quelles variables.

> Règle d'or respectée par le front : **aucun montant en dur**. Tout passe par
> `src/lib/site.ts`, lui-même alimenté par les variables `.env`. Ne pas
> réintroduire de prix en dur.

---

## 1. Variables d'environnement attendues

Copier `.env.example` → `.env.local` (jamais committé) et renseigner.

### Déjà utilisées par le front (calcul prix/livraison, côté client)
| Variable | Rôle | Valeur actuelle |
|---|---|---|
| `NEXT_PUBLIC_RESERVATION_DEPOSIT_EUR` | Acompte de réservation | `1500` |
| `NEXT_PUBLIC_ARKO_BASE_EUR` | Prix de base clé en main TTC | `89900` |
| `NEXT_PUBLIC_DELIVERY_GRUTAGE_EUR` | Forfait grutage | `1440` |
| `NEXT_PUBLIC_DELIVERY_PER_KM_EUR` | Tarif au km depuis Bayonne | `5.40` |
| `NEXT_PUBLIC_DELIVERY_ORIGIN` | Origine livraison (affichage) | `"Bayonne 64100"` |

### À renseigner en Phase 4 (back, aujourd'hui vides)
| Variable | Pour |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client Supabase (lecture slots/jauge) |
| `SUPABASE_SERVICE_ROLE_KEY` | Écritures serveur (route API / webhook) |
| `STRIPE_SECRET_KEY` | Création de la session de paiement (serveur) |
| `STRIPE_WEBHOOK_SECRET` | Vérification du webhook Stripe |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Redirection checkout (client) |
| `APIFY_TOKEN` | Extraction d'annonces (mode « lien » de l'outil terrain) |
| `ANTHROPIC_API_KEY` | (optionnel) enrichissement/synthèse pré-analyse terrain |

---

## 2. Stripe — acompte de réservation (1 500 €)

**Où :** `src/components/site/Reservation.tsx`
- `submit()` (≈ ligne 18) fait aujourd'hui `setSent(true)` — **aucun paiement**.
  Commentaire en place : `// Phase 1 : aucune transaction réelle, aucun backend.`
- Le numéro choisi est dans le state `slot` ; l'acompte dans `BRAND.deposit`
  (= `NEXT_PUBLIC_RESERVATION_DEPOSIT_EUR`).
- Le récap de configuration à facturer/joindre est dans `<ConfigRecap />`
  (lit le store `useConfig()` : `cladding`, options, terrasse, `houseTotal`,
  `delivery`, `grandTotal`).

**À faire :**
1. Route serveur `POST /api/checkout` → crée une **Stripe Checkout Session**
   (mode `payment`, montant = acompte) avec en `metadata` : `slot`, email, et
   le snapshot de configuration (depuis le store).
2. Au submit : appeler la route, rediriger vers `session.url`.
3. **Webhook** `POST /api/stripe/webhook` (`checkout.session.completed`) →
   marque le slot `reserved` en base (voir §3) et déclenche l'email de confirm.
4. Brancher l'état « payé » sur l'écran `<Confirmation />` (déjà stylé) au
   retour `success_url`.

---

## 3. Supabase — slots numérotés + liste d'attente + jauge live

**Où :**
- Sélecteur de numéros + jauge : `Reservation.tsx` (grille 1→12) et
  `src/components/ui/Gauge.tsx` (commentaire en place : *« Phase 1 : valeurs
  statiques, branchées sur Supabase Realtime en Phase 4 »*).
- Source des compteurs : `BRAND.reserved` / `BRAND.total` dans `site.ts`
  (aujourd'hui statiques : 4 / 12).
- Liste d'attente : `Reservation.tsx` → composant `<Waitlist />` (`setSent(true)`).

**À faire :**
1. Table `reservations` (`slot` unique 1..12, `status`, `email`, `config_json`,
   `stripe_session_id`, timestamps).
2. Table `waitlist` (`email`, `created_at`).
3. Remplacer `BRAND.reserved`/lecture des slots par une lecture Supabase
   (slots pris = désactivés, déjà géré visuellement via `taken`/`disabled`).
4. **Realtime** sur `reservations` → la jauge (`Gauge`) et la grille se mettent
   à jour en direct. Garder l'anti-double-réservation côté serveur (contrainte
   d'unicité sur `slot`).
5. `<Waitlist />` → insert dans `waitlist`.

---

## 4. Outil terrain — zonage GPU + extraction d'annonce

**Où :** `src/components/site/LandTool.tsx`
- **Géocodage BAN : déjà réel et fonctionnel** (`api-adresse.data.gouv.fr`,
  API publique sans clé). Calcule la distance route (haversine × 1,3 depuis
  Bayonne) et **auto-remplit le champ km du devis** (`c.setDistanceKm`). ✅
- **Le « feu » et le zonage sont aujourd'hui une heuristique dégradée** basée
  sur la précision du géocodage (`type`/`score`), **pas un vrai zonage**.
  Note déjà affichée à l'utilisateur : *« Zonage (U/AU vs A/N), ABF/SPR et
  servitudes confirmés en validation finale. »*
- Mode « lien d'annonce » : **dégradé**, attend un connecteur d'extraction.

**À faire :**
1. Brancher l'**API Géoportail de l'Urbanisme (GPU)** + cadastre IGN (APIs
   publiques) pour un vrai verdict zonage (U/AU vs A/N, ABF/SPR, servitudes).
   Alimenter `Result.zone` / `Result.feu` (vert/orange/rouge) avec le vrai
   résultat. Les 4 `STEPS` affichés correspondent déjà au pipeline cible.
2. Mode « annonce » : activer l'extraction via **Apify** (`APIFY_TOKEN`) →
   récupérer l'adresse depuis l'URL d'annonce, puis réutiliser le pipeline BAN.
3. Le formulaire de contact terrain (`setSent(true)`, ≈ ligne 392) → lead
   Supabase (table `leads` : email/tel + résultat d'analyse).

---

## 5. TODO légal (avant mise en ligne commerciale)

**Où :** `Reservation.tsx` → `<LegalNote />` (commentaire `TODO LÉGAL` en place).
- **Faire valider par l'avocat** la nature exacte de la somme : **arrhes vs
  acompte** (conséquences différentes en cas de rétractation).
- Rédiger / lier les **CGV** (le lien pointe aujourd'hui sur `#`, mention
  « en cours de validation juridique »).
- Conditions de **rétractation et de remboursement** (le front annonce
  « Remboursable. Sans engagement de construction. » — à sécuriser juridiquement).

---

## 6. Points de vigilance / ce qu'il ne faut PAS casser

- **Médias lourds & perf :** les vidéos sont **lazy-loadées** via
  `useVisible` (`src/components/arko3d/useVisible.ts`, `visible` démarre à
  `false`). Ne pas repasser à `true` : cela rechargerait toutes les vidéos au
  1er paint (LCP 0,8 s → 1,6 s). Le hero charge sa vidéo directement.
- **DA verrouillée :** palette « Argile & Encre » + Space Grotesk dans
  `globals.css` (`@theme`). Tous les montants via `site.ts` (pas de hard-code).
- **3D :** les composants `src/components/arko3d/*` (three.js) ne servent
  qu'à la route `/viewer` et à la génération de médias — **ils ne sont pas
  chargés sur la page d'accueil** (bundle séparé). Ne pas les importer dans le
  parcours principal.
- **Composants morts** (non importés, supprimables sans risque) :
  `src/components/site/Manifesto.tsx`, `src/components/site/CinematicReveal.tsx`.

---

## 7. Récap des points de câblage (carte rapide)

| Action utilisateur | Fichier | État actuel | À brancher |
|---|---|---|---|
| Réserver + payer acompte | `Reservation.tsx` `submit()` | `setSent(true)` | Stripe Checkout + webhook |
| Choix du numéro / jauge | `Reservation.tsx`, `Gauge.tsx` | statique (4/12) | Supabase + Realtime |
| Liste d'attente | `Reservation.tsx` `<Waitlist/>` | `setSent(true)` | insert Supabase |
| Analyse terrain (zonage) | `LandTool.tsx` `analyse()` | BAN réel + zonage heuristique | API GPU/IGN |
| Analyse via lien d'annonce | `LandTool.tsx` mode `annonce` | dégradé | Apify |
| Contact terrain | `LandTool.tsx` (≈ L392) | `setSent(true)` | lead Supabase |
| Devis (3 couches) | `Configurator.tsx` / `config-store.tsx` | **juste, ne pas toucher** | — |

Bon courage — le front t'attend, propre et rapide. 🟢
