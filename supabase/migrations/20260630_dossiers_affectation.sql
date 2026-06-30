-- Numéro court visible côté mandataire (#XXXX)
CREATE SEQUENCE IF NOT EXISTS public.leads_number_seq START WITH 1000;
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS lead_number   INTEGER DEFAULT nextval('public.leads_number_seq'),
  ADD COLUMN IF NOT EXISTS delai_projet  TEXT,           -- Moins de 6 mois / 6-12 mois / …
  ADD COLUMN IF NOT EXISTS description_projet TEXT;     -- texte libre pour vue anonymisée

-- Backfill des leads existants sans numéro
UPDATE public.leads SET lead_number = nextval('public.leads_number_seq') WHERE lead_number IS NULL;

-- Dossiers : suivi acceptation + email
ALTER TABLE public.dossiers
  ADD COLUMN IF NOT EXISTS accepted_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ;

-- RLS dossiers — mandataire lit et met à jour ses propres dossiers
ALTER TABLE public.dossiers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mandataire_read_own_dossiers"   ON public.dossiers;
DROP POLICY IF EXISTS "mandataire_update_own_dossiers" ON public.dossiers;

CREATE POLICY "mandataire_read_own_dossiers" ON public.dossiers
  FOR SELECT USING (
    mandataire_id IN (SELECT id FROM public.mandataires WHERE user_id = auth.uid())
  );

CREATE POLICY "mandataire_update_own_dossiers" ON public.dossiers
  FOR UPDATE USING (
    mandataire_id IN (SELECT id FROM public.mandataires WHERE user_id = auth.uid())
  );
