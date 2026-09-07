# ADR-031 — Soumission de la demande de numéro : du configurateur au lead

- **Statut** : Accepté
- **Date** : 2026-08-21 — **amendée le 2026-09-07** (le visiteur ne choisit plus son exemplaire : §5 sans objet, `slot` à `null`)
- **Phase** : 4
- **Faisabilité** : 🟠 Moyenne — aucune inconnue technique, mais deux objets de base à corriger avant la première écriture.
- **Alerte Albert** : **Oui — première écriture en production depuis le site public, et changement de règle sur l'unicité du numéro de série.**

## Contexte

Le configurateur v2 est complet : sept écrans, neuf sections, un récapitulatif,
des contrôles de saisie et un bouton qui **ne fait rien**. `onAction` est un
corps vide depuis le 2026-08-02, et l'entonnoir entier y mène depuis le même
jour — assumé par Richard le 2026-08-19, la réservation passant par la ligne
téléphonique en attendant.

ADR-035 a posé le contrat de données que cette soumission doit remplir :
`config_v2` en jsonb pour la fidélité, colonnes plates `cfg_*` pour ce sur quoi
le CRM trie et agrège, `slot` pour le numéro. Le CRM sait déjà lire et afficher
tout cela. **Il ne manque que l'écriture.**

### Ce que la base contient déjà

Vérifié sur la production le 2026-08-21, colonne par colonne :

- l'identité et la joignabilité — `prenom`, `nom`, `email`, `tel` ;
- **l'adresse postale du client** — `adresse_postale_client`, `cp_client`,
  `ville_client`, présentes et inutilisées ;
- la parcelle et son analyse — `parcelle_idu`, `plu_adresse`, `plu_zone`,
  `plu_typezone`, `plu_lat`, `plu_lon`, `plu_prescriptions`, `plu_servitudes` ;
- la configuration — `config_v2`, `cfg_version`, `cfg_usage`, `cfg_quantite`,
  `cfg_modele`, `cfg_ambiance`, `cfg_terrasse`, `cfg_options` et les cinq
  colonnes de prix ;
- le suivi commercial — `statut`, `statut_commercial`, `responsable`, `source`.

**Une seule colonne manque** : `cfg_ambiance_interieure`, ajoutée au parcours le
2026-08-20.

### Les deux objets qui bloquent

Relevés le 2026-08-04, toujours en l'état, et **dormants seulement parce que
rien n'écrit** :

```
leads_slot_unique   UNIQUE (slot) WHERE slot IS NOT NULL
leads_slot_check    CHECK (slot >= 1 AND slot <= 12)
```

Le premier contredit frontalement la règle du numéro posée par ADR-035
(`etatNumeroPourStatut()`) : **il bloque un numéro dès le premier lead qui le
vise, quel que soit son statut.** Deux visiteurs qui souhaitent le n° 03 dans la
même semaine — situation banale sur une série de six — produiraient un succès
pour le premier et une erreur d'insertion pour le second. Le second est pourtant
un prospect qualifié qu'aucune règle commerciale ne justifie d'éconduire.

Le second borne le numéro à 12 quand la série en compte 6 depuis le 2026-08-04.

## Décision

### §1 — Une route dédiée, `POST /api/configurateur/reservation`

Pas d'extension de `/api/reservation`, qui sert le tunnel v1 : deux formats de
charge utile dans une même route obligerait à distinguer l'appelant à chaque
évolution. Le v1 disparaîtra avec la bascule ; sa route disparaîtra avec lui.

### §2 — L'unicité porte sur le numéro **confirmé**, pas sur le numéro demandé

C'est la décision structurante de cet ADR.

`leads_slot_unique` est remplacé par un index partiel qui ne contraint que les
leads dont le numéro est réellement pris :

```sql
drop index if exists leads_slot_unique;
create unique index leads_slot_confirme_unique
  on public.leads (slot)
  where slot is not null
    and statut_commercial in ('paiement_reserve', 'signe');
```

Cela met la base en accord avec `etatNumeroPourStatut()`, qui distingue depuis le
2026-08-04 trois états : rien avant le devis, **réservé** au devis envoyé
(reprenable), **bloqué** à l'encaissement. Plusieurs demandes peuvent viser le
même numéro ; une seule peut le confirmer.

`leads_slot_check` passe de `1..12` à `1..6`. La production ne porte aucun lead,
le durcissement est sans risque — il l'aurait été sur Preview, qui portait une
ligne de test hors bornes (constaté le 2026-08-04).

### §3 — Une seule colonne ajoutée

```sql
alter table public.leads add column if not exists cfg_ambiance_interieure text;
```

Rien d'autre. L'adresse postale du client, elle, existe déjà : la soumission la
remplit enfin.

### §4 — L'échec ne se tait jamais, et ne bloque pas

Reprise de la règle de `src/shared/lib/panne.ts`, actée le 2026-08-18 après avoir
découvert que trois surfaces annonçaient un succès pendant que rien ne
s'enregistrait.

La route renvoie **trois faits distincts**, jamais un booléen unique :

```
{ ok: true, persisted: boolean, notified: boolean }
```

Si l'insertion échoue, l'email part quand même et AHF reçoit la demande — perdre
le lead serait pire que perdre la ligne. Mais l'écran ne dit pas « enregistré »
quand rien ne l'est, le journal porte le préfixe `[PANNE]`, et le message de
confirmation distingue « demande reçue » de « demande enregistrée ».

### §5 — Numéro déjà confirmé : proposer, ne pas échouer

Si l'index rejette l'insertion parce que le numéro vient d'être confirmé par un
autre client, la route répond **409** avec la liste des numéros encore
disponibles. L'écran invite à en choisir un autre sans perdre la configuration
saisie — un formulaire de sept écrans ne se resaisit pas.

### §6 — Ce que le lead porte à sa création

| Champ | Valeur |
|---|---|
| `statut` | `nouveau` |
| `statut_commercial` | `nouveau` |
| `source` | `configurateur_v2` |
| `slot` | le numéro demandé |
| `cfg_*`, `config_v2` | la configuration et sa `cfg_version` |
| `plu_*`, `parcelle_idu` | l'analyse de terrain, **si elle a eu lieu** |
| `plu_consent` | le consentement de l'analyse |

**La nature « sous condition » se lit, elle ne se stocke pas dans un champ
dédié** : un terrain non testé laisse les colonnes `plu_*` vides, un terrain
jugé non éligible porte son `plu_typezone`. Le CRM en déduit ce qu'il affiche.
Ajouter un booléen « sous condition » créerait une seconde vérité à tenir
d'accord avec la première.

### §7 — Anti-spam et emails

Turnstile (ADR-024) protège la route, comme `/api/contact`. Les emails passent
par Brevo avec un template dédié (ADR-026) : confirmation au client,
notification à AHF.

⚠ **Limite connue et non levée** : `sendBrevoTemplate` envoie **un seul** message
avec les **mêmes paramètres** au client et à AHF. Une alerte de panne destinée à
AHF s'afficherait donc au client. Le porter proprement demande un paramètre
ajouté au template dans le tableau de bord Brevo — hors périmètre de cet ADR,
signalé pour ne pas être redécouvert.

### §8 — Ordre d'application, non négociable

1. `cfg_ambiance_interieure` ajoutée ;
2. `leads_slot_check` desserrée puis resserrée à 6 ;
3. `leads_slot_unique` remplacée par l'index partiel ;
4. **vérification par requête** — structure relue, contraintes relues, pas de
   `success: true` pris pour preuve (règle du 2026-08-18) ;
5. route et écran déployés ;
6. **essai de bout en bout sur Preview** avant Prod, avec deux demandes sur le
   même numéro pour éprouver précisément ce que corrige le §2.

## Faisabilité

- **Verdict** : 🟠 Moyenne. Aucune inconnue technique — la table existe, le
  contrat de données est écrit, le CRM sait lire. Le risque est celui d'une
  première écriture en production et d'un changement d'index sur une contrainte
  d'unicité.
- **Dépendances externes** : Supabase (migration), Brevo (template), Cloudflare
  Turnstile (déjà en place).
- **Risques** :
  - *Première écriture publique* — la route est ouverte à tous. Turnstile et la
    validation serveur sont les seules barrières.
  - *Index d'unicité modifié* — un index partiel mal écrit laisserait deux leads
    confirmer le même numéro. À vérifier par un essai réel, pas par lecture.
  - *RGPD* — la demande porte identité, adresse postale, téléphone et parcelle.
    Le consentement CGV et l'opt-in sont recueillis ; la politique de
    confidentialité doit mentionner la conservation de l'analyse de terrain.
  - *CGV non validées par l'avocat* (ADR-015) — la soumission fait accepter des
    CGV qui ne le sont toujours pas. **Ce risque préexiste et s'aggrave** : il
    passe d'un texte affiché à un texte accepté par un client identifié.

## Conséquences

- **L'entonnoir devient fonctionnel.** Le guardrail « cet état ne doit pas
  atteindre `main` » d'ADR-030, caduc depuis le 2026-08-19, cesse d'avoir un
  objet.
- **La bascule `/configurer/v2` → `/configurer`** devient possible : levée du
  `noindex`, retrait du v1, sortie de `/configurer` du sitemap. À traiter dans un
  lot distinct, avec la redirection.
- **Le compteur public de numéros** peut enfin refléter la base plutôt qu'une
  liste statique (`chargerNumeros()`), ce qui rejoint ADR-009.
- **ADR-035 est confirmée dans son pari** : le CRM a été refait avant la
  soumission pour poser le contrat de données. Il n'y a rien à y adapter.

## Application

**Migration `20260821_adr031_soumission_numero.sql` appliquée sur Preview
(`ahfhownerdb-preprod`) le 2026-08-21**, sur accord de Richard.

**Vérifiée par requête, pas sur `success: true`** (règle du 2026-08-18) :
colonne `cfg_ambiance_interieure` présente, `leads_slot_check` borné à
`slot is null or (1..6)`, `leads_slot_unique` disparu,
`leads_slot_confirme_unique` créé avec sa clause partielle, zéro numéro hors
bornes.

**Et surtout vérifiée fonctionnellement**, ce qui était l'objet même du §2 —
la structure ne prouvait rien :

1. deux demandes non confirmées sur le n° 5 → **acceptées**, ce que l'ancien
   index refusait ;
2. la première confirmée en `paiement_reserve` → **acceptée** ;
3. la seconde confirmée en `signe` sur le même numéro → **rejetée**
   (`23505 duplicate key ... leads_slot_confirme_unique`).

Les lignes d'essai ont été retirées. `get_advisors` security et performance ne
remontent que des points préexistants et sans rapport (protection des mots de
passe compromis côté Auth, index inutilisés, politiques RLS du domaine
mandataire suspendu).

⚠ **Un lead de test de Preview portait le n° 12** et empêchait de resserrer la
contrainte. Son numéro a été relâché à `NULL` plutôt que la ligne supprimée :
le lead reste lisible, seul son numéro — devenu impossible — s'efface.

⚠ **Prod non appliquée** : la table y est vide et la règle du projet veut que
les migrations passent en production à la validation de la PR `dev` → `main`.

**Reste à écrire** : la route `POST /api/configurateur/reservation` et le
branchement du bouton. Les migrations ne font qu'ouvrir la voie.

---

## Amendement du 2026-09-07 — le visiteur ne choisit plus son exemplaire

Décision de Richard : **la grille de numéros disparaît du parcours public.**
L'exemplaire est attribué par le conseiller depuis le CRM, une fois la
disponibilité vérifiée.

### Pourquoi, et ce que cela répare

`chargerNumeros()` était un placeholder : il renvoyait six numéros libres **en
dur**, sans jamais lire la base. La grille affichait donc un état qui n'existait
pas, et le § Conséquences de cet ADR le disait déjà — « le compteur public peut
enfin refléter la base plutôt qu'une liste statique ». Il n'y a pas eu de
préjudice : la table de production compte peu de leads et aucun numéro n'a été
attribué en double. Mais la promesse était intenable telle quelle.

Deux voies s'offraient : **brancher la grille sur la base** (ADR-009, temps
réel), ou **retirer le choix**. Richard retient la seconde, et c'est la bonne
au regard de ce que le parcours est devenu : sans paiement en ligne (ADR-008),
un numéro « choisi » n'engageait rien, et il fallait de toute façon un appel
pour le confirmer. Le choix décorait une décision prise ailleurs.

### Ce qui change, par rapport aux paragraphes de la décision initiale

| § | Ce qui était décidé | Ce qui s'applique depuis le 2026-09-07 |
|---|---|---|
| §5 | Numéro déjà confirmé → **409** + liste des numéros libres, l'écran invite à rechoisir | **Sans objet.** Aucun numéro n'est demandé : il n'y a plus de course à arbitrer. Le 409, l'état `conflit` du parcours et la fonction `numerosLibres()` de la route sont retirés |
| §6 | `slot` ← le numéro demandé | `slot` ← **`null`**. Le conseiller l'attribue depuis `LeadConfiguration.tsx` |
| §7 | Template Brevo dédié | Inchangé — mais `NUMERO` part **vide** (voir Reste à faire) |

**§2 reste vrai et reste utile.** L'unicité porte sur le numéro *confirmé*
(`leads_slot_confirme_unique`, index partiel `WHERE slot IS NOT NULL`) : elle
protège désormais l'attribution faite en CRM, qui est le seul endroit où un
numéro se pose. La migration `20260821_adr031_soumission_numero.sql` reste
appliquée et pertinente — **rien à défaire en base**, et `slot` était déjà
nullable.

**§4 reste vrai** : l'échec ne se tait jamais et ne bloque pas. Un seul
ajustement — une violation `23505` à l'insertion n'est plus interprétée comme
« numéro pris ». Avec `slot: null`, l'index partiel ne s'applique pas ; un
doublon viendrait d'ailleurs, et le traiter en « rechoisissez un numéro »
aurait affiché au visiteur une explication fausse. Il redevient ce qu'il est :
une panne d'écriture, signalée (`signalerPanne`) et non bloquante.

### Ce que le visiteur voit à la place

Le bouton s'appelle **« Être rappelé »** et un bandeau **« Arko — édition
limitée / Exemplaires en nombre limité »** ouvre la colonne, **sans volume
affiché** — ADR-030 § Amendement du 2026-09-07, points 5 et 6. L'accusé de
réception à l'écran ne promet plus de « confirmer votre numéro » mais un rappel
du conseiller : rouvrir par l'email ce que le parcours vient de fermer aurait
été le pire des deux mondes.

### Reste à faire — hors de ce lot

1. **Template Brevo 9** — il porte encore une ligne « numéro ». La route envoie
   `NUMERO: ""` : le rendu est vide, jamais faux, mais la ligne doit disparaître
   **côté Brevo**. ⚠ Le même template sert le tunnel v1, qui lui transmet
   toujours un vrai numéro — la retirer maintenant priverait le v1 de
   l'information. À traiter **avec la bascule**, pas avant. Action de Richard,
   dans l'interface Brevo, suivie de `npm run check:vocabulaire:brevo`.
2. **`/configurer` (v1)** sert toujours sa grille de six numéros et reste au
   sitemap. C'est désormais le principal écart entre ce que le site promet et
   ce qu'il tient. Relève de la bascule, déjà inscrite au § Conséquences.
3. **`src/lib/configurateur/numeros.ts`** n'est plus lu par aucun écran. Il est
   **conservé au dépôt** : c'est la seule trace écrite du mode « demandé puis
   confirmé » et de la correspondance statut → état de numéro. Le supprimer
   effacerait la spécification avec le code mort.

### Ce que cet amendement ne fait pas

Il ne rouvre pas ADR-009 : le temps réel sur les numéros devient **sans objet
côté public**, puisqu'il n'y a plus rien à afficher. S'il revient un jour, ce
sera pour le CRM — montrer au conseiller ce qui est réellement pris au moment
où il attribue.

## Sources

- `03_DECISIONS/ADR-030-configurateur-v2.md` — parcours, grilles, §16 n°1.
- `03_DECISIONS/ADR-035-refonte-crm-leads.md` § Amendement du 2026-08-04 —
  contrat `config_v2` / `cfg_*`, règle du numéro, `etatNumeroPourStatut()`.
- `03_DECISIONS/ADR-024-consent-captcha.md`, `ADR-026-emails-resend-templates-supabase.md`.
- `03_DECISIONS/ADR-015-legal-acompte-arrhes-cgv.md` — CGV non validées.
- `src/shared/lib/panne.ts` — règle des trois traces (2026-08-18).
- État de `public.leads` en production, relevé le 2026-08-21 (colonnes,
  contraintes, index).
