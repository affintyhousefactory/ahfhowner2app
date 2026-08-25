-- ADR-039 — les policies « admin » testaient un claim qui ne vaut jamais « admin ».
--
-- Constat du 2026-08-25, prouvé sur un jeton réel de production :
--
--     auth.jwt() ->> 'role'                    → 'authenticated'
--     auth.jwt() -> 'app_metadata' ->> 'role'  → 'admin'
--
-- Le premier est le rôle **Postgres** que Supabase place à la racine de tout
-- jeton d'utilisateur connecté ; le second est le rôle applicatif, celui que
-- le code lit déjà (`user.app_metadata?.role === "admin"`).
--
-- Les six policies ci-dessous testaient le premier. Elles n'ont donc **jamais**
-- accordé le moindre accès depuis leur création : elles étaient décoratives.
-- Personne ne s'en est aperçu parce que tout le back-office interroge la base
-- en `service_role`, qui contourne la RLS par construction — ce qui est
-- précisément le défaut qu'ADR-039 corrige côté application.
--
-- Corriger ces policies ne débloque rien et ne casse rien : c'est la couche de
-- rattrapage qui s'active le jour où un écran lira la base avec l'identité de
-- l'utilisateur plutôt qu'avec la clé de service.
--
-- Aucune donnée touchée. Idempotent.

begin;

-- Rôle applicatif lu au bon endroit, une fois, plutôt que recopié six fois.
create or replace function public.est_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce(
    (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

comment on function public.est_admin() is
  'ADR-039 — vrai si le jeton courant porte app_metadata.role = admin. '
  'Ne pas tester auth.jwt() ->> ''role'' : ce claim vaut toujours ''authenticated''.';

-- `security invoker` + révocation : une fonction `security definer` dans
-- `public` est une route publique tant qu'on ne lui retire pas l'exécution
-- (leçon d'ADR-035, 2026-08-04). Celle-ci n'a pas besoin de privilèges.
-- ⚠ `revoke from public` ne suffit pas : Supabase pose des privilèges par
-- défaut qui accordent EXECUTE à `anon` et `authenticated` sur toute fonction
-- créée dans `public`. Il faut retirer `anon` nommément — vérifié dans
-- `pg_proc.proacl` après la première application, où il figurait encore.
revoke all on function public.est_admin() from public;
revoke all on function public.est_admin() from anon;
grant execute on function public.est_admin() to authenticated, service_role;

alter policy admin_leads_all                  on public.leads                 using (public.est_admin());
alter policy admin_lead_appels_all            on public.lead_appels           using (public.est_admin());
alter policy admin_lead_documents_all         on public.lead_documents        using (public.est_admin());
alter policy admin_lead_client_documents_all  on public.lead_client_documents using (public.est_admin());
alter policy admin_dossiers_all               on public.dossiers              using (public.est_admin());
alter policy admin_mandataires_all            on public.mandataires           using (public.est_admin());

commit;
