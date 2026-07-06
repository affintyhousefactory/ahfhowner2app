-- Point de contact pour ce bien (référent externe : propriétaire, notaire, agence partenaire...).
ALTER TABLE public.fiches_terrain
  ADD COLUMN IF NOT EXISTS contact_nom text,
  ADD COLUMN IF NOT EXISTS contact_prenom text,
  ADD COLUMN IF NOT EXISTS contact_telephone text,
  ADD COLUMN IF NOT EXISTS contact_role text,
  ADD COLUMN IF NOT EXISTS contact_role_detail text;

COMMENT ON COLUMN public.fiches_terrain.contact_role IS
  'Rôle du point de contact : proprietaire, notaire, agence_partenaire, autre_mandataire, autre.';
