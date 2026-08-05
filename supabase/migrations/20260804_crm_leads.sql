-- ADR-035 — Refonte du CRM interne (portail /admin)
--
-- Migration PUREMENT ADDITIVE : aucune colonne supprimée, aucune contrainte
-- durcie sur l'existant. Elle prépare le CRM à recevoir les données du
-- configurateur v2 (ADR-030) avant qu'ADR-031 ne les écrive.
--
-- Trois volets :
--   1. leads       — suivi commercial (conseiller, rappel, dernier appel)
--                    + capture de la configuration v2
--   2. lead_appels — journal d'appels et de notes
--   3. lead_client_documents — origine (AHF / client) et catégorie de pièce

-- ════════════════════════════════════════════════════════════════════════════
-- 1. leads — suivi commercial + configuration v2
-- ════════════════════════════════════════════════════════════════════════════

alter table public.leads
  -- ── Suivi commercial (ADR-035 §1 et §2) ───────────────────────────────────
  -- `responsable` = conseiller AHF. SANS RAPPORT avec `mandataire_id`, qui
  -- relève du domaine suspendu (ADR-028). Texte libre côté base : il n'existe
  -- pas de table de comptes AHF ; la contrainte de valeurs vit dans
  -- `src/lib/crm.ts`, côté écran.
  add column if not exists responsable         text,
  add column if not exists responsable_at      timestamptz,
  -- Échéance COURANTE de rappel (valeur mutable). L'historique des rappels
  -- planifiés vit dans `lead_appels.prochain_rappel_at`.
  add column if not exists prochain_rappel_at  timestamptz,
  -- Dénormalisé, maintenu par trigger depuis `lead_appels` : le CRM trie et
  -- filtre dessus en SQL sur la liste complète.
  add column if not exists dernier_appel_at    timestamptz,

  -- ── Configuration issue du configurateur v2 (ADR-035 §4) ──────────────────
  -- Instantané fidèle de ce que le client a vu, grille comprise.
  add column if not exists config_v2           jsonb,
  -- Version de la grille (`loadConfig().version`) — sans elle, un lead ancien
  -- se relirait avec les prix du jour. Sert aussi de discriminant d'affichage :
  -- renseigné = fiche v2, nul = fiche v1 héritée.
  add column if not exists cfg_version         text,
  add column if not exists cfg_usage           text,
  add column if not exists cfg_quantite        smallint,
  add column if not exists cfg_modele          text,
  add column if not exists cfg_ambiance        text,
  add column if not exists cfg_terrasse        text,
  add column if not exists cfg_options         text[],
  add column if not exists cfg_prix_base       integer,
  add column if not exists cfg_prix_terrasse   integer,
  add column if not exists cfg_prix_options    integer,
  add column if not exists cfg_transport       integer,
  add column if not exists cfg_total           integer;

-- Les identifiants (`annexe`/`pro`/`logement_nu`, `one`/`max`) viennent de
-- `src/lib/configurateur/config.ts`. Pas de CHECK en base : la grille est
-- éditable sans redéploiement (ADR-030 §12, « elles bougeront ») et une
-- contrainte figée obligerait une migration à chaque ajout d'ambiance.

-- Index de pilotage — les trois axes de tri du CRM.
create index if not exists idx_leads_statut_commercial  on public.leads(statut_commercial);
create index if not exists idx_leads_responsable        on public.leads(responsable);
create index if not exists idx_leads_prochain_rappel    on public.leads(prochain_rappel_at)
  where prochain_rappel_at is not null;
create index if not exists idx_leads_dernier_appel      on public.leads(dernier_appel_at);

-- ════════════════════════════════════════════════════════════════════════════
-- 2. lead_appels — journal d'appels et de notes (ADR-035 §3)
-- ════════════════════════════════════════════════════════════════════════════
--
-- Une entrée = un appel entrant, un appel sortant, ou une note libre. Les trois
-- dans la même table : la fiche les restitue en UNE timeline. Les séparer
-- obligerait à lire deux colonnes pour reconstituer une relation client.

create table if not exists public.lead_appels (
  id                  uuid primary key default gen_random_uuid(),
  lead_id             uuid not null references public.leads(id) on delete cascade,

  -- 'note' ne compte pas comme un contact : le trigger ci-dessous l'exclut du
  -- calcul de `dernier_appel_at`.
  sens                text not null default 'sortant'
                      check (sens in ('entrant', 'sortant', 'note')),

  issue               text check (issue is null or issue in (
                        'joint', 'repondeur', 'pas_de_reponse',
                        'rappel_demande', 'refus'
                      )),

  note                text,
  duree_min           smallint check (duree_min is null or duree_min >= 0),
  auteur              text,

  -- Rappel planifié PAR cette entrée. Historique : la valeur courante du lead
  -- est `leads.prochain_rappel_at`, écrite par la route API.
  prochain_rappel_at  timestamptz,

  -- Date réelle de l'appel — peut être antidatée (appel journalisé après coup).
  -- Distincte de `created_at`, date de saisie.
  occurred_at         timestamptz not null default now(),
  created_at          timestamptz not null default now()
);

create index if not exists idx_lead_appels_lead
  on public.lead_appels(lead_id, occurred_at desc);

alter table public.lead_appels enable row level security;

drop policy if exists "admin_lead_appels_all" on public.lead_appels;
create policy "admin_lead_appels_all" on public.lead_appels
  for all
  using      ((auth.jwt() ->> 'role') = 'admin')
  with check ((auth.jwt() ->> 'role') = 'admin');

-- ── Trigger : maintien de leads.dernier_appel_at ────────────────────────────
--
-- Recalcule depuis la source à chaque écriture plutôt que d'incrémenter un
-- état. Conséquence voulue : une erreur ne peut pas produire une valeur
-- durablement fausse, seulement une valeur en retard d'une écriture. Couvre
-- INSERT / UPDATE / DELETE, y compris un déplacement d'entrée entre deux leads.

-- ⚠ `security invoker` et non `definer` : cette fonction n'est appelée que
-- depuis le trigger ci-dessous, lui-même `security definer` — elle s'exécute
-- donc déjà avec les droits du propriétaire. En `definer`, PostgREST l'exposait
-- en `/rest/v1/rpc/` : n'importe quel appelant **anonyme** pouvait écrire
-- `leads.dernier_appel_at` sur un lead dont il devinait l'UUID, en contournant
-- la RLS. Défaut relevé par l'audit Supabase à l'application sur Preview.

create or replace function public.leads_recalc_dernier_appel(p_lead_id uuid)
returns void
language sql
security invoker
set search_path = public
as $$
  update public.leads l
     set dernier_appel_at = (
           select max(a.occurred_at)
             from public.lead_appels a
            where a.lead_id = p_lead_id
              and a.sens in ('entrant', 'sortant')
         )
   where l.id = p_lead_id;
$$;

create or replace function public.leads_sync_dernier_appel()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Deux appels plutôt qu'un test d'égalité : quand `lead_id` n'a pas changé,
  -- le second recalcul est identique au premier — idempotent, donc sans effet.
  -- Quand il a changé (entrée déplacée d'un lead à l'autre), les deux leads
  -- sont remis à jour. Un `if` de plus n'achèterait rien qu'un risque.
  if tg_op <> 'INSERT' then
    perform public.leads_recalc_dernier_appel(old.lead_id);
  end if;
  if tg_op <> 'DELETE' then
    perform public.leads_recalc_dernier_appel(new.lead_id);
  end if;
  return null;
end;
$$;

-- Ces deux fonctions n'ont aucune raison d'être appelables depuis l'API REST.
-- PostgREST expose tout ce qui vit dans `public` : le droit d'exécution se
-- retire explicitement. Un trigger ne vérifie pas `EXECUTE` au déclenchement
-- (le contrôle a lieu à la création du trigger) — le retrait est donc sans
-- effet sur le fonctionnement.
revoke all on function public.leads_recalc_dernier_appel(uuid) from public, anon, authenticated;
revoke all on function public.leads_sync_dernier_appel()       from public, anon, authenticated;

drop trigger if exists trg_lead_appels_sync on public.lead_appels;
create trigger trg_lead_appels_sync
  after insert or update or delete on public.lead_appels
  for each row execute function public.leads_sync_dernier_appel();

-- Backfill : aucune entrée n'existe encore, mais l'écriture rend la migration
-- rejouable sans surprise si elle est appliquée après un premier usage.
update public.leads l
   set dernier_appel_at = sub.max_at
  from (
    select lead_id, max(occurred_at) as max_at
      from public.lead_appels
     where sens in ('entrant', 'sortant')
     group by lead_id
  ) sub
 where sub.lead_id = l.id
   and l.dernier_appel_at is distinct from sub.max_at;

-- ════════════════════════════════════════════════════════════════════════════
-- 3. lead_client_documents — origine et catégorie (ADR-035 §5)
-- ════════════════════════════════════════════════════════════════════════════
--
-- `origine` prépare l'espace client (ADR-034) : il écrira dans cette même table
-- avec 'client'. Défaut 'ahf' — l'existant a été déposé par AHF.
-- `categorie` rattache la pièce à la liste `PIECES_DOSSIER` de `src/lib/crm.ts`.
-- Pas de table « pièces attendues » : une pièce attendue sans document est une
-- absence, pas une ligne.

alter table public.lead_client_documents
  add column if not exists origine   text not null default 'ahf'
                           check (origine in ('ahf', 'client')),
  add column if not exists categorie text;

create index if not exists idx_lead_client_documents_lead
  on public.lead_client_documents(lead_id, created_at desc);
