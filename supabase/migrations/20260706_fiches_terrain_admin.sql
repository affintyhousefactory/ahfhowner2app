ALTER TABLE public.fiches_terrain
  ADD COLUMN IF NOT EXISTS statut_admin text DEFAULT 'en_attente' NOT NULL
    CHECK (statut_admin IN ('en_attente', 'valide', 'refuse', 'publie')),
  ADD COLUMN IF NOT EXISTS admin_commentaire text,
  ADD COLUMN IF NOT EXISTS publie_at timestamptz,
  ADD COLUMN IF NOT EXISTS description_publique text,
  ADD COLUMN IF NOT EXISTS titre text;

CREATE INDEX IF NOT EXISTS fiches_terrain_statut_admin_idx
  ON public.fiches_terrain (statut_admin);
