ALTER TABLE public.mandataires
  ADD COLUMN IF NOT EXISTS suspension_raison TEXT;

ALTER TABLE public.dossiers
  ADD COLUMN IF NOT EXISTS suspension_raison TEXT;
