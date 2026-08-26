-- Unicité de `mandataires.email` — reconstituée le 2026-08-26 depuis la production.
--
-- ⚠ **Déjà appliquée** (prod le 2026-06-30 à 16:12:56, Preview à 16:10:58).
-- Passée à la main le jour où l'invitation par courriel est arrivée : sans
-- cette contrainte, deux invitations sur la même adresse auraient créé deux
-- profils, et `20260630_mandataires_invitation.sql` n'aurait pas su lequel
-- rattacher au compte créé.
--
-- SQL exact enregistré en base :
--
--     ALTER TABLE mandataires ADD CONSTRAINT mandataires_email_key UNIQUE (email);
--
-- Il est repris ci-dessous sous garde, faute de `add constraint if not exists`
-- en Postgres : tel quel, il échouerait sur les deux bases où la contrainte
-- existe déjà. La garde ne change pas ce qui a été appliqué — elle rend le
-- fichier rejouable sur une base neuve comme sur une base à jour.

do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'mandataires_email_key'
      and conrelid = 'public.mandataires'::regclass
  ) then
    alter table public.mandataires add constraint mandataires_email_key unique (email);
  end if;
end $$;
