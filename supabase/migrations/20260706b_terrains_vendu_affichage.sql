-- Ajouter 'vendu' comme statut mandataire
ALTER TABLE public.fiches_terrain
  DROP CONSTRAINT IF EXISTS fiches_terrain_statut_check;
ALTER TABLE public.fiches_terrain
  ADD CONSTRAINT fiches_terrain_statut_check
    CHECK (statut IN ('disponible', 'compromis', 'retire', 'vendu'));

-- Contrôle admin : afficher ou non le statut mandataire publiquement
ALTER TABLE public.fiches_terrain
  ADD COLUMN IF NOT EXISTS afficher_statut_mandataire boolean DEFAULT false;
