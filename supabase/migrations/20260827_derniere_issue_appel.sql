-- L'issue du dernier appel, remontée sur le lead.
--
-- ══════════════════════════════════════════════════════════════════════════
-- Pourquoi une colonne et non un statut
-- ══════════════════════════════════════════════════════════════════════════
--
-- `statut_commercial` répond à « où en est l'affaire » (Nouveau → Signé).
-- L'issue répond à « comment s'est terminé le dernier appel » (Joint, Répondeur,
-- Pas de réponse, Rappel demandé, Refus). **Ce sont deux axes indépendants** : un
-- lead peut être « En discussion » et avoir eu un répondeur ce matin.
--
-- Les fondre en un seul champ ferait perdre l'un des deux — noter un répondeur
-- effacerait l'avancement, et « Refus » ferait doublon avec « Non retenu ».
-- D'où deux colonnes, deux questions. Décision de Richard, 2026-08-27.
--
-- L'information existait déjà dans `lead_appels`, mais une ligne par appel : pour
-- savoir où en est un lead dans une campagne de 354 campings, il fallait ouvrir
-- sa fiche. Elle remonte donc sur le lead, comme `dernier_appel_at` avant elle.
--
-- ══════════════════════════════════════════════════════════════════════════
-- 1. La colonne
-- ══════════════════════════════════════════════════════════════════════════
--
-- Les cinq valeurs sont celles d'`ISSUES_APPEL` (`src/lib/crm.ts`) : la base
-- contraint la clé, l'écran porte les libellés. Nullable — un lead qu'on n'a
-- jamais appelé n'a pas d'issue, et c'est une information en soi.

alter table public.leads
  add column if not exists derniere_issue text;

do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'leads_derniere_issue_check'
      and conrelid = 'public.leads'::regclass
  ) then
    alter table public.leads add constraint leads_derniere_issue_check
      check (derniere_issue is null or derniere_issue = any (array[
        'joint',
        'repondeur',
        'pas_de_reponse',
        'rappel_demande',
        'refus'
      ]));
  end if;
end $$;

comment on column public.leads.derniere_issue is
  'Issue du dernier appel qui en porte une (cf. ISSUES_APPEL dans src/lib/crm.ts). Maintenue par trigger depuis lead_appels ; corrigeable à la main depuis la fiche.';

-- Filtrer « tous les répondeurs à relancer » est l'usage attendu en campagne.
create index if not exists leads_derniere_issue_idx
  on public.leads (derniere_issue)
  where derniere_issue is not null;

-- ══════════════════════════════════════════════════════════════════════════
-- 2. Le trigger existant est étendu, pas doublé
-- ══════════════════════════════════════════════════════════════════════════
--
-- `leads_recalc_dernier_appel()` recalculait déjà `dernier_appel_at` à chaque
-- écriture sur `lead_appels`. Elle pose désormais l'issue dans le même passage :
-- c'est le même déclencheur et le même parcours de table. Un second trigger
-- aurait doublé les écritures et créé deux vérités susceptibles de diverger.
--
-- ⚠ **L'issue retenue est celle du dernier appel qui en porte une**, pas celle
-- du dernier appel tout court. Le formulaire du journal accepte une note sans
-- issue : sans ce filtre, un simple commentaire ajouté après coup effacerait le
-- « Répondeur » de la veille, alors qu'il reste le dernier retour connu.
--
-- ⚠ Le tri porte sur `(occurred_at, created_at)`. Deux appels saisis avec la
-- même date — cas courant quand on rattrape une journée de phoning le soir —
-- seraient départagés au hasard par `occurred_at` seul ; `created_at` tranche
-- alors par ordre de saisie.

create or replace function public.leads_recalc_dernier_appel(p_lead_id uuid)
returns void
language sql
set search_path to 'public'
as $function$
  update public.leads l
     set dernier_appel_at = (
           select max(a.occurred_at)
             from public.lead_appels a
            where a.lead_id = p_lead_id
              and a.sens in ('entrant', 'sortant')
         ),
         derniere_issue = (
           select a.issue
             from public.lead_appels a
            where a.lead_id = p_lead_id
              and a.issue is not null
            order by a.occurred_at desc, a.created_at desc
            limit 1
         )
   where l.id = p_lead_id;
$function$;

-- ⚠ ADR-035 § défaut corrigé le 2026-08-04 : dans Supabase, une fonction du
-- schéma `public` est exposée en `/rest/v1/rpc/` tant qu'on ne lui retire pas
-- l'exécution. `create or replace` conserve les ACL existants, mais les
-- réaffirmer ici rend la migration juste sur une base neuve — celle de Preview
-- comme une future base de recette.
revoke all on function public.leads_recalc_dernier_appel(uuid) from public, anon, authenticated;
grant execute on function public.leads_recalc_dernier_appel(uuid) to service_role;

-- ══════════════════════════════════════════════════════════════════════════
-- 3. Reprise de l'existant
-- ══════════════════════════════════════════════════════════════════════════
--
-- Les appels déjà journalisés portent leur issue ; sans cette reprise, la colonne
-- resterait vide jusqu'au prochain appel de chaque lead — et la liste afficherait
-- « jamais appelé » pour des leads qu'on a bel et bien eus au téléphone.

update public.leads l
   set derniere_issue = (
         select a.issue
           from public.lead_appels a
          where a.lead_id = l.id
            and a.issue is not null
          order by a.occurred_at desc, a.created_at desc
          limit 1
       )
 where exists (
   select 1 from public.lead_appels a
    where a.lead_id = l.id and a.issue is not null
 );
