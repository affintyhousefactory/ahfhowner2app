# ADR-035 — Refonte du CRM interne (portail `/admin`) sur le socle du configurateur v2

- **Statut** : Accepté — chantier prioritaire, exécuté avant ADR-031
- **Date** : 2026-08-04
- **Phase** : 4 (backend / back-office)
- **Faisabilité** : ✅ Élevée — aucune dépendance externe nouvelle
- **Alerte Albert** : Non — outil interne, ni marque, ni positionnement, ni engagement client. *(La seule question à porter reste celle d'ADR-029 sur le vocabulaire, déjà ouverte.)*

## Numérotation — pourquoi 035 et pas 031

ADR-030 et `PROJECT_STATE.md` réservent explicitement **031** (soumission de la demande de numéro), **032** (dossier terrain), **033** (back-office des grilles tarifaires) et **034** (espace client). Ces numéros sont cités dans le corps d'ADR-030 et dans le code (`src/lib/configurateur/config.ts` renvoie à ADR-033). Les renuméroter pour insérer ce chantier casserait une dizaine de renvois croisés pour un gain nul.

**Priorité ≠ numéro.** Ce chantier est exécuté *en premier* ; il porte le numéro 035.

## Contexte

Le portail `/admin` a été livré le 2026-06-30 pour un modèle économique qui n'existe plus : il était bâti autour du **réseau de mandataires** — affecter un lead à un mandataire, suivre un dossier, calculer une marge AHF sur un pack terrain. ADR-028 a suspendu ce domaine le 2026-07-30. Ce qui reste à l'écran est un CRM amputé : le dashboard n'affiche plus que deux compteurs et un camembert, l'entonnoir et les indicateurs financiers ayant disparu avec les `dossiers`.

Dans le même temps, ADR-030 a livré le **configurateur v2**, dont le parcours produit une configuration bien plus riche que celle du v1 : usage (annexe / professionnel / terrain nu), quantité d'unités, modèle, ambiance, palier de terrasse, options avec distinction structurelle/libre, transport calculé, numéro de série demandé, le tout sur une **grille versionnée** (`loadConfig()`). Rien de cela n'est aujourd'hui lisible côté back-office : la fiche lead affiche encore les champs du v1 (`config_json` en vrac, `options_labels`, `pack_terrain`).

Enfin, l'usage réel du CRM est désormais **le phoning**. AHF appelle les leads, qualifie, relance. L'outil ne sait ni qui a appelé, ni quand, ni ce qui a été dit, ni quand rappeler. Le seul champ de suivi est `statut_commercial`, sans historique ni échéance.

### Ce qui force la décision

1. **Le CRM doit précéder la collecte.** ADR-031 (soumission de la demande de numéro) va écrire des leads issus du configurateur v2. Si le schéma d'accueil n'est pas défini d'abord, ADR-031 improvisera un format et le CRM devra s'y adapter après coup. **ADR-035 définit le contrat de données ; ADR-031 devient un écrivain dans ce contrat.**
2. **Le suivi téléphonique n'est pas outillé.** Sans journal d'appels ni date de rappel, la relance dépend de la mémoire du conseiller.
3. **L'affectation n'a plus de titulaire.** La colonne « Affectation » de la liste et les widgets du dashboard renvoient à un domaine suspendu.

## Décision

### 1. « Affectation » redevient une notion interne : le conseiller AHF

*(Arbitrage de Richard, 2026-08-04.)*

Un nouveau champ **`responsable`** porte le conseiller AHF qui traite le lead. Il est indépendant du domaine mandataire suspendu (ADR-028) et ne le réactive en rien. La liste des conseillers vit dans `src/lib/crm.ts`, surchargeable par `NEXT_PUBLIC_CRM_CONSEILLERS` — même principe que les grilles du configurateur : **une liste interne ne se code pas en dur dans un écran.**

La colonne « Affectation » du tableau (qui affichait le champ `statut`, cycle de vie hérité du modèle mandataire) est **retirée** de la liste, conformément à la demande. Le champ `statut` n'est pas supprimé pour autant : il reste en base, éditable dans la fiche, et sera réutilisé si le domaine mandataire reprend. Le pilotage quotidien passe désormais par **`statut_commercial`**, seul axe affiché en liste, en Kanban et au dashboard.

### 2. Deux définitions du retard, jamais confondues

*(Arbitrage de Richard, 2026-08-04.)*

| Alerte | Règle | Ce qu'elle dit |
|---|---|---|
| **Rappel dépassé** | `prochain_rappel_at < maintenant` | Un engagement pris n'a pas été tenu. Rouge. |
| **Sans nouvelle** | aucun appel depuis **N jours** (défaut 7) sur un lead ni signé ni perdu | Le lead s'éteint faute de contact. Orange. |

Un lead jamais appelé compte son silence **depuis sa création**, pas depuis un `dernier_appel_at` nul — sans quoi les leads les plus négligés seraient les seuls à n'alerter jamais. `N` est dans `src/lib/crm.ts`, surchargeable par `NEXT_PUBLIC_CRM_SLA_JOURS`.

**L'écart en jours depuis le dernier appel est affiché partout** où un lead apparaît : liste, carte Kanban, fiche, dashboard.

### 3. Journal d'appels et de notes — table `lead_appels`

*(Arbitrage de Richard, 2026-08-04 : saisie manuelle, avec pré-remplissage au clic « Appeler ».)*

Une entrée = un appel **entrant**, un appel **sortant**, ou une **note** libre. Les trois vivent dans une **timeline unique** — séparer les notes des appels obligerait à lire deux colonnes pour reconstituer une relation.

Le clic sur le numéro de téléphone ouvre le lien `tel:` **et** pré-ouvre une fiche d'appel horodatée en sens sortant. **Rien n'est enregistré tant que le conseiller ne valide pas** : un journal qui se remplit tout seul se remplit d'appels qui n'ont pas eu lieu, et perd toute valeur de preuve.

Chaque entrée porte une **issue** (joint / répondeur / pas de réponse / rappel demandé / refus), une note, une durée optionnelle, un auteur, et peut **planifier le prochain rappel** — qui met à jour `leads.prochain_rappel_at`.

**Séparation des rôles assumée** : le lead porte l'échéance *courante* (`prochain_rappel_at`, valeur mutable, ce qui pilote l'alerte) ; le journal porte l'*historique* (immuable). `leads.dernier_appel_at` est dénormalisé et maintenu par **trigger** — le CRM trie et filtre dessus en SQL, ce qu'un agrégat à la volée interdirait sur la liste complète.

### 4. La configuration du parcours v2 est capturée, en double écriture

Le lead reçoit **un instantané JSON** (`config_v2`) *et* **des colonnes plates** (`cfg_*`). Ce n'est pas une redondance de confort :

- Le **JSON** est la fidélité : ce que le client a vu, avec la **version de grille** (`cfg_version`). Les prix « bougeront » (§12 de la spec) ; un lead de mars ne doit pas se relire avec la grille de septembre.
- Les **colonnes plates** sont ce sur quoi le CRM trie, filtre et agrège. Extraire un `jsonb` sur chaque ligne de liste pour compter les Arko Max serait payer cher une information qu'on lit à chaque écran.

Colonnes : `cfg_version`, `cfg_usage`, `cfg_quantite`, `cfg_modele`, `cfg_ambiance`, `cfg_terrasse`, `cfg_options[]`, `cfg_prix_base`, `cfg_prix_terrasse`, `cfg_prix_options`, `cfg_transport`, `cfg_total`.

**Le numéro de série demandé reste `slot`**, colonne existante protégée par un index unique partiel (`20260703_leads_slot_unique.sql`). Aucune colonne concurrente n'est créée. L'état « demandé vs confirmé » du §6 relève d'**ADR-031** et n'est pas anticipé ici — la fiche affiche le numéro et signale explicitement que le verrou n'existe pas encore.

Les libellés (« Arko Max », « Littoral », « Casquette pare-soleil ») ne sont **pas** stockés : ils sont résolus à l'affichage depuis `loadConfig()`, seule source des grilles (ADR-030). Stocker un libellé, c'est le figer.

### 5. GED Client — distinguer qui a déposé quoi

`lead_client_documents` reçoit deux colonnes :

- **`origine`** — `'ahf'` (nous déposons pour le client) ou `'client'` (le client dépose depuis son espace, ADR-034 à venir). Deux fils distincts à l'écran, un total commun.
- **`categorie`** — rattache la pièce à une **liste de pièces attendues** (`PIECES_DOSSIER` dans `src/lib/crm.ts`). L'écran en déduit un état d'avancement du dossier et affiche les pièces **manquantes**.

Pas de table « pièces attendues » : la liste est une constante de configuration, pas une donnée. Une pièce attendue sans document est une absence, pas une ligne.

L'espace client (ADR-034) écrira dans cette même table avec `origine = 'client'` — **le CRM est prêt avant lui**, c'est le sens de la double écriture.

### 6. Écrans

**Dashboard `/admin`** — reconstruit autour du suivi des leads :
- 5 indicateurs : total · à traiter · **rappels dépassés** · **sans nouvelle > N j** · non attribués
- répartition par **statut commercial** (les 8 valeurs, en anneau)
- **charge par conseiller**, empilée par statut — qui porte quoi
- **table « à traiter en priorité »** : rappels dépassés puis silences les plus longs, avec l'écart en jours et un accès direct à la fiche
- les widgets financiers et l'entonnoir restent **derrière `FEATURES.mandataire`**, inchangés (ADR-028)

**Liste `/admin/leads`** — deux vues sur le même jeu de données, commutées par `?vue=` :
- **Tableau** — celui d'aujourd'hui, colonne « Affectation » retirée, colonnes ajoutées : conseiller, dernier appel (écart), prochain rappel (badge de retard), modèle et total configurés
- **Kanban** — 8 colonnes = les 8 `statut_commercial`, glisser-déposer natif (aucune bibliothèque ajoutée : le bundle admin n'a pas à grossir pour huit colonnes), repli au clavier par un sélecteur sur chaque carte

**Fiche `/admin/leads/[id]`** — l'organisation d'ADR-027 est conservée (deux colonnes, terrain et PLU à droite) et complétée :
- en-tête : identification du projet — numéro, nom, statut commercial, conseiller, dernier appel, prochain rappel
- **Identité & projet** — mode lecture / mode édition par « Modifier », étendu au **suivi** (conseiller, prochain rappel) : ce sont les champs que l'on corrige pendant l'appel, ils doivent être dans le même formulaire
- **Configuration** — nouveau bloc : usage, quantité, modèle, ambiance, terrasse, options (structurelles distinguées), détail de prix, numéro demandé, version de grille ; éditable
- **Journal d'appels & notes** — nouveau bloc : timeline, saisie, bouton « Appeler »
- **GED Client** — conservée, enrichie de l'origine et des pièces manquantes
- **Zone de recherche terrain + PLU + carte** — conservées à l'identique (colonne de droite)
- affectation mandataire et GED mandataire : **toujours masquées** derrière `FEATURES.mandataire`

**Création `/admin/leads/nouveau`** — refaite sur les grilles du configurateur v2 (`loadConfig()`), plus les champs du v1. Elle gagne : l'usage, la quantité, l'ambiance, les paliers de terrasse, les options filtrées par modèle (absentes, jamais grisées — §15), le total calculé en direct, le conseiller, le premier rappel, et **la saisie d'un terrain précis** dicté au téléphone (adresse + analyse PLU, déjà outillée par `/api/admin/plu`).

### 7. Les statuts commerciaux ont une seule définition

Les 8 statuts étaient déclarés **trois fois** (liste, sélecteur de fiche, et implicitement au dashboard), avec des libellés et des couleurs déjà divergents. Ils passent dans `src/lib/crm.ts`. Même raison qu'ADR-029 pour le vocabulaire : une valeur dupliquée finit par diverger, et personne ne s'en aperçoit.

## Amendement du 2026-08-04 — « Lead chaud » devient « Paiement réservé »

Arbitrage de Richard, le jour même de la livraison du CRM.

### 1. Le statut cesse d'être une opinion

`chaud` / « Lead chaud » **ne décrivait rien de vérifiable** : deux conseillers ne
mettaient pas le curseur au même endroit, et le Kanban perdait sa valeur de
tableau de bord dès que la colonne se remplissait d'appréciations. Il est
remplacé par **`paiement_reserve` / « Paiement réservé »**, qui constate un fait
comptable unique : **l'encaissement de la réservation du numéro de série**.

**L'identifiant en base est renommé, pas seulement le libellé.** Migration
`20260804_statut_paiement_reserve.sql` : la contrainte `CHECK` tombe, les lignes
en `chaud` passent à `paiement_reserve`, la contrainte est reposée sur la
nouvelle liste. Garder `chaud` en base pendant que l'écran affiche « Paiement
réservé » aurait recréé exactement la divergence que le §7 vient de supprimer —
et le futur connecteur Pennylane écrirait un identifiant qui ment sur son sens.
✅ **Appliquée sur Preview le 2026-08-04, vérifiée par requête** (contrainte
relue, 1 ligne migrée). Prod : à la validation `dev` → `main`, comme
`20260804_crm_leads.sql`.

La teinte passe d'orange à teal : la progression du Kanban se lit désormais
jaune (devis) → teal (payé) → vert (signé), au lieu d'un orange qui disait
« urgent » là où il faut lire « acquis ».

### 2. Le numéro de série a deux niveaux de prise

Règle métier posée par Richard, qui n'existait nulle part en code :

| Statut du lead | Numéro de série | Sélectionnable côté visiteur |
|---|---|---|
| avant « Devis envoyé » | **rien** — plusieurs leads peuvent viser le même | oui |
| **Devis envoyé** | **réservé** (`demande`) — retiré des propositions commerciales, mais reprenable tant que rien n'est payé | oui |
| **Paiement réservé**, Signé | **bloqué** (`confirme`) — définitif, décrémente le compteur public | non |
| Non retenu | relâché | oui |

C'est la formalisation du mode « demandé puis confirmé » d'ADR-030 § Écarts, qui
jusqu'ici ne disait pas **ce qui** déclenchait le passage d'un état à l'autre.
La correspondance vit dans `etatNumeroPourStatut()` (`src/lib/crm.ts`), jamais
dupliquée dans un écran ni dans `numeros.ts`.

**Rendu** : le numéro apparaît en badge à côté du modèle dans la liste des leads
et sur les cartes du Kanban (`NumeroSerieBadge`), teinté selon le niveau de
prise. Un conseiller qui arbitre entre deux leads sur le même numéro voit
immédiatement lequel a payé.

⚠ **Ceci est le contrat, pas encore l'application.** `chargerNumeros()` renvoie
toujours des données statiques : tant qu'ADR-031 n'a pas posé la table des
numéros, **rien ne décrémente réellement le stock**.

### 3. Deux objets de base contredisent la règle — non traités ici

Relevés en écrivant cet amendement, laissés en l'état faute d'arbitrage :

- **`leads_slot_unique`** (`20260703_leads_slot_unique.sql`) — index unique
  partiel sur `slot` dès qu'il est non nul. Il **bloque le numéro au premier
  lead qui le choisit**, quel que soit son statut : c'est l'inverse exact de la
  règle ci-dessus, qui veut qu'un numéro reste libre jusqu'au devis. Tant que
  la soumission du configurateur n'écrit pas (ADR-031), la contradiction est
  dormante ; elle deviendra bloquante le jour où deux visiteurs viseront le
  même numéro — le second verra une erreur d'insertion.
- **`leads_slot_check`** — `CHECK (slot BETWEEN 1 AND 12)`, encore calé sur
  l'ancien volume de série. Prod est vide (0 lead), Preview porte **1 ligne de
  test avec `slot > 6`** : durcir la contrainte à 6 échouerait sur Preview sans
  purge préalable.

**À trancher avec ADR-031**, qui portera la table des numéros et donc le bon
endroit pour l'unicité (sur le numéro confirmé, pas sur le souhait du lead).

### 4. Synchronisation Pennylane — intention, pas décision

`paiement_reserve` a vocation à être **posé automatiquement depuis Pennylane**
(MCP/API), en constatant l'encaissement. D'ici là il reste saisissable à la main
dans la fiche. **Le connecteur fera l'objet de son propre ADR** : c'est une
dépendance externe critique (authentification, appariement facture ↔ lead,
fréquence de synchronisation, comportement en cas de remboursement), donc une
alerte Albert au sens de `CLAUDE.md`. Rien n'est engagé ici hors le nom du
statut.

## Amendement du 2026-08-27 — l'écran d'appel : cible, distance, relecture

Quatre décisions de Richard, prises en travaillant l'écran de pré-qualification.
Toutes livrées en production.

### 1. Cible commerciale — obligatoire, en tête de l'écran

Les **cinq cibles du script de phoning** (`PITCHS_PAR_CIBLE.md`, projet
AHF_MARKETING), dans l'ordre du document et avec ses libellés exacts. Ce ne sont
pas des catégories inventées après coup : chacune a sa trame d'appel — accroche,
punch lines, objections propres. Renseigner la cible, c'est enregistrer **avec
quelle trame le contact a été mené**. Un lead sans cible est un appel dont on
ignore ce qui a été dit.

L'encart est placé **avant l'identité** : c'est la question qu'on se pose avant
de composer le numéro, pas après avoir raccroché.

Chaque cible porte ses **codes NAF**, affichés sous elle — ce sont eux qui
relient le lead aux fichiers de prospection HPA.

| | Cible | NAF rév. 2 |
|---|---|---|
| 1 | Campings et hôtellerie de plein air | `55.30Z` |
| 2 | Hôtels, domaines, gîtes et hébergements touristiques | `55.10Z` · `55.20Z` |
| 3 | EHPAD, résidences services seniors, médico-social | `87.10A` · `87.30A` · `87.10C` · `87.30B` |
| 4 | Collectivités, employeurs et logement des saisonniers | `84.11Z` · `55.90Z` · `68.20B` |
| 5 | Particuliers investisseurs disposant de fonds | `68.20A` — **seulement en SCI** |

⚠ **NAF rév. 2, pas NAF 2025.** Chaque libellé vérifié un à un sur insee.fr le
2026-08-27, et d'abord la nomenclature elle-même : la NAF 2025 est publiée mais
**ne codera les APE qu'au 1er janvier 2027**. Jusque-là, les codes portés par les
entreprises et par les fichiers de prospection sont ceux de la rév. 2. **À revoir
à la bascule.**

La cinquième cible ne reçoit **pas** de code par défaut : un particulier n'exerce
pas d'activité enregistrée. En inventer un aurait rendu la colonne inexploitable
pour le ciblage.

⚠ **Colonne `nullable` malgré l'obligation à la saisie.** Le back-office l'exige
du conseiller, mais les leads nés sur le site public n'ont personne pour la
renseigner : un `not null` aurait fait échouer leur enregistrement, c'est-à-dire
perdu un lead pour cause de champ administratif. L'obligation est là où elle a du
sens — dans l'écran d'appel. La contrainte de **valeur** est bien en base
(`leads_cible_commerciale_check`).

**Corrigeable depuis la fiche** (décision du 2026-08-27) : une cible se choisit au
premier appel, et c'est là qu'on se trompe. La chaîne vide est convertie en
`null` à l'envoi — le `check` accepte l'absence de valeur, jamais `''`.

### 2. Statut « Erreur / Test / Doublon » — le rebut a son statut

Une saisie de test, un doublon, une frappe ratée : des lignes qui existent en base
mais ne décrivent personne. « Non retenu » ne convenait pas — il dit qu'un
prospect a dit non, ce qui est une **information commerciale**. Celui-ci dit qu'il
n'y a jamais eu de prospect.

`horsKanban: true` le prive de colonne : mêlées aux vraies, ces lignes faussent
les compteurs. **Retiré du Kanban, jamais supprimé** — la ligne reste en base et
dans la vue tableau, d'où on peut lui rendre un statut.

Deux garde-fous, parce qu'une carte qui s'évanouit se lit comme une suppression :
une **confirmation** qui dit ce qui va se passer *et* où le lead se retrouvera ;
un **compteur sous le Kanban** avec le lien vers la vue tableau. Sans lui, le
rebut serait un trou noir.

⚠ Ici, **l'écran et la base doivent avancer ensemble** : la contrainte
`leads_statut_commercial_check` est **remplacée**, Postgres n'ajoutant pas une
valeur à un `check` en place. Les huit valeurs précédentes sont reprises à
l'identique — les retirer invaliderait les lignes existantes.

### 3. Le transport se calcule pendant l'appel

Le conseiller le saisissait de tête. Le calcul existait pourtant
(`transportEur()`), mais n'était câblé que sur le configurateur public.

Dès que l'analyse PLU rend des coordonnées, l'écran affiche la distance **et le
détail** : `412 km depuis l'atelier de Bayonne · grutage 1 440 € + 412 km ×
2,16 €/km (9 t) = 2 330 €`. Le détail, pas seulement le résultat — un conseiller
qui annonce un prix au téléphone doit pouvoir dire d'où il sort.

**Sans terrain identifié, rien n'est calculé**, et l'écran le dit : un zéro se
lirait comme une livraison offerte.

**Le champ reste une surcharge, pas un pré-remplissage.** Pré-remplir aurait été
plus simple à écrire et plus faux à l'usage : au moindre changement de modèle le
poids change, donc le prix, et une correction saisie deux minutes plus tôt serait
écrasée sans que personne le voie.

`distanceAtelierKm()` rejoint `transportEur()` dans `lib/configurateur/config.ts`.
Elle vivait en copie privée dans le configurateur public et nulle part côté
back-office : deux calculs pour un même prix, c'est un jour où le devis du site
et celui de l'appel ne tombent plus pareil.

`distance_km` est figée dans l'instantané `config_v2` — pas recalculée. Un client
à qui on a annoncé 412 km au téléphone doit lire 412 km dans son email.

⚠ **`TRANSPORT.usine` reste approximatif** — « à affiner avec adresse exacte
atelier », dit `site.ts` depuis l'origine. Sur 300 km l'écart est dans le bruit ;
sur un client à 15 km, il se voit. **Coordonnées réelles toujours attendues.**

### 4. Le récapitulatif se relit avant de partir

Il s'envoyait d'un clic depuis la fiche, sans que personne ait vu ce qui partait.
Sur un premier appel retranscrit à la volée, ce qui part porte un prix, une
distance et un nom.

`RecapClientApercu` affiche le **vrai template Brevo** peuplé des valeurs du lead,
dans une iframe (`sandbox=""` : on l'affiche, on ne l'exécute pas). Le template
est lu **chez Brevo**, pas dans le repo — c'est Brevo qui enverra, donc c'est son
template qui fait foi. Une copie locale aurait divergé dès la première retouche
dans l'éditeur ; le 2026-08-26 en donne deux exemples.

**Une seule construction des valeurs** : `construireParamsRecap()` sert l'aperçu
et l'envoi. Deux constructions pour un même email, c'est un écran qui finit par
montrer autre chose que ce qui part — et il montrerait des prix.

`leads.recap_envoye_at` trace l'envoi : sans elle, à deux conseillers, le client
reçoit deux fois le même devis. La date est écrite **après** l'envoi et son échec
ne le remet pas en cause (`horodate: false`) — une trace manquée ne doit jamais
annuler un envoi réussi.

## Faisabilité

- **Verdict** : ✅ Élevée. Aucune API externe, aucune clé, aucun service nouveau. Une migration additive.
- **Dépendances externes** : aucune. Google Places et `/api/admin/plu` sont déjà en place et inchangés.
- **Migration** : `supabase/migrations/20260804_crm_leads.sql` — **purement additive** (`add column if not exists`, `create table if not exists`, un trigger). Aucune colonne supprimée, aucune contrainte durcie sur l'existant, aucun risque de perte. ✅ **Appliquée sur Preview (`ahfhownerdb-preprod`, `ixozlavseaykxmjtkkrk`) le 2026-08-04** ; reste à appliquer sur Prod à la validation de la PR `dev` → `main`.
  - **Vérifié sur Preview, pas seulement annoncé** : 17 colonnes sur `leads`, 10 sur `lead_appels`, 2 sur `lead_client_documents`, 6 index, RLS active + 1 politique, trigger et 2 fonctions en place. **Trigger testé fonctionnellement** — une `note` ne compte pas comme contact ; entre deux appels, le plus récent gagne ; la suppression du plus récent fait retomber sur le suivant ; la suppression de tout ramène à `NULL`. Données de test intégralement retirées (5 leads inchangés, 0 entrée résiduelle).
- **Risques** :
  - *⚠ Défaut de sécurité relevé et corrigé à l'application sur Preview (2026-08-04)* — les deux fonctions du trigger étaient déclarées `SECURITY DEFINER`, et **PostgREST expose tout ce qui vit dans le schéma `public`** : `leads_recalc_dernier_appel(uuid)` était appelable en `/rest/v1/rpc/` par le rôle **`anon`**, ce qui donnait à un visiteur non authentifié une écriture sur `leads.dernier_appel_at` **en contournant la RLS**, pour tout lead dont il devinait l'UUID. Portée limitée (la fonction ne peut écrire que la valeur recalculée, donc `NULL` en l'absence d'appels) mais c'est une primitive d'écriture, et elle n'avait aucune raison d'exister. **Correctif** : la fonction passe en `SECURITY INVOKER` — elle n'est appelée que depuis le trigger, lui-même `DEFINER`, donc elle s'exécutait déjà avec les droits du propriétaire — et les deux fonctions perdent le droit d'exécution (`revoke all … from public, anon, authenticated`). Un trigger ne contrôle pas `EXECUTE` au déclenchement (le contrôle a lieu à la création), le retrait est donc sans effet sur le fonctionnement — **vérifié par un nouveau test après correctif**. Audit Supabase revenu propre sur ce point. **Règle à retenir : dans Supabase, une fonction `SECURITY DEFINER` posée dans `public` est une route API publique tant qu'on ne lui retire pas l'exécution.**
  - *Le trigger `dernier_appel_at` n'est pas testable en local* (contrainte de méthode active : ni dev server, ni build local). Il est écrit pour être idempotent et recalculer depuis la source à chaque écriture, plutôt que d'incrémenter un état — une erreur de trigger ne peut pas produire une valeur durablement fausse, seulement une valeur en retard d'une écriture. Vérification sur Preview.
  - *Glisser-déposer natif* — pas de support tactile en HTML5 DnD. D'où le sélecteur de statut conservé sur chaque carte, qui n'est pas un repli dégradé mais le chemin principal sur mobile.
  - *`responsable` en texte libre* plutôt qu'une clé étrangère vers un compte admin : il n'existe pas de table de comptes AHF (l'authentification admin passe par Supabase Auth avec un rôle, sans profil). Créer cette table dépasse ce chantier ; le champ est contraint à la liste de `crm.ts` côté écran, pas côté base. À reprendre si un jour un conseiller doit avoir sa propre session.

## Conséquences

- **ADR-031 hérite d'un contrat** : la soumission du configurateur v2 écrit `config_v2` + `cfg_*` + `slot`, et n'a plus à inventer de format. Elle applique désormais une règle explicite pour l'état du numéro (§ Amendement, point 2) au lieu de l'inventer — et **hérite aussi de deux objets de base à corriger** : `leads_slot_unique` et `leads_slot_check` (point 3).
- **ADR-034 (espace client) hérite d'une GED prête** : `origine = 'client'` existe avant l'écran qui l'alimentera.
- **ADR-028 n'est pas entamée.** Aucune surface mandataire n'est re-linkée ni ré-exposée ; `responsable` est un champ neuf, sans lien avec `mandataire_id`. Les widgets et sections mandataire restent sous `FEATURES.mandataire`.
- **ADR-027 est amendée, pas remplacée** : l'organisation de la fiche (terrain et PLU à droite, GED Client à gauche) est celle d'ADR-027 ; ce chantier y ajoute trois blocs et retire une colonne de la liste.
- **ADR-033 (back-office des grilles) est confortée** : le CRM lit ses libellés par `loadConfig()`. Quand ADR-033 branchera cette fonction sur `config_variables`, le CRM suivra sans modification.
- **Dette assumée** : `config_json` / `options_labels` (v1) restent en base et à l'écran pour les leads anciens. La fiche affiche le bloc v2 quand `cfg_version` est renseigné, le bloc v1 sinon. Pas de migration de données rétroactive — les grilles v1 et v2 ne sont pas commensurables (`perM2` a disparu), toute conversion serait une invention.

## Sources

`03_DECISIONS/ADR-027-refonte-fiche-lead-affectation-geo.md` · `ADR-028-suspension-domaine-mandataire.md` · `ADR-030-configurateur-v2.md` · `docs/specs/SPEC_CONFIGURATEUR_HOWNER_v1.md` §5, §6, §12, §15, §17.4 · `src/lib/configurateur/config.ts` · `src/lib/features.ts` · `supabase/migrations/20260622_leads.sql`, `20260629_admin_tables.sql`, `20260630_dossiers_affectation.sql`, `20260701_leads_statut_commercial.sql`, `20260703_leads_slot_unique.sql`, `20260710_lead_client_documents.sql` · arbitrages de Richard du 2026-08-04 (conseiller AHF, double définition du retard, journal manuel avec pré-remplissage).
