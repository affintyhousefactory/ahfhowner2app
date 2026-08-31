-- L'email d'un lead devient facultatif.
--
-- Au téléphone, tout le monde ne donne pas son adresse — un gérant de camping
-- rappelé sur son portable, un standard qui transmet un nom et un numéro. Le
-- conseiller devait alors soit inventer une adresse, soit renoncer à créer la
-- fiche. Les deux sont pires que l'absence : une adresse inventée finit par
-- recevoir un devis, et une fiche non créée est un appel perdu.
--
-- ⚠ **C'est ici qu'était le blocage, pas dans l'écran.** Le formulaire portait
-- bien un `required`, mais même retiré, l'insertion aurait échoué : la colonne
-- est `not null` depuis `20260622_leads.sql`. Une correction limitée à l'écran
-- aurait produit une erreur serveur au lieu d'un message clair.
--
-- ⚠ Ce que l'absence d'email coûte, et qui reste vrai :
--
--   * aucun récapitulatif ne peut partir — les routes d'envoi et d'aperçu
--     répondent déjà « Lead introuvable ou sans email », et l'écran le dit
--     avant d'en arriver là ;
--   * le lead n'entre dans aucune liste Brevo.
--
-- Le téléphone devient alors le seul moyen de reprise. L'écran avertit quand ni
-- l'un ni l'autre n'est renseigné, **sans bloquer** : un nom d'établissement et
-- une note valent mieux que rien, et l'adresse se complète au rappel.
--
-- ⚠ Les formulaires **publics** ne sont pas ouverts pour autant : `/api/contact`
-- et le configurateur valident l'adresse côté serveur, indépendamment de cette
-- contrainte. Là-bas, l'email reste le seul canal de retour — il doit rester
-- obligatoire.
--
-- Aucune donnée n'est touchée : relâcher une contrainte ne fait que cesser d'en
-- refuser de nouvelles. L'index `idx_leads_email` reste valide (il n'est pas
-- unique et accepte les nuls).

alter table public.leads
  alter column email drop not null;

comment on column public.leads.email is
  'Facultatif depuis le 2026-08-27 : un lead pris au téléphone n''a pas toujours d''adresse. Sans elle, aucun récapitulatif ne peut être envoyé. Reste obligatoire côté formulaires publics, où c''est le seul canal de retour.';
