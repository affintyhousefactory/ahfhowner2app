# CURRENT_SESSION — Howner / ARKO

> Mémoire courte. Historique complet et backlog → `00_INDEX/PROJECT_STATE.md` § « Dernier point ».
> Règle : 300–1200 tokens.

## Décisions — 2026-09-11 (la doctrine lexicale entre dans ADR-029)

**`main` = `1cc3e4b8`**, inchangé. Branche `feat/adr-029-doctrine-lexicale` → **PR #123 vers `dev`** (emporte la consolidation du 7/09). Aucune migration.

- **Doctrine lexicale de Richard** actée : ADR-029 § Amendement du 2026-09-11, copie versionnée
  `docs/specs/DOCTRINE_LEXICALE_HOWNER.md`. Howner est **fabricant-installateur** (hors-site,
  atelier, livraison, pose) — jamais constructeur, maître d'œuvre ni cabinet d'architecture.
- **Quinze formules dans `PROSCRITS`** (site + Brevo), motifs éprouvés sur phrases fautive/légitime.
  Le site n'en employait aucune.
- **`llms.txt` et JSON-LD `Organization`** réécrits en « fabricant-installateur … hors-site » ;
  « dessiné et suivi par » → « dessiné par ».
- « prêt à vivre » reste imposé = niveau d'équipement à la livraison, jamais « sans démarche ».
- **Point ouvert n° 4** : « architecte » seulement si personne habilitée **et** désignée — contredit
  « sans prénom ». Reco : nommer si inscrite à l'Ordre, retirer sinon (titre protégé, loi de 1977).

## Leçons de méthode
- **Troisième fois** : `check:vocabulaire` refuse le terme cité dans le commentaire qui le documente.
  L'exemption ne couvre que les lignes portant `ADR-029` — reformuler, ne pas élargir l'exemption.
- Un motif nouveau s'éprouve sur une phrase fautive **et** une légitime avant d'entrer : un contrôle
  qui passe du premier coup sur un site conforme n'a rien prouvé.

## Prochaine action
1. **Trancher le point ouvert n° 4** (architecte) — bloque `<h1>` dictés et prochaine campagne Brevo.
2. Copie « fabricant-installateur » pour `/a-propos` + pied de page, avec Richard.
3. Reportés du 07/09 : bascule `"publiee"` des deux pages ; échéance −10 % ; bascule `/configurer`
   (+ `llms.txt` : volume, numéro, acompte) ; alerte Albert RSE.

## Blockers / À fournir
- **Point ouvert n° 4 d'ADR-029** ; coordonnées exactes de l'atelier.
- **Albert** — charte Affinity (ADR-002), bi-produit (ADR-022), « studio de jardin », B2B Biarritz,
  CGV en « maison », positionnement RSE.
- Médiateur de la consommation non nommé (L.616-1) ; ADR-028 réversibilité non testée ; référents
  `howner.fr` Google Places ; récapitulatif réel jamais envoyé ; temps 2 du CRM.
