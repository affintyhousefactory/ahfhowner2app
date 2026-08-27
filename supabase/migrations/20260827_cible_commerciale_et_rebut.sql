-- Cible commerciale du lead, et statut de rebut.
--
-- ══════════════════════════════════════════════════════════════════════════
-- 1. `leads.cible_commerciale`
-- ══════════════════════════════════════════════════════════════════════════
--
-- Les cinq cibles du script de phoning. Ce ne sont pas des catégories inventées
-- après coup : chacune a sa trame d'appel — accroche, punch lines, objections
-- propres. Enregistrer la cible, c'est enregistrer avec quelle trame le contact
-- a été mené, ce qu'aucune autre colonne ne dit.
--
-- ⚠ **Nullable, malgré le caractère obligatoire à la saisie.** Le back-office
-- l'exige du conseiller, mais les leads nés sur le site public — configurateur,
-- formulaire de contact — n'ont personne pour la renseigner. Une colonne
-- `not null` aurait fait échouer leur enregistrement, c'est-à-dire perdu le
-- lead pour cause de champ administratif. L'obligation est là où elle a du
-- sens : dans l'écran d'appel.
--
-- La contrainte de valeur, en revanche, est bien ici : un identifiant hors
-- liste est refusé. Les libellés lisibles vivent dans `src/lib/crm.ts`, la base
-- ne stocke que la clé.

alter table public.leads
  add column if not exists cible_commerciale text;

do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'leads_cible_commerciale_check'
      and conrelid = 'public.leads'::regclass
  ) then
    alter table public.leads add constraint leads_cible_commerciale_check
      check (cible_commerciale is null or cible_commerciale = any (array[
        'hpa',            -- 1. Campings et hôtellerie de plein air
        'tourisme',       -- 2. Hôtels, domaines, gîtes et hébergements touristiques
        'medico_social',  -- 3. EHPAD, résidences services seniors, médico-social
        'collectivites',  -- 4. Collectivités, employeurs et logement des saisonniers
        'investisseurs'   -- 5. Particuliers investisseurs disposant de fonds
      ]));
  end if;
end $$;

comment on column public.leads.cible_commerciale is
  'Cible du script de phoning (5 valeurs, cf. src/lib/crm.ts). Null pour les leads nés sur le site public.';

-- Le tri par cible est le premier usage attendu du CRM : « combien de campings
-- ce mois-ci ». Sans index, il balaie la table — ce qui va très bien aujourd'hui
-- et cessera d'aller de soi sans qu'on s'en aperçoive.
create index if not exists leads_cible_commerciale_idx
  on public.leads (cible_commerciale)
  where cible_commerciale is not null;

-- ══════════════════════════════════════════════════════════════════════════
-- 2. Statut `erreur_test_doublon`
-- ══════════════════════════════════════════════════════════════════════════
--
-- Une saisie de test, un doublon, une erreur de frappe : des lignes qui existent
-- en base mais ne décrivent personne. Mêlées aux vraies, elles faussent les
-- compteurs du Kanban ; et « Non retenu » ne convenait pas — ce statut dit qu'un
-- prospect a dit non, ce qui est une information commerciale. Celui-ci dit qu'il
-- n'y a jamais eu de prospect.
--
-- Le lead est retiré du Kanban côté écran, **jamais supprimé** : il reste en
-- base et visible dans la vue tableau, d'où on peut lui rendre un statut. Un
-- statut qui effacerait pour de bon n'aurait pas sa place dans un menu déroulant
-- qu'on manipule d'une main en parlant au téléphone.
--
-- ⚠ La contrainte existante est remplacée, pas complétée : Postgres n'ajoute pas
-- une valeur à un `check` en place. Les huit valeurs précédentes sont reprises
-- à l'identique — les retirer invaliderait les lignes existantes.

alter table public.leads drop constraint if exists leads_statut_commercial_check;

alter table public.leads add constraint leads_statut_commercial_check
  check (statut_commercial = any (array[
    'nouveau',
    'a_rappeler',
    'contact_pris',
    'en_discussion',
    'devis_envoye',
    'paiement_reserve',
    'signe',
    'perdu',
    'erreur_test_doublon'
  ]));
