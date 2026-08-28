-- Table `mandataires` — reconstituée le 2026-08-26 depuis la production.
--
-- ⚠ **Cette migration est déjà appliquée** (prod le 2026-06-29 à 12:54:39,
-- Preview le même jour à 13:20:18). Elle n'est versionnée qu'aujourd'hui : elle
-- avait été passée à la main, sans fichier, si bien que le repo ne décrivait
-- pas une table dont dépendent `20260629_admin_tables.sql` (clé étrangère
-- `leads.mandataire_id`) et toute la suite du domaine mandataire.
--
-- Le corps ci-dessous est le SQL **exact** enregistré dans
-- `supabase_migrations.schema_migrations`, recopié sans retouche : un fichier
-- de rattrapage qui « améliore » ce qui tourne réellement ne documente plus
-- rien. Il est idempotent (`if not exists`) sauf les trois `create policy`,
-- qui échoueraient sur une base où elles existent déjà — c'est voulu, elles
-- signalent qu'on rejoue une migration passée.
--
-- ⚠ Domaine suspendu (ADR-028) : `FEATURES.mandataire` masque toutes les
-- surfaces qui lisent cette table. Le versionner ne la remet pas en service.

-- Table mandataires
create table if not exists public.mandataires (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  statut text not null default 'en_attente'
    check (statut in ('en_attente', 'actif', 'suspendu')),
  nom text not null,
  prenom text not null default '',
  email text not null,
  tel text,
  siret text,
  forme_juridique text,
  adresse text,
  reseau_carte_t text,
  carte_t_numero text,
  zone_activite text[] default '{}',
  site_web text,
  description text,
  slug text unique,
  contrat_signe_at timestamptz,
  contrat_url text,
  contrat_data jsonb,
  created_at timestamptz not null default now()
);

-- Index
create index if not exists mandataires_user_id_idx on public.mandataires(user_id);
create index if not exists mandataires_statut_idx on public.mandataires(statut);

-- RLS
alter table public.mandataires enable row level security;

-- Mandataire peut lire/modifier son propre profil
create policy "mandataire_select_own" on public.mandataires
  for select using (user_id = auth.uid());

create policy "mandataire_insert_own" on public.mandataires
  for insert with check (user_id = auth.uid());

create policy "mandataire_update_own" on public.mandataires
  for update using (user_id = auth.uid());
