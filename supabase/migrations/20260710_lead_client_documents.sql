-- GED Client : documents internes destinés à la préparation d'un devis, distincts du
-- dossier partagé avec le mandataire (table lead_documents). Réutilise le bucket storage
-- lead-documents déjà créé (préfixe de chemin "client/{leadId}/..." côté application).
create table if not exists public.lead_client_documents (
  id             uuid primary key default gen_random_uuid(),
  lead_id        uuid references public.leads(id) on delete cascade not null,
  nom            text not null,
  bucket_path    text not null,
  type_mime      text,
  taille_ko      integer,
  created_at     timestamptz default now()
);

alter table public.lead_client_documents enable row level security;

create policy "admin_lead_client_documents_all" on public.lead_client_documents
  for all
  using  ((auth.jwt() ->> 'role') = 'admin')
  with check ((auth.jwt() ->> 'role') = 'admin');
