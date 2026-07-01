-- Statut commercial indépendant du statut d'affectation
-- Suit l'avancement de la relation client (appels, documents, relances…)
alter table public.leads
  add column if not exists statut_commercial text default 'nouveau'
    check (statut_commercial in (
      'nouveau', 'a_rappeler', 'contact_pris', 'en_discussion',
      'devis_envoye', 'chaud', 'signe', 'perdu'
    ));
