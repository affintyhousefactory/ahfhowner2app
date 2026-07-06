CREATE TABLE public.fiches_terrain (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  mandataire_id uuid NOT NULL REFERENCES public.mandataires(id) ON DELETE CASCADE,
  reference_interne text,
  commune text NOT NULL,
  secteur text,
  prix integer,
  surface integer,
  zonage text,
  urbanisme_detail text,
  acces_grue text,
  pente_pct integer,
  reseaux text,
  assainissement text,
  compatibilite_arko text CHECK (compatibilite_arko IN ('precompatible', 'a_confirmer', 'non_compatible')),
  modele_arko text CHECK (modele_arko IN ('one', 'max', 'both')),
  statut text DEFAULT 'disponible' NOT NULL CHECK (statut IN ('disponible', 'compromis', 'retire')),
  date_derniere_verif date,
  reserves text[] DEFAULT '{}',
  notes text,
  photos jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.fiches_terrain ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mandataire_own_terrains" ON public.fiches_terrain
  FOR ALL USING (
    mandataire_id IN (SELECT id FROM public.mandataires WHERE user_id = auth.uid())
  );

CREATE INDEX fiches_terrain_mandataire_idx ON public.fiches_terrain (mandataire_id);
CREATE INDEX fiches_terrain_statut_idx ON public.fiches_terrain (statut);
