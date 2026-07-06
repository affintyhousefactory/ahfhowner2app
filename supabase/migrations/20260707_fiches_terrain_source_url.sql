-- Traçabilité de l'annonce source utilisée pour pré-remplir la fiche via scraping.
ALTER TABLE public.fiches_terrain
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS source_reference text;

COMMENT ON COLUMN public.fiches_terrain.source_url IS
  'URL de l''annonce externe (autre plateforme) utilisée pour pré-remplir la fiche via l''outil d''analyse.';
COMMENT ON COLUMN public.fiches_terrain.source_reference IS
  'Référence de l''annonce sur la plateforme source (si extraite), pour recoupement manuel.';
