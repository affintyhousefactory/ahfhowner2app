# Brief stratégique — Dashboard Admin HOWNER
> Fichier à passer à Claude Code · `docs/BRIEF_ADMIN.md`

---

## Contexte projet

**Société** : Affinity House Factory (AHF) — SAS, Bayonne  
**Repo** : `ahfhowner2app` — Next.js 14 App Router · Supabase · Vercel · Brevo  
**Accès** : rôle `admin` uniquement — jamais exposé au public ni aux mandataires  
**Référence financière** : `06-Contrat-Sous-Traitance-AHF.docx` (grille de rémunération article 4)

---

## Architecture — Route group dédié

```
app/
└── (admin)/
    ├── layout.tsx              # Auth guard rôle = admin
    ├── page.tsx                # Home — KPIs + vue synthétique
    ├── leads/
    │   ├── page.tsx            # Liste tous les leads
    │   ├── [id]/page.tsx       # Fiche lead détaillée
    │   └── nouveau/page.tsx    # Création manuelle lead
    ├── mandataires/
    │   ├── page.tsx            # Liste mandataires + perf
    │   ├── [id]/page.tsx       # Fiche mandataire complète
    │   └── nouveau/page.tsx    # Création manuelle mandataire
    ├── affectations/
    │   └── page.tsx            # Matching leads ↔ mandataires
    └── settings/
        └── page.tsx            # Config zones, packs, taux
```

⚠️ `app/(public)/` et `app/(mandataire)/` ne doivent jamais être modifiés depuis ce scope.

---

## Tables Supabase concernées

```sql
-- Leads (source : formulaires site web + création manuelle admin)
leads (
  id uuid PK,
  source: 'web_contact' | 'web_configurateur' | 'web_terrain' | 'admin_manuel',
  statut: 'nouveau' | 'qualifié' | 'affecté' | 'en_cours' | 'finalisé' | 'perdu',
  -- Identité
  prenom text,
  nom text,
  email text,
  tel text,
  -- Projet
  modele text,                  -- Arko One | Arko Max
  pack_label text,              -- Pack Essentiel | Étendu | Département
  budget_terrain numeric,
  total_estime numeric,
  -- Localisation souhaitée
  adresse_recherche text,
  code_postal text,
  commune text,
  departement text,
  zones_multiples text[],       -- multi-adresse comme défini côté mandataire
  -- PLU (données GPU API)
  plu_parcelle text,
  plu_adresse text,
  plu_zone text,
  plu_typedoc text,
  plu_datappro text,
  plu_libelong text,
  plu_prescriptions text,
  plu_servitudes text,
  -- Suivi
  mandataire_id uuid → mandataires,
  affecte_at timestamp,
  notes_ahf text,
  created_at timestamp
)

-- Mandataires (créés via signup portail ou manuellement par admin)
mandataires (
  id uuid PK,
  user_id uuid → auth.users,   -- null si créé manuellement sans compte
  statut: 'en_attente' | 'actif' | 'suspendu',
  prenom text,
  nom text,
  email text,
  tel text,
  siret text,
  reseau_carte_t text,
  carte_t_numero text,
  zone_activite text[],         -- communes / codes postaux / départements couverts
  slug text UNIQUE,
  contrat_signe_at timestamp,
  contrat_url text,
  created_at timestamp
)

-- Dossiers (affectation lead → mandataire)
dossiers (
  id uuid PK,
  lead_id uuid → leads,
  mandataire_id uuid → mandataires,
  statut: 'proposé' | 'accepté' | 'refusé' | 'en_cours' | 'finalisé',
  pack_label text,
  pack_prix_ttc numeric,        -- prix client
  remuneration_mandataire_ht numeric, -- selon grille contrat
  marge_ahf_ht numeric,         -- calculée automatiquement
  acompte_client numeric,       -- 1 500 € retenu AHF
  acte_notarie_at timestamp,    -- condition déclenchement paiement
  encaissement_ahf_at timestamp,
  notes text,
  created_at timestamp
)
```

**Policies RLS admin :**
- Rôle `admin` : accès SELECT/INSERT/UPDATE/DELETE sur toutes les tables
- Vérification via `auth.jwt() ->> 'role' = 'admin'` ou custom claim Supabase

---

## Page d'accueil — KPI Dashboard

### KPIs financiers (basés sur le contrat article 4)

**Grille de référence intégrée :**

| Pack | Prix client TTC | Rémunération mandataire HT | Marge AHF nette | Acompte AHF |
|---|---|---|---|---|
| Essentiel | 4 900 € | 3 600 € | ~1 300 € | 1 500 € |
| Étendu | 7 300 € | 5 500 € | ~1 800 € | 1 500 € |
| Département | 11 200 € | 8 400 € | ~2 800 € | 1 500 € |

**KPIs à afficher (Recharts) :**
- Chiffre d'affaires brut (somme `pack_prix_ttc` dossiers finalisés)
- Revenus AHF nets (somme `marge_ahf_ht` + acomptes retenus)
- Rémunérations mandataires dues / versées
- CAC — Coût d'Acquisition Client (budget marketing / nb leads — saisie manuelle budget)
- Taux de conversion lead → dossier affecté → finalisé (entonnoir)
- Leads par statut (donut chart)
- Dossiers par statut (donut chart)
- Performance par mandataire (bar chart — nb dossiers finalisés, CA généré)

**Métriques temps réel :**
- Leads en attente d'affectation (badge alerte si > 48h sans affectation)
- Mandataires en attente de validation
- Dossiers sans réponse mandataire > 48h (alerte contractuelle)

---

## Gestion des Leads

### Liste leads (`/admin/leads`)
- Tableau avec filtres : statut, pack, modèle, département, date
- Colonnes : nom, email, pack, modèle, commune, statut, mandataire affecté, date
- Badge statut coloré
- Recherche fulltext
- Export CSV

### Fiche lead (`/admin/leads/[id]`)

**Zone 1 — Identité et projet**
- Coordonnées complètes (nom, email, tel)
- Modèle ARKO souhaité
- Pack souscrit + budget terrain
- Estimation totale
- Source (web configurateur / web terrain / manuel)
- Notes AHF (textarea libre)

**Zone 2 — Localisation et carte**
- Adresse recherche + commune + code postal + département
- Zones multiples si renseignées
- **Carte interactive** (Mapbox GL ou Leaflet) centré sur l'adresse PLU du lead
- Marqueur sur la parcelle cadastrale si `plu_adresse` renseigné
- Affichage des mandataires actifs dans le rayon → points colorés sur la carte

**Zone 3 — Données PLU**
- Affichage de tous les champs PLU renseignés (même structure que template email T2) :
  PLU_PARCELLE · PLU_ADRESSE · PLU_ZONE · PLU_TYPEDOC · PLU_DATAPPRO · PLU_LIBELONG · PLU_PRESCRIPTIONS · PLU_SERVITUDES
- **Bouton "Recalculer PLU"** : relance l'appel GPU API avec l'adresse du lead (même logique que `/terrain` du site public)
- Résultats mis à jour dans la table `leads`

**Zone 4 — Affectation mandataire**
Cf. section "Affectation" ci-dessous.

**Zone 5 — Historique**
- Timeline des actions (affectation, changement statut, notes, emails envoyés)

### Création manuelle lead (`/admin/leads/nouveau`)
- Formulaire complet reprenant tous les champs de la table `leads`
- Recherche PLU intégrée par adresse (GPU API — même composant que `/terrain`)
- Sélection pack + calcul automatique marge AHF

---

## Affectation Mandataire

### Logique de matching géographique

Un lead a une **zone de recherche** définie par une ou plusieurs des dimensions suivantes :
- Adresse précise
- Code postal
- Département (64 ou 40)
- Multi-adresse (tableau `zones_multiples`)

Un mandataire a une **zone d'activité** (`zone_activite text[]`) qui peut contenir des communes, codes postaux ou départements.

**Algorithme de suggestion (côté serveur) :**
```
1. Extraire département du lead (code postal ou champ département)
2. Filtrer mandataires actifs dont zone_activite ∩ zones_lead ≠ ∅
3. Trier par : nb dossiers actifs ASC (charge de travail), puis distance ASC
4. Retourner top 3 mandataires suggérés
```

### Interface d'affectation (dans fiche lead)
- Liste des mandataires suggérés (avec badge "zone compatible")
- Affichage sur carte : mandataires actifs dans la zone (pin violet)
- Sélection manuelle possible (tous mandataires actifs)
- Bouton **"Affecter"** → crée un `dossier` avec statut `proposé` + email Brevo T4 au mandataire

### Page affectations globale (`/admin/affectations`)
- Vue kanban ou tableau : leads non affectés / leads affectés / dossiers en cours
- Drag & drop lead → mandataire (optionnel V2)

---

## Gestion des Mandataires

### Liste mandataires (`/admin/mandataires`)
- Tableau : nom, email, réseau carte T, zones, statut, nb dossiers, CA généré
- Filtres : statut, département, réseau
- Actions rapides : valider, suspendre

### Fiche mandataire (`/admin/mandataires/[id]`)

**Zone 1 — Identité**
- Coordonnées, SIRET, réseau carte T, n° carte T
- Zones d'activité (liste éditable)
- Statut + date validation

**Zone 2 — Espace documentaire**
- Contrat signé (PDF Yousign — lecture + téléchargement)
- Documents associés aux dossiers
- Attestation RC Pro (upload admin)

**Zone 3 — Dossiers**
- Liste dossiers affectés à ce mandataire avec statut
- Jalons renseignés par le mandataire

**Zone 4 — Performance**
- Nb dossiers acceptés / refusés / finalisés
- CA généré (pour AHF)
- Rémunérations versées / dues
- Taux de finalisation

**Zone 5 — Actions admin**
- Valider mandataire (en_attente → actif)
- Suspendre avec motif
- Envoyer email manuel (Brevo)
- Vérifier SIRET via **Pappers MCP** (bouton intégré)

### Création manuelle mandataire (`/admin/mandataires/nouveau`)
- Formulaire complet (sans compte Supabase Auth — `user_id = null`)
- Invitation email pour créer son compte (lien magic link Supabase)
- Zones d'activité sélectionnables (autocomplete communes/depts)

---

## Design

- **Fond** : `#1a1a18` (sombre) pour le layout principal
- **Surface cards** : `#252521`
- **Accents** : violet Howner `#7469F4` + vert succès `#2d6b27`
- **Alertes** : orange `#e07b28`
- **Typographie** : Arial (données denses) — Georgia pour les titres de section
- **Graphiques** : Recharts (déjà dans le projet)
- **Carte** : Mapbox GL JS ou Leaflet (à décider selon budget token Mapbox)
- **Tables** : composant TanStack Table (tri, filtre, pagination côté client)

---

## Intégrations techniques

| Intégration | Usage | Statut |
|---|---|---|
| GPU API (Géoportail Urbanisme) | Recalcul PLU depuis fiche lead | ✅ déjà développé sur /terrain |
| Supabase MCP | Tables + RLS + Storage | ✅ connecté |
| Brevo | Emails T4 (affectation), T5 (rappel) | ✅ configuré |
| Pappers MCP | Vérification SIRET mandataire | ✅ connecté |
| Mapbox / Leaflet | Carte leads + mandataires | 🔲 à choisir |
| n8n | Automatisation rappels 48h | ✅ VPS actif |

---

## Automatisations n8n associées

```
Workflow 1 — Rappel dossier non répondu
  Trigger : dossier.statut = 'proposé' AND now() - created_at > 40h
  Action : email Brevo T5 au mandataire + alerte dashboard admin

Workflow 2 — Alerte lead sans affectation
  Trigger : lead.statut = 'qualifié' AND mandataire_id IS NULL AND now() - created_at > 48h
  Action : notification dashboard admin (badge rouge)

Workflow 3 — KPI hebdomadaire
  Trigger : chaque lundi 9h
  Action : email résumé KPIs à contact@affinityhousefactory.com
```

---

## Ordre d'implémentation

```
Étape 1 — Fondations
  □ Tables Supabase leads + dossiers (ajout colonnes financières)
  □ RLS policies rôle admin
  □ Middleware auth guard + route group (admin)
  □ Layout admin (sidebar sombre, navigation)

Étape 2 — KPI Dashboard home
  □ Agrégation KPIs depuis Supabase (server component)
  □ Graphiques Recharts (CA, entonnoir, leads par statut)
  □ Badges alertes (leads sans affectation, dossiers > 48h)

Étape 3 — Gestion leads
  □ Liste leads avec filtres
  □ Fiche lead (identité + PLU + notes)
  □ Recalcul PLU depuis fiche (GPU API)
  □ Carte Mapbox/Leaflet

Étape 4 — Affectation
  □ Algorithme matching géographique
  □ Interface sélection mandataire depuis fiche lead
  □ Création dossier + email Brevo T4

Étape 5 — Gestion mandataires
  □ Liste mandataires + fiche détaillée
  □ Création manuelle mandataire
  □ Validation/suspension
  □ Vérification Pappers MCP

Étape 6 — Compléments
  □ Export CSV leads
  □ Espace documentaire mandataire
  □ Workflows n8n rappels
  □ KPI hebdomadaire email
```

---

## Contraintes métier (extrait contrat article 4)

- La **marge AHF** est calculée automatiquement : `pack_prix_ttc - remuneration_mandataire_ht`
- L'**acompte 1 500 €** est toujours retenu par AHF, non reversé au mandataire
- La rémunération mandataire n'est due qu'après **acte notarié + encaissement AHF** (`acte_notarie_at` + `encaissement_ahf_at` renseignés)
- Délai légal facturation mandataire : **15 jours** après acte — règlement AHF **30 jours** réception facture
- En cas d'échec (pas d'acte) : **aucune rémunération** mandataire
