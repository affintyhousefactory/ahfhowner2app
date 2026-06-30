-- Adresse postale du CLIENT (distincte de l'adresse terrain de recherche)
alter table public.leads
  add column if not exists adresse_postale_client text,
  add column if not exists cp_client             text,
  add column if not exists ville_client          text;

-- ── Table documents lead ────────────────────────────────────────────────────
create table if not exists public.lead_documents (
  id             uuid primary key default gen_random_uuid(),
  lead_id        uuid references public.leads(id) on delete cascade not null,
  mandataire_id  uuid references public.mandataires(id) on delete set null,
  nom            text not null,
  bucket_path    text not null,
  type_mime      text,
  taille_ko      integer,
  created_at     timestamptz default now()
);

alter table public.lead_documents enable row level security;

create policy "admin_lead_documents_all" on public.lead_documents
  for all
  using  ((auth.jwt() ->> 'role') = 'admin')
  with check ((auth.jwt() ->> 'role') = 'admin');

-- ── Bucket stockage documents lead ─────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'lead-documents',
  'lead-documents',
  false,
  10485760,  -- 10 MB max par fichier
  array[
    'application/pdf',
    'image/png', 'image/jpeg', 'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
on conflict (id) do nothing;

-- RLS storage : accès admin uniquement (service_role bypass en routes API)
create policy "admin_lead_docs_storage_select" on storage.objects
  for select using (
    bucket_id = 'lead-documents'
    and (auth.jwt() ->> 'role') = 'admin'
  );

create policy "admin_lead_docs_storage_insert" on storage.objects
  for insert with check (
    bucket_id = 'lead-documents'
    and (auth.jwt() ->> 'role') = 'admin'
  );

create policy "admin_lead_docs_storage_delete" on storage.objects
  for delete using (
    bucket_id = 'lead-documents'
    and (auth.jwt() ->> 'role') = 'admin'
  );
