# CURRENT_SESSION — Howner / ARKO

> Mémoire courte. Historique complet et backlog → `00_INDEX/PROJECT_STATE.md` § « Dernier point ».
> Règle : 300–1200 tokens. Ce fichier a été ramené à sa taille le 2026-08-27 — il portait
> l'historique de neuf sessions, qui vit désormais dans PROJECT_STATE.

## Décisions — 2026-08-26/27 (CRM : l'écran d'appel ; emails : consentement et pied de page)

**`main` = `d60e2cb3`.** Quatre PR en production (#100, #101, #103, #104), deux migrations passées
en prod. **PR #102 reste ouverte** (trois migrations non versionnées, purement documentaire).

- **Deux listes Brevo, deux rôles** — « Prospects » (8) reçoit **tout le monde** (c'est le CRM,
  intérêt légitime) ; « AHF – Newsletter » (5) **seulement ceux qui cochent**. **Une campagne se
  cible sur Newsletter, jamais sur Prospects.** Appliqué aux trois formulaires qui posent la même
  question (`OPTIN_TEXTE`). Avant : la liste 5 n'était **jamais** alimentée, et qui ne cochait pas
  n'entrait dans **aucune** liste.
- **`{{ unsubscribe_link }}` n'existe pas chez Brevo** — remplacé par une chaîne vide depuis
  l'origine. Le HTML délivré portait `<a href="">Se désinscrire</a>` ; le template source, lui,
  paraissait normal. Corrigé en `{{ unsubscribe }}` par Richard. **Un template Brevo ne se vérifie
  pas sur sa source.**
- **« Supprimer mon compte » menait à une page de maintenance** servant un `200` sur toute URL.
  Redirigé vers `howner.fr/confidentialite` (§11).
- **Cible commerciale obligatoire** à la création d'un lead — les 5 cibles du script de phoning,
  avec leurs codes **NAF rév. 2** (vérifiés un à un sur insee.fr). Corrigeable ensuite depuis la fiche.
- **Statut « Erreur / Test / Doublon »** — hors Kanban, **jamais supprimé** : confirmation avant
  bascule, compteur + lien vers la vue tableau.
- **Le transport se calcule dès que le PLU rend la parcelle**, détail du calcul affiché. Sans terrain,
  l'écran le dit — un zéro se lirait comme une livraison offerte. Le champ reste une **surcharge**.
- **Le récapitulatif se relit avant de partir** : aperçu du **vrai** template Brevo peuplé du lead.
  `construireParamsRecap()` sert l'aperçu **et** l'envoi — sinon l'écran finirait par mentir sur des prix.
- **Plaquette : un lien, un fichier désigné.** 64,6 Mo → 1,69 Mo après ré-export (compression JPEG
  au lieu de Flate). La version publiée vise l'écran ; **l'original reste le fichier d'impression**.

## ⚠ Ouvert, né de cette session
- **Double opt-in non câblé** — `addBrevoContactDOI()` existe, n'est appelé nulle part. Opt-in simple,
  légal, mais le nom de la fonction laisse croire l'inverse.
- **NAF rév. 2 → NAF 2025 au 1er janvier 2027** : les 5 cibles seront à revoir.
- **Coordonnées réelles de l'atelier** toujours attendues (`TRANSPORT.usine` approximatif).
- **Les 5 leads de prod n'ont pas de cible** — les premiers chiffres ne porteront que sur les appels
  saisis à partir du 2026-08-27.
- **Aucune Preview parcourue avant fusion** sur ces quatre PR — choix de Richard, consigné.
- **PR #102 à fusionner** quand Richard le décidera.

## Leçons de méthode encore actives
- **Un contrôle qui n'observe pas la sortie réelle ne contrôle rien** — cinquième occurrence.
  Cette fois : un tag Brevo inconnu est indiscernable d'un tag valide dans le template source, et un
  `200` ne prouve pas qu'un fichier est servi (486 Ko de HTML au lieu d'un PDF de 1,7 Mo).
- **`success: true` d'une migration ne prouve rien** : vérifier par requête, **puis** tester la
  contrainte par des écritures réelles systématiquement annulées.
- **Une variable serveur se lit dans la fonction**, jamais en tête de fichier.
- **Pas de test local** (ni dev server, ni Playwright, ni `next build`). Gate = `tsc --noEmit` +
  `eslint` + `npm run check:vocabulaire`, puis Preview Vercel.
- **Une Preview protégée par le SSO Vercel ne sert pas à vérifier une garde d'authentification.**

## Prochaine action
1. **Envoyer un récapitulatif réel** depuis le back-office : c'est la seule vérification qui reste
   sur la chaîne emails (lien plaquette, `{{ unsubscribe }}`, ligne de livraison avec distance).
2. **PR #102** — à fusionner sur décision de Richard.
3. **ADR-031** — soumission de la demande de numéro : toujours le chantier qui conditionne la bascule
   sur `/configurer`, la levée du `noindex` et le retrait du v1.

## Blockers / À fournir
- **Coordonnées exactes de l'atelier** (transport).
- **Albert** — charte Affinity (ADR-002), repositionnement bi-produit (ADR-022), **repositionnement
  « studio de jardin » du 2026-08-19**, ouverture B2B de la page Biarritz, CGV rédigées en « maison ».
- **Médiateur de la consommation non nommé** (art. L.616-1) — avant toute communication commerciale.
- **ADR-028** — test de réversibilité jamais exécuté.
