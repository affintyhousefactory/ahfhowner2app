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

## Faisabilité

- **Verdict** : ✅ Élevée. Aucune API externe, aucune clé, aucun service nouveau. Une migration additive.
- **Dépendances externes** : aucune. Google Places et `/api/admin/plu` sont déjà en place et inchangés.
- **Migration** : `supabase/migrations/20260804_crm_leads.sql` — **purement additive** (`add column if not exists`, `create table if not exists`, un trigger). Aucune colonne supprimée, aucune contrainte durcie sur l'existant, aucun risque de perte. À appliquer sur Preview puis sur Prod à la validation de la PR `dev` → `main`.
- **Risques** :
  - *Le trigger `dernier_appel_at` n'est pas testable en local* (contrainte de méthode active : ni dev server, ni build local). Il est écrit pour être idempotent et recalculer depuis la source à chaque écriture, plutôt que d'incrémenter un état — une erreur de trigger ne peut pas produire une valeur durablement fausse, seulement une valeur en retard d'une écriture. Vérification sur Preview.
  - *Glisser-déposer natif* — pas de support tactile en HTML5 DnD. D'où le sélecteur de statut conservé sur chaque carte, qui n'est pas un repli dégradé mais le chemin principal sur mobile.
  - *`responsable` en texte libre* plutôt qu'une clé étrangère vers un compte admin : il n'existe pas de table de comptes AHF (l'authentification admin passe par Supabase Auth avec un rôle, sans profil). Créer cette table dépasse ce chantier ; le champ est contraint à la liste de `crm.ts` côté écran, pas côté base. À reprendre si un jour un conseiller doit avoir sa propre session.

## Conséquences

- **ADR-031 hérite d'un contrat** : la soumission du configurateur v2 écrit `config_v2` + `cfg_*` + `slot`, et n'a plus à inventer de format. Elle reste seule maîtresse de l'état `demandé/confirmé` du numéro.
- **ADR-034 (espace client) hérite d'une GED prête** : `origine = 'client'` existe avant l'écran qui l'alimentera.
- **ADR-028 n'est pas entamée.** Aucune surface mandataire n'est re-linkée ni ré-exposée ; `responsable` est un champ neuf, sans lien avec `mandataire_id`. Les widgets et sections mandataire restent sous `FEATURES.mandataire`.
- **ADR-027 est amendée, pas remplacée** : l'organisation de la fiche (terrain et PLU à droite, GED Client à gauche) est celle d'ADR-027 ; ce chantier y ajoute trois blocs et retire une colonne de la liste.
- **ADR-033 (back-office des grilles) est confortée** : le CRM lit ses libellés par `loadConfig()`. Quand ADR-033 branchera cette fonction sur `config_variables`, le CRM suivra sans modification.
- **Dette assumée** : `config_json` / `options_labels` (v1) restent en base et à l'écran pour les leads anciens. La fiche affiche le bloc v2 quand `cfg_version` est renseigné, le bloc v1 sinon. Pas de migration de données rétroactive — les grilles v1 et v2 ne sont pas commensurables (`perM2` a disparu), toute conversion serait une invention.

## Sources

`03_DECISIONS/ADR-027-refonte-fiche-lead-affectation-geo.md` · `ADR-028-suspension-domaine-mandataire.md` · `ADR-030-configurateur-v2.md` · `docs/specs/SPEC_CONFIGURATEUR_HOWNER_v1.md` §5, §6, §12, §15, §17.4 · `src/lib/configurateur/config.ts` · `src/lib/features.ts` · `supabase/migrations/20260622_leads.sql`, `20260629_admin_tables.sql`, `20260630_dossiers_affectation.sql`, `20260701_leads_statut_commercial.sql`, `20260703_leads_slot_unique.sql`, `20260710_lead_client_documents.sql` · arbitrages de Richard du 2026-08-04 (conseiller AHF, double définition du retard, journal manuel avec pré-remplissage).
