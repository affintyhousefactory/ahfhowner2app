-- Colonnes invitation magic link
alter table public.mandataires
  add column if not exists invitation_token text,
  add column if not exists invitation_expires_at timestamptz;

-- Étendre le domaine des statuts mandataire
alter table public.mandataires drop constraint if exists mandataires_statut_check;
alter table public.mandataires add constraint mandataires_statut_check
  check (statut in ('invite', 'en_attente', 'actif', 'suspendu'));

-- Index pour lookup token rapide
create index if not exists mandataires_invitation_token_idx
  on public.mandataires (invitation_token)
  where invitation_token is not null;

-- RLS : le mandataire peut lire et compléter son propre profil via token (service role bypass)
-- Les opérations d'onboarding passent par service_role (getSupabaseAdmin), pas de policy supplémentaire nécessaire.
