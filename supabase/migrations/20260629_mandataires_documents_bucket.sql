-- Bucket privé pour les documents mandataires
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'mandataires-documents',
  'mandataires-documents',
  false,
  5242880, -- 5 MB max par fichier
  array['application/pdf', 'image/png', 'image/jpeg']
)
on conflict (id) do nothing;

-- RLS : un mandataire accède uniquement à son propre dossier {mandataire_id}/*
create policy "mandataire_storage_select" on storage.objects
  for select using (
    bucket_id = 'mandataires-documents'
    and (storage.foldername(name))[1] = (
      select id::text from public.mandataires where user_id = auth.uid() limit 1
    )
  );

create policy "mandataire_storage_insert" on storage.objects
  for insert with check (
    bucket_id = 'mandataires-documents'
    and (storage.foldername(name))[1] = (
      select id::text from public.mandataires where user_id = auth.uid() limit 1
    )
  );

create policy "mandataire_storage_delete" on storage.objects
  for delete using (
    bucket_id = 'mandataires-documents'
    and (storage.foldername(name))[1] = (
      select id::text from public.mandataires where user_id = auth.uid() limit 1
    )
  );
