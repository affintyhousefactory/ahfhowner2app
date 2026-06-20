-- ADR-025 — Ajout colonne source à recherche_terrain
-- Permet de distinguer les leads issus du configurateur vs de la page /rechercheterrain

ALTER TABLE recherche_terrain
  ADD COLUMN IF NOT EXISTS source text DEFAULT 'rechercheterrain'
    CHECK (source IS NULL OR source IN ('rechercheterrain', 'configurateur'));
