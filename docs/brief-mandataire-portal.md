# Brief stratégique — Portail Mandataire HOWNER
> Fichier à passer à Claude Code · `docs/BRIEF_MANDATAIRE.md`

---

## Contexte projet

**Société** : Affinity House Factory (AHF) — SAS, Bayonne  
**Produit** : HOWNER — marque ARKO (Arko One 20 m², Arko Max 40 m²)  
**Repo** : `ahfhowner2app` — Next.js 14 App Router · Supabase · Vercel · Brevo  
**Référence légale** : `06-Contrat-Sous-Traitance-AHF.docx` (contrat-cadre mandataire)

---

## Architecture — Route group dédié

```
app/
└── (mandataire)/
    ├── layout.tsx         # Auth guard rôle = mandataire
    ├── page.tsx           # Dashboard mandataire
    ├── dossiers/
    │   ├── page.tsx       # Liste des dossiers reçus
    │   └── [id]/page.tsx  # Détail dossier + terrain
    ├── terrain/
    │   └── [id]/page.tsx  # Fiche terrain à constituer
    └── profil/
        └── page.tsx       # Profil public + documents
```

⚠️ Ne jamais modifier `app/(public)/` sans instruction explicite.

---

## Tables Supabase concernées

```sql
mandataires (
  id uuid PK,
  user_id uuid → auth.users,
  statut: 'en_attente' | 'actif' | 'suspendu',
  contrat_signe_at timestamp,
  contrat_url text,           -- Supabase Storage
  zone_activite text[],       -- communes / départements couverts
  reseau_carte_t text,        -- ex. IAD, SAFTI…
  carte_t_numero text,
  site_web text,
  description text,
  slug text UNIQUE,           -- pour profil public /mandataires/[slug]
  created_at timestamp
)

dossiers (
  id uuid PK,
  mandataire_id uuid → mandataires,
  lead_id uuid → leads,       -- lead HOWNER source
  statut: 'proposé' | 'accepté' | 'refusé' | 'en_cours' | 'finalisé',
  client_nom text,
  client_email text,
  client_tel text,
  modele text,
  zone_recherche text,
  budget_terrain numeric,
  notes_ahf text,
  accepted_at timestamp,
  created_at timestamp
)

terrains (
  id uuid PK,
  dossier_id uuid → dossiers,
  adresse text,
  commune text,
  code_postal text,
  surface_m2 numeric,
  prix numeric,
  plu_zone text,
  plu_statut text,
  documents text[],           -- Supabase Storage
  rapport_compatibilite_url text,
  created_at timestamp
)

documents (
  id uuid PK,
  owner_id uuid,
  owner_type text,            -- 'mandataire' | 'dossier'
  nom text,
  type text,                  -- 'contrat' | 'rapport' | 'autre'
  url text,                   -- Supabase Storage
  created_at timestamp
)
```

**Policies RLS :**
- `mandataires` : SELECT/UPDATE sur `user_id = auth.uid()` uniquement
- `dossiers` : SELECT/UPDATE sur `mandataire_id = (SELECT id FROM mandataires WHERE user_id = auth.uid())`
- `terrains` : accès via `dossier_id` lié au mandataire connecté
- `documents` : accès via `owner_id` lié au mandataire connecté

---

## Positionnement différenciateur vs immo-data.fr

immo-data.fr est un outil d'analyse de marché (DVF, cadastre, DPE) facturé 49–89 €/mois, qui génère des leads vendeurs génériques. Le portail HOWNER est fondamentalement différent sur 8 points — à valoriser dans la landing signup et dans l'UX du dashboard.

| Dimension | immo-data.fr | Portail Mandataire HOWNER |
|---|---|---|
| Nature du lead | Vendeur qui veut estimer son bien | Acheteur qui a choisi son modèle + versé acompte |
| Prospection | À la charge du mandataire | Zéro — dossier entrant qualifié |
| Critères techniques | Génériques (prix/m²) | Cahier des Charges ARKO précis (Annexe 1) |
| PLU | Absent | GPU API intégré + score compatibilité auto |
| Frais | 49–89 €/mois | 0 € fixe — 100 % success fee |
| Rapport client | Estimation de valeur foncière | Rapport compatibilité terrain/ARKO (Annexe 2) |
| Relation | Marketplace anonyme | Contrat-cadre bilatéral signé |
| Formation produit | Aucune | Module ARKO intégré |

---

## Features V1

### Signup / Onboarding
- Landing dédiée mettant en avant les 8 différenciateurs : dossiers qualifiés entrants, 0 € frais fixes, grille de rémunération transparente, outils PLU intégrés
- Formulaire inscription → création compte Supabase rôle `mandataire`
- Statut initial : `en_attente` (validation manuelle par AHF)
- Signature contrat en ligne : **Yousign API** (eIDAS, hébergé France)
- Stockage contrat signé : Supabase Storage → `documents`
- Email Brevo onboarding (template T3 à créer — params uppercase)

### Dashboard mandataire
- KPI personnels : dossiers actifs, dossiers finalisés, CA généré
- Grille de rémunération visible (Essentiel 3 600 € / Étendu 5 500 € / Département 8 400 €)

### Gestion des dossiers
- Liste dossiers reçus d'AHF avec statut visuel
- **Accepter / Refuser** un dossier (délai contractuel : 48 h)
- Fiche dossier : coordonnées client, modèle ARKO, budget terrain, notes AHF
- Jalons à renseigner : 1er terrain identifié, offre déposée, compromis, acte notarié

### Fiche terrain
- Saisie : adresse, commune, surface, prix, PLU, orientation, réseaux
- Upload documents (Supabase Storage)
- Génération rapport compatibilité terrain / ARKO (modèle Annexe 2 du contrat)

### Profil public
- URL : `/mandataires/[slug]`
- Zones couvertes, description activité, réseau carte T
- Type fiche annuaire immobilier

### Espace documentaire
- Contrat AHF signé (lecture seule)
- Documents de mission par dossier

---

## Design

- Fond clair `#f4f4f0` · Accents violet Howner `#7469F4`
- Typographie : Georgia (serif) + Arial
- Cartes dossiers avec badge statut coloré
- Mobile-first (usage terrain)

---

## Emails Brevo associés

| Template | Déclencheur | Params clés |
|---|---|---|
| T3 Onboarding mandataire | Inscription validée | NOM, PRENOM, LIEN_CONTRAT |
| T4 Nouveau dossier | AHF affecte un dossier | NOM, CLIENT_NOM, MODELE, PACK_LABEL, BUDGET |
| T5 Rappel 48h | Dossier non répondu | NOM, DOSSIER_ID, DEADLINE |

---

## Ordre d'implémentation

```
Étape 1 — Fondations
  □ Tables Supabase + RLS (via MCP)
  □ Middleware auth guard rôle mandataire
  □ Route group (mandataire) + layouts vides

Étape 2 — Onboarding
  □ Landing signup (8 différenciateurs mis en avant)
  □ Formulaire inscription
  □ Email Brevo T3 onboarding

Étape 3 — Dashboard + Dossiers
  □ Liste dossiers avec compte à rebours 48h
  □ Accepter / Refuser dossier + notification AHF
  □ Timeline jalons par dossier
  □ Simulateur de revenus

Étape 4 — Fiche terrain différenciante
  □ Intégration GPU API "Vérifier PLU"
  □ Checklist Cahier des Charges ARKO
  □ Score compatibilité automatique
  □ Génération rapport PDF Annexe 2

Étape 5 — Compléments
  □ Signature Yousign
  □ Profil public /mandataires/[slug]
  □ Espace documentaire complet
```

---

## Contraintes métier (extrait contrat)

**Processus et délais (articles 3 et 4)**
- AHF transmet le dossier dans les **7 jours ouvrés** après souscription du Pack par le Client (article 3.1)
- Le Mandataire dispose de **48 heures** pour refuser — sans réponse, AHF peut réaffecter (article 3.2)
- Le Mandataire signe un **mandat de recherche exclusif directement avec le Client** — AHF n'est pas partie à ce mandat (article 3.4)
- Le **rapport compatibilité (Annexe 2)** doit être remis à AHF et au Client **avant toute offre d'achat** — étape bloquante (article 5.2)
- Rémunération uniquement après **acte notarié + encaissement AHF** (conditions cumulatives — article 4.2)
- Le Mandataire émet sa facture dans les **15 jours** après acte notarié — règlement AHF sous **30 jours** réception (article 4.3)
- En cas d'échec : **aucune rémunération** due au Mandataire (article 4.4)

**Obligations permanentes (article 5)**
- Maintenir carte T valide pendant toute la durée (suspension = résiliation immédiate)
- RC Pro obligatoire, justificatif à première demande d'AHF
- Formation continue ALUR **14 heures/an** (loi ALUR — obligation légale)
- Non-démarchage des Clients HOWNER **12 mois** après résiliation (article 5.3)

**RGPD — Mandataire = Sous-traitant (article 8)**
- AHF = Responsable de traitement · Mandataire = Sous-traitant au sens de l'article 28 RGPD
- Données transmises par AHF : nom, prénom, email, téléphone, périmètre de recherche, modèle ARKO, budget
- Notification de violation de données à AHF sous **48 heures**
- Suppression ou restitution de toutes les données Client à l'issue de chaque mission (article 8.5)
- Stockage sur supports sécurisés, accès limité aux seules personnes impliquées dans la mission

**Confidentialité et preuve (articles 9 et 12)**
- Obligation de confidentialité survivant **5 ans** après cessation du contrat
- L'acceptation d'un dossier via le portail **vaut acceptation formelle** (article 12 — preuve électronique)
- Tout échange via le portail (notifications jalons, refus) est horodaté et constitue une preuve opposable

**Exclusivité géographique (article 10)**
- Non exclusive par défaut — AHF peut mandater plusieurs partenaires sur une même zone
- Exclusivité possible uniquement par **avenant signé** — délai de prise en charge 48h si exclusivité accordée
