-- Colonnes profil professionnel enrichi + géolocalisation mandataire
alter table public.mandataires
  add column if not exists statut_professionnel  text,      -- "Mandataire immobilier" | "Agent commercial" | …
  add column if not exists reseau_type           text,      -- "Réseau" | "Agence" | "Indépendant"
  add column if not exists adresse_principale    text,      -- adresse personnelle géocodée (Google Places)
  add column if not exists cp_principal          text,
  add column if not exists ville_principale      text,
  add column if not exists lat                   numeric,   -- géolocalisation pour calcul d'affectation
  add column if not exists lon                   numeric,
  add column if not exists rayon_intervention    text,      -- "20km" | "50km" | "80km" | "département" | "région"
  add column if not exists delai_rappel          text,      -- "moins_2h" | "moins_24h" | "48h"
  add column if not exists specialites           text[];    -- terrain | maison_individuelle | investissement | …
