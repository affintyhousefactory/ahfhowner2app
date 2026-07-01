-- Contrainte unicité : un seul dossier actif par lead
-- Sans cette contrainte, le upsert onConflict:"lead_id" échouait silencieusement
ALTER TABLE public.dossiers
  ADD CONSTRAINT dossiers_lead_id_unique UNIQUE (lead_id);

-- Réparation : créer les dossiers manquants pour les leads déjà affectés
INSERT INTO public.dossiers (lead_id, mandataire_id, statut, email_sent_at, created_at)
SELECT l.id, l.mandataire_id, 'proposé', l.affecte_at, COALESCE(l.affecte_at, now())
FROM public.leads l
LEFT JOIN public.dossiers d ON d.lead_id = l.id
WHERE l.mandataire_id IS NOT NULL
  AND d.id IS NULL;
