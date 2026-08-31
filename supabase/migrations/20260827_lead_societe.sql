-- Identité de la société du prospect — tous les champs facultatifs.
--
-- Quatre des cinq cibles commerciales sont des personnes morales : campings,
-- hôtels, EHPAD, collectivités. Le CRM ne portait pourtant qu'une identité de
-- personne physique — prénom, nom, email, téléphone. La raison sociale se
-- retrouvait dans les notes d'appel, d'où on ne peut ni trier, ni rapprocher des
-- fichiers de prospection.
--
-- ⚠ **Tous facultatifs, et c'est délibéré.** La cinquième cible — les
-- particuliers investisseurs — n'a ni raison sociale ni SIREN, et un premier
-- appel se termine rarement avec le SIREN sous la main. Rendre l'un d'eux
-- obligatoire reviendrait à interdire la fiche pour un champ qu'on remplira au
-- rappel suivant.
--
-- ⚠ **Adresse de la société, distincte de celle du client.** `adresse_postale_client`,
-- `cp_client` et `ville_client` existent déjà et désignent la personne physique.
-- Le siège d'un camping et le domicile de son gérant ne sont pas au même endroit,
-- et c'est le premier qui reçoit le studio. Les confondre dans une seule colonne
-- aurait perdu l'information le jour où les deux diffèrent — c'est-à-dire le cas
-- courant.

alter table public.leads
  add column if not exists raison_sociale   text,
  add column if not exists siren            text,
  add column if not exists site_web         text,
  add column if not exists adresse_societe  text,
  add column if not exists cp_societe       text,
  add column if not exists ville_societe    text;

-- Le SIREN se dicte « 812 345 678 » et se saisit avec ou sans espaces. On stocke
-- neuf chiffres, sans séparateur : deux écritures d'un même numéro ne se
-- rapprocheraient pas d'un fichier de prospection.
--
-- ⚠ La **clé de contrôle** (Luhn) n'est volontairement pas imposée ici. La Poste
-- porte historiquement le 356 000 000, qui ne la respecte pas, et l'INSEE l'admet
-- comme exception. L'écran avertit sur une clé fausse ; la base, elle, ne refuse
-- que ce qui n'est pas un SIREN du tout.
do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'leads_siren_check' and conrelid = 'public.leads'::regclass
  ) then
    alter table public.leads add constraint leads_siren_check
      check (siren is null or siren ~ '^[0-9]{9}$');
  end if;
end $$;

comment on column public.leads.raison_sociale is
  'Dénomination de la personne morale. Null pour un particulier (cible 5).';
comment on column public.leads.siren is
  'Neuf chiffres, sans séparateur. La clé de Luhn n''est pas imposée : La Poste (356000000) fait exception.';
comment on column public.leads.site_web is
  'URL complète, préfixée https:// à la saisie — sans schéma, le lien devient relatif au back-office.';
comment on column public.leads.adresse_societe is
  'Siège ou établissement du prospect. Distinct de adresse_postale_client, qui désigne la personne physique.';

-- Rapprocher un lead d'un fichier de prospection se fait par le SIREN.
create index if not exists leads_siren_idx
  on public.leads (siren)
  where siren is not null;
