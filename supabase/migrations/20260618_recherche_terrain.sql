-- ADR-025 — Recherche personnalisée de terrains
-- Leads qualifiés issus du formulaire /rechercheterrain

CREATE TABLE IF NOT EXISTS recherche_terrain (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at  timestamptz DEFAULT now() NOT NULL,
  nom         text        NOT NULL,
  telephone   text        NOT NULL,
  email       text        NOT NULL,
  -- Tableau de zones : [{commune: string, cp: string}] — max 5
  zones       jsonb       NOT NULL,
  accepte_cgv boolean     NOT NULL DEFAULT false,
  statut      text        NOT NULL DEFAULT 'nouveau'
                          CHECK (statut IN ('nouveau', 'en_cours', 'traite')),
  notes       text        -- usage interne AHF uniquement
);

-- Index pour les requêtes back-office courantes
CREATE INDEX IF NOT EXISTS idx_recherche_terrain_statut   ON recherche_terrain(statut);
CREATE INDEX IF NOT EXISTS idx_recherche_terrain_created  ON recherche_terrain(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recherche_terrain_email    ON recherche_terrain(email);

-- RLS : seul service_role peut lire/mettre à jour
-- Les inserts sont autorisés via anon (formulaire public)
ALTER TABLE recherche_terrain ENABLE ROW LEVEL SECURITY;

-- Lecture/update/delete réservés au service_role (bypass RLS automatique)
-- Aucune policy SELECT/UPDATE → anon ne peut pas lire

-- Insert public (formulaire visiteur)
CREATE POLICY "recherche_terrain_insert_public"
  ON recherche_terrain
  FOR INSERT
  TO anon
  WITH CHECK (accepte_cgv = true);
