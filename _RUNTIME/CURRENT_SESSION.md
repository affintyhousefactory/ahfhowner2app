# CURRENT_SESSION — Howner / ARKO

> Mémoire courte. Historique complet et backlog → `00_INDEX/PROJECT_STATE.md` § « Dernier point ».
> Règle : 300–1200 tokens.

## Décisions — 2026-08-28 (l'écran d'appel prend sa forme)

**`main` = `62250a24`.** Trois PR en production (#108, #109, #110), une migration (`lead_sourcing`).

Le CRM tient désormais **le premier appel de bout en bout** : chercher si le contact est connu →
cible et sourcing → ce qui n'est pas chiffrable → transport calculé seul → appel journalisé →
récapitulatif relu avant envoi. Et la fiche se consulte par compartiments.

- **Étapes librement navigables** — Richard a retenu les étapes contre ma recommandation. Le risque
  signalé (le prospect parle dans le désordre) est neutralisé : barre cliquable de bout en bout,
  « Créer le lead » actif partout. **La structure guide, elle n'enferme pas.**
- **Sourcing ≠ `source`** — le premier dit d'où vient le prospect (8 valeurs), le second comment la
  ligne a été écrite (`admin`, `configurateur_v2`). C'est le sourcing qui dira si le phoning paie.
- **Le premier appel entre au journal** — l'écran demandait un « prochain rappel » sans jamais
  demander *quand* l'appel avait eu lieu (constat de Richard). Deux dates deviennent une : celle de
  l'appel est **maintenant**. Son échec n'annule pas le lead (`appelJournalise`).
- **Fiche en cinq onglets** avec compteurs — le journal d'appels cesse d'être en bas d'une colonne.
- **Numéros cliquables** — premier pas vers Allo, **sans intégration** : le click-to-call passe par
  l'extension Chrome. D'où les numéros visibles **dans la liste**, pas seulement sur la fiche : c'est
  cette page que l'extension lit pour remplir le Power Dialer.
- **Huit grilles étaient fixes** — sur 390 px, deux colonnes de champs sont des timbres-poste.

## ⚠ Une régression introduite et fermée le jour même
`TelephoneLien` portait un `onClick` **sans `"use client"`**, rendu depuis un **Server Component** :
la fiche tombait en « This page couldn't load » — **mais seulement si le lead avait un numéro**.
Signalée par Richard, corrigée (PR #109) en retirant le handler, inutile.

> **Leçon** : un composant partagé destiné à des pages serveur ne porte **aucun** gestionnaire
> d'événement. Vérifié ensuite sur tout le back-office — c'était le seul cas.

> **Leçon évitée de justesse** : monter tous les onglets d'emblée aurait cassé la carte — Leaflet en
> `display:none` se dimensionne à zéro. D'où le montage à la première visite, puis conservation.

## ⚠ Une consolidation a voyagé dans une PR de fonctionnalité
Le `/memory-sync` du matin est parti en production avec la **PR #108**, dont la description n'en
disait rien : la branche de la fonctionnalité avait été créée depuis la branche docs. Sans
conséquence, mais **repartir de `main` avant d'ouvrir une branche**.

## Allo — étudié, rien engagé
Click-to-call = **extension Chrome**, zéro code. L'API expose `/v2/api/crm/people` et
`/v2/api/dialing-queues/current`, **aucun endpoint de déclenchement d'appel**. Trois inconnues avant
de s'engager : scope d'écriture réel, événements de webhook, clé de rapprochement des identités.
**Dépendance externe critique → ADR + alerte Albert avant tout code**, comme Pennylane (ADR-036).

## Leçons de méthode encore actives
- **Un contrôle qui n'observe pas la sortie réelle ne contrôle rien** — septième occurrence.
- **Une intégration tierce vérifiée en Preview ne prouve rien pour le domaine réel** quand elle
  filtre par référent (clé Google Places).
- **`success: true` d'une migration ne prouve rien** : vérifier par requête, puis tester la
  contrainte par des écritures réelles annulées.
- **Ne jamais réécrire une migration déjà appliquée** — le dépôt mentirait sur ce qui a tourné.
- **Pas de test local.** Gate = `tsc` + `eslint` + `check:vocabulaire`, puis Preview.

## Prochaine action
1. **Poser `BREVO_TEMPLATE_MULTICFG=17`** sur les 3 scopes Vercel — sans elle, la Multi-Configuration
   est livrée mais **inerte en production**.
2. **Ouvrir `howner.fr/*` et `www.howner.fr/*`** dans les référents de la clé Google Places.
3. **Envoyer un récapitulatif réel** — dernier maillon non éprouvé de la chaîne emails.
4. **Temps 2 du CRM** — aucune issue d'appel ne décrit un rendez-vous ; c'est le chaînon qui manque
   avant la qualification des services amont (`docs/CRM_PROCESS_COMMERCIAL.md`).

## Blockers / À fournir
- **Coordonnées exactes de l'atelier** (le transport en dépend).
- **Albert** — charte Affinity (ADR-002), repositionnement bi-produit (ADR-022), repositionnement
  « studio de jardin » du 2026-08-19, ouverture B2B de Biarritz, CGV rédigées en « maison ».
  **À ajouter : Allo, si l'intégration est décidée.**
- **Médiateur de la consommation non nommé** (art. L.616-1) — avant toute communication commerciale.
- **ADR-028** — test de réversibilité jamais exécuté.
