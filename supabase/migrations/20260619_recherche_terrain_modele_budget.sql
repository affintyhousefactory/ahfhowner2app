-- ADR-025 — Ajout colonnes modele et budget à recherche_terrain

ALTER TABLE recherche_terrain
  ADD COLUMN IF NOT EXISTS budget text,
  ADD COLUMN IF NOT EXISTS modele text
    CHECK (modele IS NULL OR modele IN ('Arko One', 'Arko Max'));
