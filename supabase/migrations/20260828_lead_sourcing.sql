-- Sourcing commercial du lead — d'où vient ce prospect.
--
-- ⚠ **À ne pas confondre avec `leads.source`**, qui existe depuis
-- `20260622_leads.sql` et porte le canal **technique** de création : d'où la
-- ligne a été écrite (`configurateur_v2`, `admin`). Au 2026-08-28 elle vaut
-- `configurateur_v2` sur 5 leads et `admin` sur 2 — c'est une information
-- d'origine logicielle, pas commerciale.
--
-- Le sourcing répond à une autre question : **comment ce prospect est arrivé
-- jusqu'à nous**. Un lead créé depuis le back-office (`source = 'admin'`) peut
-- venir aussi bien d'un fichier de prospection que d'un salon ou d'une
-- recommandation — trois efforts commerciaux qui n'ont ni le même coût ni le
-- même rendement, et que `source` confond en une seule valeur.
--
-- Écraser `source` pour y loger le sourcing aurait perdu la trace technique,
-- utile au diagnostic (« ce lead vient-il du site ou d'une saisie ? »).
--
-- ⚠ **Nullable** : les leads antérieurs n'ont pas de sourcing et n'en auront
-- jamais — l'inventer après coup produirait des statistiques fausses, ce qui est
-- pire qu'une case vide. Les leads nés sur le site public n'en ont pas non plus,
-- personne n'étant là pour le renseigner.
--
-- Les libellés lisibles vivent dans `src/lib/crm.ts` ; la base ne stocke que la
-- clé, et n'accepte que les huit valeurs arrêtées avec Richard le 2026-08-28.

alter table public.leads
  add column if not exists sourcing text;

do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'leads_sourcing_check' and conrelid = 'public.leads'::regclass
  ) then
    alter table public.leads add constraint leads_sourcing_check
      check (sourcing is null or sourcing = any (array[
        'prospection_tel',   -- 1. Prospection téléphonique (fichier HPA)
        'appel_entrant',     -- 2. Appel entrant
        'formulaire_site',   -- 3. Formulaire du site
        'configurateur',     -- 4. Configurateur en ligne
        'recommandation',    -- 5. Recommandation / bouche-à-oreille
        'salon',             -- 6. Salon / événement
        'reseaux_sociaux',   -- 7. Réseaux sociaux / LinkedIn
        'partenaire'         -- 8. Partenaire / apporteur d'affaires
      ]));
  end if;
end $$;

comment on column public.leads.sourcing is
  'Origine COMMERCIALE du prospect (8 valeurs, cf. SOURCINGS dans src/lib/crm.ts). À ne pas confondre avec `source`, qui porte le canal technique de création (configurateur_v2, admin).';

-- « Combien de leads du fichier HPA ce mois-ci » est le premier usage attendu :
-- c'est ce chiffre qui dira si la prospection téléphonique paie.
create index if not exists leads_sourcing_idx
  on public.leads (sourcing)
  where sourcing is not null;
