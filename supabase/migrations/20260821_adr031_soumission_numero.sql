-- ADR-031 — Soumission de la demande de numéro : du configurateur au lead.
--
-- Trois mouvements, dans cet ordre. Le troisième est le seul qui change une
-- règle : l'unicité du numéro de série passe du numéro **demandé** au numéro
-- **confirmé**.
--
-- Vérification attendue après application (règle du 2026-08-18 : `success:
-- true` ne prouve rien) :
--   - la colonne existe ;
--   - le CHECK est borné à la série courante ;
--   - `leads_slot_unique` a disparu, `leads_slot_confirme_unique` existe ;
--   - deux leads non confirmés peuvent viser le même numéro ;
--   - deux leads confirmés ne le peuvent pas.

begin;

-- 1 ────────────────────────────────────────────────────────────────────────
-- Ambiance intérieure, ajoutée au parcours le 2026-08-20 (ADR-030 § Amendement).
-- Seule colonne manquante : l'adresse postale du client existait déjà.
alter table public.leads
  add column if not exists cfg_ambiance_interieure text;

comment on column public.leads.cfg_ambiance_interieure is
  'Ambiance intérieure choisie au configurateur v2 (bois | blanc). ADR-030 § Amendement du 2026-08-20.';

-- 2 ────────────────────────────────────────────────────────────────────────
-- Le numéro est borné à la série courante — 6 depuis le 2026-08-04, contre 12
-- jusqu'ici.
--
-- ⚠ Les numéros hors bornes sont d'abord relâchés, sinon la contrainte refuse
-- de se poser. En production la table est vide, l'ordre est sans effet ; sur
-- Preview il touche des leads de test qui portent un numéro supérieur à 6.
-- On met le numéro à NULL plutôt que de supprimer la ligne : le lead reste
-- lisible, seul son numéro — devenu impossible — s'efface.
update public.leads
   set slot = null
 where slot is not null
   and slot > 6;

alter table public.leads drop constraint if exists leads_slot_check;
alter table public.leads
  add constraint leads_slot_check check (slot is null or (slot >= 1 and slot <= 6));

-- 3 ────────────────────────────────────────────────────────────────────────
-- L'unicité porte sur le numéro CONFIRMÉ, pas sur le numéro demandé.
--
-- `leads_slot_unique` bloquait un numéro dès le premier lead qui le visait,
-- quel que soit son statut — l'inverse exact de la règle posée par ADR-035
-- (`etatNumeroPourStatut()`) : rien avant le devis, réservé au devis envoyé
-- (reprenable), bloqué à l'encaissement. Sur une série de six, deux visiteurs
-- souhaitant le même numéro la même semaine donnaient un succès et une erreur
-- d'insertion.
--
-- Le nouvel index ne contraint que les deux statuts où le numéro est
-- réellement pris. Plusieurs demandes peuvent viser un même numéro ; une seule
-- peut le confirmer.
drop index if exists public.leads_slot_unique;

create unique index if not exists leads_slot_confirme_unique
  on public.leads (slot)
  where slot is not null
    and statut_commercial in ('paiement_reserve', 'signe');

comment on index public.leads_slot_confirme_unique is
  'Unicité du numéro de série sur les seuls leads confirmés (paiement encaissé ou devis signé). ADR-031 §2.';

commit;
