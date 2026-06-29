-- ── Colonnes manquantes sur leads ──────────────────────────────────────────
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

-- Élargir le domaine des statuts pour le portail admin
alter table public.leads drop constraint if exists leads_statut_check;
alter table public.leads add constraint leads_statut_check
  check (statut in (
    'nouveau', 'contacte', 'devis_envoye', 'signe', 'annule',
    'qualifié', 'affecté', 'en_cours', 'finalisé', 'perdu'
  ));

-- ── Table dossiers ──────────────────────────────────────────────────────────
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

-- ── RLS leads — admin full access ──────────────────────────────────────────
alter table public.leads enable row level security;

create policy "admin_leads_all" on public.leads
  for all
  using ((auth.jwt() ->> 'role') = 'admin')
  with check ((auth.jwt() ->> 'role') = 'admin');

-- ── RLS dossiers ───────────────────────────────────────────────────────────
alter table public.dossiers enable row level security;

create policy "admin_dossiers_all" on public.dossiers
  for all
  using ((auth.jwt() ->> 'role') = 'admin')
  with check ((auth.jwt() ->> 'role') = 'admin');

-- ── RLS mandataires — admin full access ────────────────────────────────────
create policy "admin_mandataires_all" on public.mandataires
  for all
  using ((auth.jwt() ->> 'role') = 'admin')
  with check ((auth.jwt() ->> 'role') = 'admin');
