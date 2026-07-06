-- Pool commun de 12 exemplaires (One + Max confondus, numérotage 1→12 partagé)
-- Un slot pris = pris pour tous les modèles.
CREATE UNIQUE INDEX IF NOT EXISTS leads_slot_unique
  ON public.leads (slot)
  WHERE slot IS NOT NULL;
