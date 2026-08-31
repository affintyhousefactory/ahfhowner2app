# ADR-044 — Domaine « Agents immobiliers partenaires »

- **Statut** : Accepté
- **Date** : 2026-08-31
- **Phase** : 4 (backend / back-office)
- **Faisabilité** : ✅ Élevée (technique) · 🔴 Bloquant (juridique — sur le seul volet contrat/commission)
- **Alerte Albert** : **Oui — deux motifs.** (1) Le template 24, déjà rédigé et actif, **promet une commission d'apporteur d'affaires à des agents immobiliers** avant qu'aucun cadre juridique n'existe (loi Hoguet, carte professionnelle, information du client de l'agent). (2) **Quatre templates Brevo actifs violent ADR-029**, dont le 22 qui part en production depuis le 2026-08-31.

## Numérotation — pourquoi 044

**042** (Multi-Configuration détaillée + gestion de chantier / Costructor) et **043** (téléphonie Allo) sont **réservés** dans l'index de `PROJECT_STATE.md`, annoncés les 2026-08-29 et 2026-08-28. Les renuméroter pour insérer ce chantier casserait des renvois pour un gain nul. Priorité ≠ numéro.

⚠ **043 touche ce chantier de près** : la liste des agents porte des numéros cliquables que l'extension Chrome d'Allo lit pour remplir le Power Dialer. Les deux ADR devront rester cohérentes.

## Contexte

La liste Brevo **`Agents` (id 9)** a été chargée le 2026-08-31 à 15h40 : **167 contacts**, agences immobilières de Gironde et des Landes, extraites des annuaires FNAIM. Attributs renseignés : `AGENCE_OU_ENSEIGNE`, `ADRESSE`, `CODE_POSTAL`, `COMMUNE`, `DEPARTEMENT`, `LANDLINE_NUMBER`, `NAF_CIBLE` (`68.31Z`), `SOURCE_CONTACT`, `URL_SOURCE`, `STATUT_PROSPECTION` (« À contacter »).

Deux templates leur sont destinés, rédigés le 2026-08-31 : **23 `BREVO_TEMPLATE_AGENCES`** et **24 `BREVO_TEMPLATE_AGENCES_CAMPAGNE`**.

### Ce qui force la décision

**1. Un agent immobilier n'est pas un lead.** *(Arbitrage de Richard, 2026-08-31, énoncé deux fois.)* Il n'achète pas un Arko : il le prescrit à ses propres clients. Les statuts commerciaux d'ADR-035 — « Devis envoyé », « Paiement réservé », « Signé », et le numéro de série qui les accompagne — n'ont aucun sens pour lui. **Ce sont des partenaires commerciaux**, avec qui sera défini plus tard un **contrat d'apporteur d'affaires**.

**2. Le déséquilibre de volume détruirait le pilotage.** 167 agences contre une poignée de leads réels : versées dans `leads`, elles noieraient l'entonnoir, fausseraient `StatutsCommerciauxDonut`, la charge par conseiller et tout taux de conversion. Le CRM cesserait de dire quoi que ce soit sur la vente.

**3. `NAF 68.31Z` n'est dans aucune des cinq cibles.** Les `CIBLES_COMMERCIALES` de `src/lib/crm.ts` décrivent cinq populations d'**acheteurs**, chacune avec sa trame d'appel et son email sectoriel. Y ajouter une sixième entrée reviendrait à dire qu'on vend un studio à une agence — ce n'est pas ce qu'on lui vend, on lui propose une rémunération.

**4. Le cycle de vie est inverse.** Un lead a un terminus (signé ou perdu). Un partenaire dure, s'anime, et se mesure à ce qu'il **apporte**.

## Décision

### 1. Un domaine séparé, qui ne touche ni les leads ni les mandataires

Deux tables neuves — `agents_immo` et `agent_appels` — et **une seule colonne ajoutée à l'existant** : `leads.agent_id`.

⚠ **Ce domaine n'est pas une reprise du domaine mandataire suspendu (ADR-028).** La confusion est facile et coûteuse : `ContratCanvas.tsx` porte déjà littéralement la qualité « Apporteur d'affaires », `mandataires` porte `contrat_signe_at / contrat_url / contrat_data`, et `contrat-pdf.ts` sait générer un contrat. **Ces surfaces restent suspendues et ne sont ni relinkées, ni réactivées, ni importées.** Un mandataire est un **sous-traitant** qui cherche des terrains pour Howner — le pied de page du PDF dit « Contrat-cadre de sous-traitance ». Un agent immobilier partenaire est une **entreprise indépendante** qui recommande Howner à sa propre clientèle. Deux relations juridiques distinctes ; seul le *moteur de rendu* jsPDF pourra être réemployé le jour venu, jamais le corps du contrat.

Le domaine agents **naît actif**, sans feature flag : le garde-fou `FEATURES.mandataire` ne le concerne pas et ne doit pas être étendu à lui.

### 2. Les 167 contacts ne sont pas copiés en base

Brevo reste le **fichier de prospection** ; `agents_immo` ne porte que les agences **prises en suivi**. La jonction est l'**email**.

L'écran « vivier » (`/admin/agents/vivier`) lit la liste 9 à la volée et en retranche les emails déjà suivis. « Suivre ce contact » crée la fiche pré-remplie depuis les attributs Brevo.

⚠ **L'API Brevo v3 n'a pas de recherche de contacts** — le paramètre `search` est ignoré, constat déjà porté par `src/app/api/admin/leads/recherche/route.ts` (vérifié le 2026-08-27). Le vivier charge donc la page (`?listIds=9&limit=500`) et **filtre côté serveur**, avec un cache court. 167 tiennent dans une page ; au-delà de 500, il faudra boucler sur `offset`.

Copier les 167 aurait créé une seconde vérité : Brevo continuerait de recevoir des imports, la base divergerait, et personne ne saurait laquelle fait foi.

### 3. Deux gestes d'email, deux templates — ils ne sont pas interchangeables

*(Constat du 2026-08-31, en lisant les deux templates.)*

| | **23 `BREVO_TEMPLATE_AGENCES`** | **24 `BREVO_TEMPLATE_AGENCES_CAMPAGNE`** |
|---|---|---|
| Variables | `params.PRENOM`, `NOM`, `AGENCE`, `PLAQUETTE_URL`, `PLAQUETTE_LIBELLE` | `contact.AGENCE_OU_ENSEIGNE` |
| Mécanique | **transactionnel** (`POST /v3/smtp/email`) | **campagne** (attributs du contact) |
| Émetteur | **notre code**, depuis la fiche agent, après un appel | **Brevo**, sur la liste 9 |
| Variable d'env | `BREVO_TEMPLATE_AGENCES=23` | `BREVO_TEMPLATE_AGENCES_CAMPAGNE=24` |

Le 24 ne peut pas être envoyé unitairement par le CRM : sans `params`, il lirait des attributs de contact, et son contenu est écrit pour un envoi de masse. Le 23 ne peut pas servir de campagne : ses `params` ne sont pas alimentés par le moteur de campagne.

**La campagne de masse ne passe pas par notre code.** Elle se lance depuis Brevo. Le rôle du CRM est double et il est ailleurs : **tenir la liste 9 propre** (§6) et **relire les résultats** (§4).

⚠ **Aucun repli codé sur ces identifiants**, conformément à la règle posée pour `BREVO_TEMPLATE_MULTICFG` : une route dont la variable manque renvoie un 500 qui la nomme. Un identifiant deviné enverrait le mauvais email à un partenaire.

### 4. Le dernier email se lit chez Brevo, mais se trie en base

Vérifié le 2026-08-31 sur les envois réels :

- `GET /v3/smtp/emails?email=…` rend l'historique transactionnel (objet, date, `templateId`, `messageId`, `uuid`) ;
- `GET /v3/smtp/statistics/events?email=…` rend l'état (`requests`, `delivered`, `opened`, `clicked`, rejets) ;
- `GET /v3/contacts/{email}` rend `statistics` — **vide à ce jour**, aucune campagne n'ayant jamais été envoyée. Elle se remplira au premier envoi sur la liste 9.

**Sur la fiche**, l'onglet « Emails » lit ces routes en direct : c'est exact, daté, et rien n'est stocké.

**Dans la liste**, c'est impossible : trier 167 lignes sur « dernier email » exigerait 167 appels API. Les colonnes `dernier_email_at`, `dernier_email_sujet`, `dernier_email_etat` sont donc **dénormalisées**, alimentées par **un seul appel global** à `/smtp/statistics/events` rapproché par email — un cron quotidien, plus un bouton « Rafraîchir ».

C'est exactement la doctrine de `leads.dernier_appel_at` (ADR-035 §3) : la source reste la source, la copie sert au SQL, et elle se recalcule au lieu de s'incrémenter.

### 5. `leads.agent_id` — ce n'est pas un confort, c'est l'assiette de la commission

Un partenaire ne vaut que par ce qu'il apporte. La colonne relie le lead à l'agent qui l'a présenté, et alimente l'onglet « Leads apportés ».

`SOURCINGS` porte déjà la valeur **`partenaire` (« apporteur d'affaires »)**, qui ne pointait jusqu'ici sur rien. Elle trouve sa cible : quand `sourcing = partenaire`, l'écran de pré-qualification propose un sélecteur d'agent.

⚠ **Le jour où un contrat prévoira une commission, son calcul se lira ici.** Une colonne posée aujourd'hui est une colonne juste ; reconstituer après coup qui a apporté quoi serait impossible.

### 6. Le CRM écrit en retour dans Brevo — deux champs, pas davantage

*(Recommandation adoptée faute d'arbitrage contraire ; réversible en retirant l'appel.)*

- **`STATUT_PROSPECTION`** est recopié à chaque changement de statut (`PUT /v3/contacts/{email}`). Sans cela, le fichier qui sert à cibler les campagnes ignore tout du travail fait au téléphone.
- **« Ne pas recontacter » pose `emailBlacklisted: true`.** Sans cela, le CRM affiche « refus » pendant que la campagne suivante rattrape l'agent — et c'est aussi le traitement RGPD correct d'une opposition.

Rien d'autre ne remonte : les notes d'appel et le suivi interne n'ont pas à quitter la base.

### 7. Statuts de partenariat — un cycle, pas une prospection

```
À contacter → Contact pris → Intéressé → Partenaire (accord verbal) → Sous contrat
                                              ↘ Inactif      ↘ Ne pas recontacter
```
Plus le rebut `erreur_test_doublon`, hors Kanban, à l'identique d'ADR-035.

Ils vivent dans **`src/lib/agents.ts`**, jamais redéclarés dans un écran — même règle qu'ADR-035 §7. `À contacter` est le défaut, aligné sur la valeur que Brevo porte déjà.

⚠ **`Sous contrat` est posé comme statut, vide de machinerie.** Aucune colonne `taux_commission` ni `contrat_url` n'est créée par anticipation : une colonne posée un an trop tôt n'est remplie par personne et fait croire que la fonctionnalité existe. Elle viendra dans sa propre migration additive, dont le coût est nul.

### 8. Le journal d'appels est cloné, pas généralisé

`agent_appels` reprend la forme de `lead_appels` — sens, issue, note, durée, auteur, `occurred_at` antidatable, rappel planifié — et son trigger de recalcul de `dernier_appel_at` / `derniere_issue`.

Rendre `lead_appels.lead_id` nullable, poser un CHECK d'exclusivité et réécrire un trigger **qui tourne en production** pour accueillir une seconde population, c'est prendre un risque sur le journal existant. Le clone coûte une cinquantaine de lignes de SQL.

**La factorisation utile est ailleurs et elle est gratuite** : `SENS_APPEL`, `ISSUES_APPEL`, `etatSuivi()`, `urgence()`, `SLA_JOURS`, `CONSEILLERS` restent dans `src/lib/crm.ts` et servent les deux domaines ; `LeadAppels` devient `JournalAppels`, paramétré par son endpoint.

### 9. Écrans

| Route | Contenu |
|---|---|
| `/admin/agents` | Liste + Kanban (`?vue=kanban`). Agence, commune/département, **téléphones cliquables** (le Power Dialer de l'extension Chrome lit cette page), statut, responsable, dernier appel (écart), **dernier email** (écart + état), prochain rappel, leads apportés |
| `/admin/agents/vivier` | Les contacts Brevo pas encore suivis. Recherche locale, filtres département et `SOURCE_CONTACT`. « Suivre » crée la fiche pré-remplie |
| `/admin/agents/nouveau` | Création manuelle (agence rencontrée hors fichier). La saisie d'email déclenche la recherche anti-doublon, étendue à la liste 9 |
| `/admin/agents/[id]` | Fiche à onglets : **Suivi · Journal d'appels · Emails · Leads apportés** |
| `/admin` | Une carte « Agents immo » : à contacter, rappels dépassés, partenaires actifs. **Hors entonnoir leads** |

⚠ **Frontière serveur/client** — un composant partagé rendu depuis une page `/admin` ne porte aucun `onClick` (régression `TelephoneLien` du 2026-08-28), et un conteneur masqué n'initialise pas de carte.

### 10. Le contrôle de vocabulaire gagne un volet Brevo

*(Constat du 2026-08-31.)* Les 23 templates Brevo passés à la blocklist d'ADR-029 : **quatre templates actifs sont en infraction.**

| Template | Termes | État |
|---|---|---|
| **22 `INVESTISSEUR`** | **maison** | 🔴 **envoyé en production depuis le 2026-08-31** |
| **23 `AGENCES`** | **maison**, **résidence principale** | pas encore câblé |
| **24 `AGENCES_CAMPAGNE`** | **maison**, **résidence principale**, **catalogue** | pas encore envoyé |
| 14 `Invitation Mandataire` | catalogue | domaine suspendu (ADR-028) |

`npm run check:vocabulaire` **ne peut pas les voir** : il scanne `src/`, et ces textes vivent chez Brevo. C'est la huitième occurrence de « un contrôle qui n'observe pas la sortie réelle ne contrôle rien » — et cette fois le texte non contrôlé est celui qu'un client lit.

**Décision** : le script gagne un mode `--brevo` qui lit les templates par l'API et leur applique la même blocklist. Il n'entre **pas** dans la porte de PR (il exige `BREVO_API_KEY`, absente du poste de contrôle) : il se lance à la main avant toute campagne, et c'est cette obligation qui compte.

Les corrections de texte relèvent de Richard, dans le dashboard Brevo — les templates ne sont pas versionnés dans le dépôt et le code n'a pas à réécrire un message commercial.

## Faisabilité

- **Verdict** : ✅ Élevée sur tout le périmètre décrit. 🔴 Bloquant sur le seul volet contrat/commission, qui en est **exclu**.
- **Dépendances externes** :
  - **Brevo** — liste 9, templates 23 et 24, API contacts + SMTP. Clé déjà en place sur les trois scopes.
  - **`BREVO_TEMPLATE_AGENCES=23`** et **`BREVO_TEMPLATE_AGENCES_CAMPAGNE=24`** à poser sur Production, Preview et Development. **Sans elles, le volet email est livré inerte** — exactement le cas `BREVO_TEMPLATE_MULTICFG` du 2026-08-27.
  - **Avocat / Albert** pour le contrat d'apporteur (hors périmètre).
- **Risques** :
  - 🔴 **Juridique.** Le template 24 promet « vous touchez la commission » et « un contrat d'apporteur d'affaires formalisé ». Verser une commission à un **agent immobilier titulaire d'une carte professionnelle** engage la loi Hoguet, l'obligation d'information de son propre client et la question du conflit d'intérêt. **L'email s'envoie avant que le cadre existe** — c'est le vrai risque du chantier, et il est commercial autant que juridique : une promesse faite à 167 agences ne se reprend pas.
  - 🟠 **Vocabulaire** (§10).
  - 🟠 **RGPD.** 167 contacts issus d'annuaires FNAIM : prospection B2B sur intérêt légitime, qui exige une mention d'origine des données et une désinscription fonctionnelle. Le lien de désinscription **est vérifié** : le HTML réellement délivré le 2026-08-31 résout bien `Se désinscrire`. La base stockera des notes libres sur des personnes — mêmes obligations que pour les leads.
  - ⚪ **Quotas Brevo** : un appel global par jour pour le rafraîchissement, un appel par ouverture de fiche. Sans commune mesure avec les limites.

## Conséquences

- Le CRM porte désormais **deux populations aux cycles distincts** : des prospects qui achètent, des partenaires qui apportent. Elles ne se mélangent nulle part — ni en table, ni au Kanban, ni au dashboard.
- **`sourcing = partenaire` cesse d'être décoratif** : il désigne un agent nommé.
- Le chantier prépare le contrat d'apporteur **sans le construire**. Le chemin critique de ce volet est juridique ; le code s'y ajoutera par une migration additive.
- **ADR-028 n'est ni amendée ni contournée.** Aucune surface mandataire n'est relinkée.
- **ADR-029 gagne un point d'application** : les templates Brevo entrent dans le périmètre du garde-fou, par un contrôle qu'il faut lancer à la main.
- Le découpage retenu est de **quatre lots**, chacun vérifiable en Preview : socle · vivier et fiche · emails · lien avec les leads.

## Sources

- Liste Brevo `Agents` (id 9), 167 contacts, chargée le 2026-08-31 — API `/v3/contacts?listIds=9`.
- Templates Brevo **23** et **24**, lus le 2026-08-31 — API `/v3/smtp/templates`.
- Événements SMTP du 2026-08-31 (template 18 délivré, `unsubscribe` résolu) — API `/v3/smtp/statistics/events`, `/v3/smtp/emails/{uuid}`.
- ADR-035 — CRM interne : statuts, journal d'appels, doctrine de dénormalisation, aperçu obligatoire avant envoi.
- ADR-026 — emails Brevo, rôles des listes, absence de repli sur les identifiants de template.
- ADR-028 — suspension du domaine « Mandataire & Terrain » (garde-fou).
- ADR-029 — vocabulaire de marque ; `scripts/check-vocabulaire.mjs`.
- `src/lib/crm.ts` (`SOURCINGS`, `CIBLES_COMMERCIALES`, `etatSuivi`, `ISSUES_APPEL`), `src/app/api/admin/leads/recherche/route.ts` (absence de recherche Brevo), `supabase/migrations/20260804_crm_leads.sql` (forme du journal et de son trigger).
