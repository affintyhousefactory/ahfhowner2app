-- Rattrapage « safe » des tables admin — reconstitué le 2026-08-26 depuis la production.
--
-- ⚠ **Déjà appliqué en prod** (2026-06-30 à 18:13:31). Cette variante est née
-- le jour où `20260629_admin_tables.sql` a buté sur une base déjà partiellement
-- migrée : elle reprend le même contenu en tout-idempotent (`if not exists`
-- partout, policies créées sous condition dans un `do $$`). D'où le suffixe
-- « safe » du nom enregistré en base.
--
-- Elle n'a jamais été versionnée. Le repo décrivait donc `dossiers` et les
-- colonnes CRM de `leads` par un fichier qui n'est pas celui qui a réellement
-- créé la structure en production.
--
-- ⚠ **Les trois policies ci-dessous portent le défaut d'ADR-039** : elles
-- testent `auth.jwt() ->> 'role' = 'admin'`, un claim qui vaut toujours
-- `'authenticated'` — elles n'ont jamais rien accordé.
-- `20260825_adr039_policies_admin.sql` les corrige. Le SQL est conservé tel
-- qu'il a été appliqué : c'est l'historique qui explique la correction, le
-- réécrire ici effacerait la trace du défaut.
--
-- ⚠ Domaine suspendu (ADR-028) pour tout ce qui touche `mandataires`.

alter table public.leads
  add column if not exists source text default 'web_configurateur',
  add column if not exists statut text default 'nouveau',
  add column if not exists adresse_recherche text,
  add column if not exists code_postal text,
  add column if not exists commune text,
  add column if not exists zones_multiples text[],
  add column if not exists budget_terrain numeric,
  add column if not exists total_estime numeric,
  add column if not exists mandataire_id uuid references public.mandataires(id) on delete set null,
  add column if not exists affecte_at timestamptz,
  add column if not exists notes_ahf text,
  add column if not exists plu_lon numeric,
  add column if not exists plu_lat numeric,
  add column if not exists departement text;

alter table public.leads drop constraint if exists leads_statut_check;
alter table public.leads add constraint leads_statut_check
  check (statut in (
    'nouveau', 'contacte', 'devis_envoye', 'signe', 'annule',
    'qualifié', 'affecté', 'en_cours', 'finalisé', 'perdu'
  ));

create table if not exists public.dossiers (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  mandataire_id uuid references public.mandataires(id) on delete set null,
  statut text not null default 'proposé',
  pack_label text,
  pack_prix_ttc numeric,
  remuneration_mandataire_ht numeric,
  marge_ahf_ht numeric generated always as (pack_prix_ttc - remuneration_mandataire_ht) stored,
  acompte_client numeric default 1500,
  acte_notarie_at timestamptz,
  encaissement_ahf_at timestamptz,
  notes text,
  created_at timestamptz default now()
);

alter table public.leads enable row level security;
alter table public.dossiers enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'admin_leads_all' and tablename = 'leads') then
    create policy "admin_leads_all" on public.leads for all
      using ((auth.jwt() ->> 'role') = 'admin')
      with check ((auth.jwt() ->> 'role') = 'admin');
  end if;
  if not exists (select 1 from pg_policies where policyname = 'admin_dossiers_all' and tablename = 'dossiers') then
    create policy "admin_dossiers_all" on public.dossiers for all
      using ((auth.jwt() ->> 'role') = 'admin')
      with check ((auth.jwt() ->> 'role') = 'admin');
  end if;
  if not exists (select 1 from pg_policies where policyname = 'admin_mandataires_all' and tablename = 'mandataires') then
    create policy "admin_mandataires_all" on public.mandataires for all
      using ((auth.jwt() ->> 'role') = 'admin')
      with check ((auth.jwt() ->> 'role') = 'admin');
  end if;
end $$;
