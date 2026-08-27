-- Le prospect hésite entre plusieurs modèles.
--
-- Au téléphone, un premier appel se termine souvent sans choix arrêté : le
-- gérant de camping veut « voir les deux », l'EHPAD compare une unité et trois.
-- L'écran de pré-qualification, lui, imposait un modèle — Arko One ou Arko Max —
-- et chiffrait une configuration unique.
--
-- Enregistrer un choix que le prospect n'a pas fait a deux conséquences, et la
-- seconde est la plus fâcheuse :
--
--   1. le CRM affiche un modèle que personne n'a retenu ;
--   2. le récapitulatif envoyé au client **chiffre cette configuration**, et
--      un prix communiqué ne se reprend pas.
--
-- D'où ce drapeau : il dit que la qualification n'a pas tranché, et il aiguille
-- l'email vers le template de présentation (`BREVO_TEMPLATE_MULTICFG`, 17) au
-- lieu du récapitulatif chiffré (`BREVO_TEMPLATE_RECAP`, 9).
--
-- ⚠ `not null default false` : tous les leads existants sont, par construction,
-- des configurations uniques — c'est le seul cas que l'écran savait produire.
-- Un `null` aurait introduit un troisième état (« on ne sait pas ») qui ne
-- correspond à rien dans l'historique.
--
-- ⚠ Quand il vaut `true`, `cfg_modele` est **null** et non pas un modèle par
-- défaut. Les colonnes de prix le sont aussi. C'est voulu : une moyenne, un
-- décompte par modèle ou un chiffre d'affaires prévisionnel ne doivent pas
-- ramasser une configuration qui n'a jamais été arrêtée.

alter table public.leads
  add column if not exists multi_configuration boolean not null default false;

comment on column public.leads.multi_configuration is
  'Le prospect s''intéresse à plusieurs modèles : la qualification n''a pas tranché. cfg_modele et les prix restent null, et le récapitulatif part avec BREVO_TEMPLATE_MULTICFG (présentation + plaquette) au lieu du récapitulatif chiffré.';

-- Le filtre attendu est « les leads encore à arbitrer » : une poignée de lignes
-- dans une table qui en compte peu. L'index partiel ne coûte que ce qu'il
-- indexe, et le `where` l'empêche de porter les `false` — c'est-à-dire presque
-- tout.
create index if not exists leads_multi_configuration_idx
  on public.leads (multi_configuration)
  where multi_configuration;
