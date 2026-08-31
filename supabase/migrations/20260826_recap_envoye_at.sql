-- Trace de l'envoi du récapitulatif d'appel au client.
--
-- Le back-office pouvait envoyer le récap autant de fois qu'on cliquait, sans
-- qu'aucune trace ne subsiste : ni le conseiller suivant ni la fiche du lead ne
-- savaient si le client avait déjà reçu quelque chose. Sur un premier appel
-- retranscrit à deux, c'est un client qui reçoit deux fois le même devis.
--
-- Une simple date suffit : elle répond à « est-ce parti, et quand ». Un compteur
-- d'envois dirait davantage, mais personne n'a de question à laquelle il
-- répondrait aujourd'hui.
--
-- ⚠ Le code fonctionne **avant comme après** cette migration : la route d'envoi
-- écrit la date après coup et ne rend pas d'erreur si l'écriture échoue. Elle
-- renvoie `horodate: false`, l'email part quand même. Une trace manquée ne doit
-- jamais empêcher un envoi qui, lui, a réussi.

alter table public.leads
  add column if not exists recap_envoye_at timestamptz;

comment on column public.leads.recap_envoye_at is
  'Date du dernier envoi du récapitulatif d''appel au client (back-office). Null = jamais envoyé.';
