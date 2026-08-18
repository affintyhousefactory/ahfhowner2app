-- ADR-035 § Amendement du 2026-08-04 — « Lead chaud » → « Paiement réservé »
--
-- Le statut `chaud` était une appréciation subjective du conseiller. Il devient
-- un fait comptable : la réservation du numéro de série a été encaissée. Le
-- futur connecteur Pennylane écrira cette valeur — d'où le renommage de
-- l'identifiant lui-même, et pas seulement du libellé affiché : un connecteur
-- qui poserait `chaud` pendant que l'écran dit « Paiement réservé » rejouerait
-- exactement la divergence que `src/lib/crm.ts` a été écrit pour empêcher.
--
-- Ordre imposé : la contrainte CHECK doit tomber AVANT l'`update`, sinon les
-- lignes migrées violent l'ancienne liste de valeurs.

alter table public.leads
  drop constraint if exists leads_statut_commercial_check;

update public.leads
   set statut_commercial = 'paiement_reserve'
 where statut_commercial = 'chaud';

alter table public.leads
  add constraint leads_statut_commercial_check
  check (statut_commercial in (
    'nouveau', 'a_rappeler', 'contact_pris', 'en_discussion',
    'devis_envoye', 'paiement_reserve', 'signe', 'perdu'
  ));
