-- « Multi-Configuration » couvre deux situations, pas une.
--
-- `20260827_multi_configuration.sql` a créé le drapeau pour un seul cas : le
-- prospect hésite entre plusieurs modèles. Richard l'élargit le même jour à un
-- second, qui appelle exactement le même traitement — la demande porte sur des
-- **options ou services personnalisés, assujettis à devis préalables
-- complémentaires**, et sort donc de la grille.
--
-- Deux causes, une conséquence : il n'y a rien à chiffrer. Et c'est la
-- conséquence, pas la cause, qui décide de l'email envoyé — présentation et
-- plaquette (`BREVO_TEMPLATE_MULTICFG`) plutôt que récapitulatif chiffré.
--
-- ⚠ **Seul le commentaire change ; la colonne, elle, ne bouge pas.** Le drapeau
-- disait déjà la bonne chose : « cette configuration n'est pas chiffrable ». Lui
-- ajouter une valeur pour distinguer les deux causes aurait fait diverger la
-- base de l'écran sans qu'aucune décision n'en dépende — la cause se lit dans
-- les notes d'appel, là où le conseiller l'a écrite.
--
-- ⚠ Cette migration existe **parce que la précédente est déjà appliquée** en
-- production et en Preview. Réécrire son fichier aurait fait mentir le dépôt sur
-- ce qui a réellement tourné : c'est le défaut que les trois migrations
-- rattrapées le 2026-08-26 ont mis au jour, on ne le réintroduit pas.

comment on column public.leads.multi_configuration is
  'Configuration non chiffrable : plusieurs modèles en balance, ou options et services personnalisés assujettis à devis préalables complémentaires. cfg_modele et les prix restent null, et le récapitulatif part avec BREVO_TEMPLATE_MULTICFG (présentation + plaquette) au lieu du récapitulatif chiffré.';
