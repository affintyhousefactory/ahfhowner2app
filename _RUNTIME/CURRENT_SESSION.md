# CURRENT_SESSION — Howner / ARKO

> Mémoire courte. Historique complet et backlog → `00_INDEX/PROJECT_STATE.md` § « Dernier point ».
> Règle : 300–1200 tokens.

## Décisions — 2026-08-27/28 (l'écran d'appel devient un outil de phoning)

**`main` = `c7a2b14d`.** Quatre PR en production (#102, #105, #106, #107), **cinq migrations**
passées en Preview puis en prod, chacune vérifiée par requête *et* par écritures réelles annulées.

- **Chercher avant de saisir** — trois lettres sur nom, prénom, email ou téléphone, en tête de
  l'Identité. La table comptait **6 leads pour 5 adresses** : le doublon n'était pas une hypothèse.
  Une fiche existante donne un lien vers elle et **ne pré-remplit rien**.
  ⚠ **Brevo n'a pas de recherche** (`search` ignoré) ; il ne porte que PRENOM/NOM/SMS, donc il
  n'est interrogé qu'en dernier recours sur une adresse exacte.
  ⚠ **Deux motifs pour le téléphone** : séparateurs *et* indicatif — **7 numéros sur 13** sont
  stockés en E.164 (`+336…`), sans zéro initial.
- **Email facultatif** — mais une adresse **mal formée** est refusée, signalée à la saisie. Le
  blocage n'était pas dans l'écran : `leads.email` était `not null` depuis juin.
  ⚠ Le motif d'email était écrit **trois fois** dans le dépôt → `shared/lib/validation.ts`.
- **Identité société** — raison sociale, SIREN, site web, adresse. Tous facultatifs.
  ⚠ Adresse **société ≠ client** : le siège d'un camping n'est pas le domicile de son gérant.
  ⚠ SIREN : Luhn **avertit**, ne refuse pas (La Poste = 356000000, exception INSEE).
- **Issue du dernier appel sur le lead** — colonne, **pas un statut de plus** : « où en est
  l'affaire » et « comment s'est fini le dernier échange » sont deux axes. Trigger étendu, pas
  doublé ; l'issue retenue est celle du dernier appel **qui en porte une**.
- **Multi-Configuration élargie** — plusieurs modèles, **ou** options et services personnalisés
  assujettis à devis préalables complémentaires. Deux causes, une conséquence.

## ⚠ Le défaut le plus instructif
**L'autocomplétion Google n'a jamais fonctionné en production.** Clé restreinte par référent :
`*.vercel.app` autorisé, **`howner.fr` bloqué** (403 vérifié sur trois référents). Elle sert
l'adresse client **depuis juillet** et échoue en silence — les champs manuels prennent le relais.
Elle marchait en Preview, ce qui a suffi à la croire opérante. → ADR-027 § Amendement.

## Deux fautes commises et rattrapées, notées car elles se reproduiront
1. **Corriger un commentaire dans une migration déjà appliquée** — le dépôt aurait menti sur ce
   qui a tourné, le défaut même que la PR #102 rattrape. Fichier restauré, correction portée par
   une migration de plus.
2. **Diagnostiquer « cache navigateur » sans sonder.** C'était faux : la section s'affichait,
   c'est Google qui refusait. Sonder plutôt que supposer, même quand la supposition est plausible.

## Leçons de méthode encore actives
- **Un contrôle qui n'observe pas la sortie réelle ne contrôle rien** — sixième occurrence.
- **Une intégration tierce vérifiée en Preview ne prouve rien pour le domaine réel** quand elle
  filtre par référent. Pendant de la leçon du 2026-08-25 sur le SSO Vercel, par l'autre bout.
- **`success: true` d'une migration ne prouve rien** : vérifier par requête, puis tester la
  contrainte par des écritures réelles annulées.
- **Une variable serveur se lit dans la fonction**, jamais en tête de fichier.
- **Pas de test local.** Gate = `tsc` + `eslint` + `check:vocabulaire`, puis Preview.

## Prochaine action
1. **Ouvrir `howner.fr/*` et `www.howner.fr/*`** dans les référents de la clé Google Places.
2. **Poser `BREVO_TEMPLATE_MULTICFG=17`** sur les 3 scopes Vercel, puis redéployer — sans elle la
   Multi-Configuration est livrée mais **inerte en production**.
3. **Envoyer un récapitulatif réel** : dernier maillon non éprouvé de la chaîne emails.
4. **Temps 2 du CRM** — aucune des cinq issues ne décrit un rendez-vous. C'est le chaînon qui
   manque avant la qualification des services amont (`docs/CRM_PROCESS_COMMERCIAL.md`).

## Blockers / À fournir
- **Coordonnées exactes de l'atelier** (le transport en dépend).
- **Albert** — charte Affinity (ADR-002), repositionnement bi-produit (ADR-022), repositionnement
  « studio de jardin » du 2026-08-19, ouverture B2B de Biarritz, CGV rédigées en « maison ».
- **Médiateur de la consommation non nommé** (art. L.616-1) — avant toute communication commerciale.
- **ADR-028** — test de réversibilité jamais exécuté.
