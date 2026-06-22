-- ADR-007 (partiel) — Table leads : réservations configurateur avec analyse PLU optionnelle
-- Données identité + configuration + parcelle/PLU (si consentement)
-- Insert public via anon (Turnstile vérifié côté serveur).
-- Lecture/update réservés service_role.

CREATE TABLE IF NOT EXISTS leads (
  id               uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at       timestamptz DEFAULT now() NOT NULL,

  -- Identité
  prenom           text        NOT NULL,
  nom              text        NOT NULL,
  email            text        NOT NULL,
  tel              text,

  -- Réservation
  slot             smallint    CHECK (slot BETWEEN 1 AND 12),
  statut           text        NOT NULL DEFAULT 'nouveau'
                               CHECK (statut IN ('nouveau', 'contacte', 'devis_envoye', 'signe', 'annule')),
  notes            text,       -- usage interne AHF

  -- Configuration Arko
  produit          text,       -- "Arko One" / "Arko Max"
  surface          text,       -- "29 m²" etc.
  house_total      integer,    -- TTC en €
  delivery         integer,    -- livraison estimée TTC, null si pack terrain
  grand_total      integer,    -- total estimé TTC
  terrain_mode     text        CHECK (terrain_mode IS NULL OR terrain_mode IN ('have', 'pack')),
  pack_terrain     text,       -- 'essentiel' | 'etendu' | 'departement'
  config_json      jsonb,      -- ensemble des choix (bardage, cuisine, chambre, etc.)
  options_labels   text[],     -- libellés des options sélectionnées

  -- Analyse PLU (consentement explicite requis)
  plu_consent      boolean     NOT NULL DEFAULT false,
  parcelle_idu     text,       -- ex: 64102000BS0120
  plu_adresse      text,       -- libellé BAN géocodé
  plu_zone         text,       -- libellé court (ex: UBp)
  plu_libelong     text,       -- description longue (ex: Vocation principale habitat)
  plu_typezone     text,       -- U | AU | A | N
  plu_typedoc      text,       -- PLU | CC | PLUi | POS | etc.
  plu_etat_doc     text,       -- opposable | approuve | en_revision | …
  plu_datappro     text,       -- ex: 20250927
  plu_prescriptions text[],   -- liste des prescriptions détectées
  plu_servitudes   text[]      -- types de servitudes détectés
);

-- Index back-office
CREATE INDEX IF NOT EXISTS idx_leads_email    ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_statut   ON leads(statut);
CREATE INDEX IF NOT EXISTS idx_leads_slot     ON leads(slot);
CREATE INDEX IF NOT EXISTS idx_leads_created  ON leads(created_at DESC);

-- RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Insert public (formulaire configurateur)
CREATE POLICY "leads_insert_public"
  ON leads
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Lecture/update réservés service_role (bypass RLS automatique)
