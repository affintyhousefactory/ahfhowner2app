# ADR-029 — Repositionnement produit & marque (cadre de vente, vocabulaire, prix)

- **Statut** : **Accepté — mise en ligne conditionnée au §17 de la spec**
- **Date** : 2026-07-31
- **Phase** : All
- **Faisabilité** : 🟠 Moyenne — la décision est simple, son application touche 105 occurrences de contenu et croise le risque juridique ouvert (ADR-015)
- **Alerte Albert** : **Non — Albert est l'auteur de la décision.** La règle « remonter à Albert tout changement de positionnement » (CLAUDE.md) ne s'applique pas quand il en est l'émetteur. Trois points d'arbitrage lui reviennent néanmoins (§ Points ouverts).

## Contexte

Albert a produit une spécification de développement complète du configurateur — `docs/specs/SPEC_CONFIGURATEUR_HOWNER_v1.md` (v1, 30 juillet 2026, 17 sections), copie versionnée de la source Drive.

Le document ne se limite pas au configurateur : ses §1, §2 et §5 **redéfinissent le produit vendu, à qui il est vendu, et avec quels mots**. Le site actuel vend une maison compacte à poser sur votre terrain. La spec vend une annexe à implanter sur une parcelle déjà bâtie, ou un hébergement à un exploitant professionnel. Ce n'est pas une nuance de formulation : c'est un autre marché.

Tant que ce cadre n'est pas acté, tout écran construit sur l'ancien vocabulaire sera à refaire. Cet ADR est donc la précondition des ADR-030 à 034.

Écart mesuré avec l'existant :

| Sujet | Site actuel | Spec |
|---|---|---|
| Cadre de vente | maison sur votre terrain | **annexe sur parcelle bâtie** ou **hébergement professionnel** |
| Terrain nu | cœur de la promesse | **fermé** — « prochainement », sans prix ni explication |
| Vocabulaire | 105 occurrences de « maison » | terme **interdit** |
| Arko One / Max | 59 900 / 89 900 € | **77 900 / 99 900 €** |
| Réservation | 5 000 € (`DEPOSIT_EUR`) | **2 000 €** + acompte 30 % — ✅ `DEPOSIT_EUR` aligné le 2026-08-02 |
| Série | `SERIE_TOTAL = 12` | ~~Série 01 = 6 unités~~ → **maintenu à 12** (amendement du 2026-08-02) |

## Décision

### 1. Cadre de vente — deux usages ouverts, un fermé

- **Annexe d'une habitation existante**, sur la même parcelle (studio, chambre, bureau, logement d'un proche, meublé de tourisme).
- **Hébergement d'exploitation vendu à un professionnel** (hôtellerie de plein air, campings, PRL, résidences de tourisme, villages vacances, établissements thermaux).
- **Logement indépendant sur terrain nu : fermé.** Une seule formulation à l'écran — *prochainement*. Aucune explication, aucun terme juridique, aucun motif. Recueil du contact, information prioritaire à l'ouverture.

La spec est catégorique et le formule comme une contrainte de développement : « le parcours ne doit en aucun cas permettre d'aller au bout avec ce cas de figure ». C'est un critère de recette (§16, point 1), pas une préférence éditoriale.

### 2. Vocabulaire — cette blocklist remplace celle d'ADR-004

> ⚠ **Ce paragraphe est amendé deux fois** — voir « Amendement du 2026-08-03 »
> puis, surtout, « **Amendement du 2026-08-19** » plus bas, qui fait autorité.
> Le 03/08 « maison » était devenu le terme imposé ; le 19/08 il **redevient
> interdit** et cède la place à **« studio de jardin »**. Les deux mouvements
> sont datés plutôt qu'effacés — l'historique explique le code qu'on lit.

**Interdits** : ~~maison, votre maison~~, maison individuelle, résidence principale, clé en main, toute raison sociale autre que Howner, tout nom de fournisseur ou de sous-traitant.

**Imposés** : maison (depuis le 2026-08-03, ~~module~~), unité, studio, hébergement, annexe, espace supplémentaire, prêt à vivre.

**Repris d'ADR-004, non contredits par la spec, donc maintenus** : « notre architecte intégrée » (sans prénom, sans marqueur de genre additionnel) ; « Puigbo » (sans accent) ; et la blocklist historique — modulaire, préfabriqué, tiny house, conteneur, catalogue.

> **Les deux blocklists sont cumulatives.** « module » (nom) est imposé par la spec ; « modulaire » (adjectif, méthode de construction) reste interdit par ADR-004. Ce n'est pas une contradiction : le premier désigne l'objet vendu, le second une catégorie de construction dont la marque se démarque. Lecture à confirmer (§ Points ouverts).

### 3. Prix et volumes

Arko One **77 900 € TTC**, Arko Max **99 900 € TTC** (TVA 20 %, construction neuve). Réservation **2 000 €**, intégralement remboursable, imputée sur le prix. Acompte de confirmation **30 %**.

> **~~Amendement du 2026-08-02 — Série 01 reste à 12 unités.~~** ~~La spec fixait 6 ; arbitrage de Richard : le volume public ne change pas.~~ **Annulé le 2026-08-04** (voir ci-dessous).

> **Amendement du 2026-08-04 — Série 01 revient à 6 unités.** **Arbitrage de Richard**, qui annule celui du 2026-08-02 et **remet le §5 de la spec en vigueur**. `SERIE_TOTAL = 6` (`site.ts`) et `serie.unites = 6` (`configurateur/config.ts`) sont alignés ; le sélecteur de numéros du configurateur v2 en propose six. **Portée : tout le site**, pas le seul configurateur — en-tête (« 2 séries · 6 exemplaires »), Hero, jauge de réservation, fiche technique et `description` SEO d'`/arko-one` dérivent désormais tous de `SERIE_TOTAL`, les trois derniers littéraux codés en dur ayant été interpolés dans le même geste. La Série 02 sans limite reste prévue.
>
> Conséquence non traitée ici : la contrainte `leads_slot_check` (1→12) et l'index `leads_slot_unique` restent en l'état — voir ADR-035 § Amendement du 2026-08-04, point 3.

Le §17.1 est explicite : « le site public porte encore d'autres montants que ceux du §5. Un seul jeu de prix doit exister. »

### 4. Une seule identité

> ⚠ **Première phrase amendée** — voir « Amendement du 2026-08-17 » plus bas.
> Le bloc d'identification du pied de page nomme l'éditeur (« Howner by
> Affinity House Factory »), par exception bornée à ce bloc. **L'interdiction
> de nommer un fournisseur, un sous-traitant ou un partenaire est inchangée.**

Howner est la seule entité citée côté client. Aucun nom de fournisseur, de sous-traitant ou de partenaire n'apparaît, y compris dans les descriptifs techniques.

### 5. Périmètre d'application

Tout le site **sauf les pages légales** — CGV, mentions légales, politique de confidentialité. Elles sont listées au §17.10 comme à fournir par Howner, et les CGV portent le risque 🔴 ouvert d'ADR-015 (texte non validé par l'avocat, déjà opposable en production). Une incohérence de vocabulaire subsistera donc temporairement entre le site et ses pages légales : elle est assumée et lève dès que §17.10 est fourni.

## Amendement du 2026-08-02 — un contrôle vert ne prouvait pas la conformité

**Constat.** « À partir de 99 900 € — clé en main, prête à vivre. » était servi
sur `/arko-one` et `/arko-max`. « clé en main » est proscrit au §2 ci-dessus.
Pendant ce temps, `npm run check:vocabulaire` annonçait « conforme ».

**Cause.** Le contrôle lisait le **source, ligne à ligne**. Le terme était coupé
en deux par un retour à la ligne JSX :

```
À partir de {…} € — clé
en main, prête à vivre.
```

Aucune ligne ne contenait « clé en main ». Le rendu, lui, l'affichait.

**Correctif.** `scripts/check-vocabulaire.mjs` analyse désormais le texte **tel
que le visiteur le lit** — blancs aplatis avant recherche — tout en rapportant la
ligne d'origine. Vérifié sur un fichier témoin ; aucun faux positif sur le code
existant. Passage de toute la blocklist au crible avec cette lecture : **c'était
la seule occurrence du dépôt**.

Le texte est corrigé en « livré prêt à vivre » (vocabulaire imposé). L'accord
féminin de « prête » était par ailleurs un reste de « maison ».

**Règle actée.** Le vocabulaire de marque s'apprécie sur le **texte rendu**, pas
sur le code. Tout nouveau contrôle éditorial doit lire ce que le visiteur lit.

> C'est la deuxième fois qu'un garde-fou de ce projet rapporte un succès sur une
> surface non conforme — après « un code HTTP 404 ne prouve pas un masquage »
> (ADR-028, 2026-07-31). Même leçon sous deux formes : **un contrôle qui n'observe
> pas la sortie réelle ne contrôle rien.**

## Amendement du 2026-08-03 — « maison » devient le terme imposé

**Décision de Richard**, prise en connaissance de l'alerte ci-dessous et
maintenue après celle-ci. Elle **inverse le §2** sur son point principal.

**Ce qui change.**

- **« maison » sort de la liste des interdits et remplace « module »** partout
  côté client : menu principal, titres, métadonnées, JSON-LD, FAQ, configurateur
  v2. 70 occurrences réécrites, avec passage du masculin au féminin (« un module
  livré prêt à vivre » → « une maison livrée prête à vivre »).
- **`maisons?` est retiré de `PROSCRITS`** dans `scripts/check-vocabulaire.mjs`.
- **« maison individuelle » est ajouté à sa place** — voir le risque ci-dessous.
  « clé en main », « résidence principale » et la blocklist historique
  (modulaire, préfabriqué, tiny house, conteneur, catalogue) sont **inchangés**.
- Le §2 ci-dessus et le critère de recette **§16 de la spec** deviennent caducs
  sur ce seul point. Le reste du §2 tient.

**Ce qui ne change pas.** Le **cadre de vente du §1** : annexe sur parcelle déjà
bâtie, ou hébergement professionnel. Le logement indépendant sur terrain nu
reste fermé. Le mot change, l'offre non.

**Alerte formulée avant exécution — non levée.**

| | |
|---|---|
| **Sujet** | « maison » réintroduit comme terme imposé |
| **Impact** | 70 occurrences ; désarmement de la règle n°1 du contrôle vocabulaire ; exposition CCMI |
| **Gravité** | Élevée |
| **Décision** | Prise par Richard le 2026-08-03 — bascule complète assumée |
| **Reco. émise** | Attendre le retour de l'avocat sur les CGV, ou passer par « Nos modèles » (conforme, sans effet juridique) |

Le risque tient en une phrase : vendre une **maison** à un particulier qui
fournit son terrain, c'est le champ du **contrat de construction de maison
individuelle** (loi n° 90-1129 du 19 décembre 1990) — contrat de forme imposée,
garantie de livraison à prix et délais convenus, assurances spécifiques. Le
déclencheur juridique est l'expression « maison individuelle » et le montage
contractuel, pas le mot « maison » isolé : d'où le maintien du premier dans la
blocklist. **Cette lecture est celle de Claude, pas celle d'un avocat.** Elle
doit être confirmée avec la validation des CGV (ADR-015, risque 🔴 ouvert), qui
porte sur les mêmes textes.

**À remonter à Albert** — changement de positionnement de marque, au sens du
protocole d'alerte de `CLAUDE.md`.

## Amendement du 2026-08-17 — l'éditeur est nommé dans le bloc d'identification

**Décision de Richard** : le pied de page porte désormais l'identification et
les coordonnées de la société — « **Howner by Affinity House Factory** · 28
Chemin de Sabalce OEV, 64100 Bayonne · Tél. : +33 (0)5 64 37 37 14 » — au titre
du référencement local.

**Ce que ça amende.** Le §2 interdit « toute raison sociale autre que Howner »
et le §4 (« Une seule identité ») veut Howner seule citée côté client. Le bloc
d'identification y déroge, **par exception nommée et bornée**.

**Pourquoi l'exception tient.** Ce n'est pas un relâchement de la règle de
marque, c'est la limite que l'ADR se connaissait déjà : le **point ouvert §3**
ci-dessous constate que « une seule identité » se heurte à l'obligation légale
de nommer l'entité réelle, et conclut que le point « ne peut pas être appliqué à
la lettre sans validation juridique ». Deux motifs s'ajoutent :

- **SEO** — un bloc NAP (*Name / Address / Phone*) n'a de valeur que s'il est
  cohérent avec l'entité déclarée partout ailleurs. Le JSON-LD `Organization`
  émettait déjà `legalName: "Affinity House Factory"` et l'adresse de Bayonne
  sur **toutes** les pages ; `llms.txt` annonçait déjà « Éditeur : Affinity
  House Factory ». Afficher Howner seule aurait créé une **incohérence entre le
  texte visible et les données structurées** — exactement ce que les moteurs
  sanctionnent.
- **Ordre de lecture** — « Howner **by** Affinity House Factory » place la
  marque en premier et l'éditeur en second, comme une mention d'édition. La
  hiérarchie de marque du §4 est préservée dans sa substance.

**Périmètre de l'exception.** Le bloc d'identification du pied de page, et lui
seul. Le discours commercial ne change pas : **aucune autre surface client ne
nomme AHF**, et l'interdiction de nommer un **fournisseur, sous-traitant ou
partenaire** (§4) reste entière — c'est d'ailleurs elle qui a fait retirer le
nom du bureau d'études de la page « À propos » (ADR-037, même journée).

**Mise en œuvre.** Constante `COMPANY` dans `src/lib/site.ts`, **source
unique** : le pied de page l'affiche, `jsonld.ts` en dérive
`Organization.address` et `legalName`. L'adresse était écrite en dur dans
`jsonld.ts` — la rendre visible sans la centraliser aurait créé deux vérités.
Rendu en `<address>`, sur toutes les pages publiques (le pied de page est porté
par le layout `(public)`) : un NAP présent seulement sur l'accueil affaiblit le
signal. Casse en Titre et non en CAPITALES — `DESIGN.md` impose la sentence
case et les pages légales portent déjà cette graphie.

**Ce que ça ne règle pas.** Le point ouvert §3 reste ouvert sur les **pages
légales** : elles nomment AHF en toutes lettres avec SIRET et forme sociale, ce
qui relève de l'obligation légale et non de cette exception. Le contrôle
`check:vocabulaire` **ne teste pas** les raisons sociales (sa blocklist ne porte
que des termes produit) : cette exception n'est donc gardée par aucun script,
seulement par cet amendement.

**À remonter à Albert** — le §4 « Une seule identité » est de sa main ;
l'exception doit être confirmée, ou le bloc retiré. Une constante à changer.

## Amendement du 2026-08-19 — « studio de jardin » remplace « maison »

**Décision de Richard**, consigne de portée générale et non ponctuelle : le site
ne vend plus une maison. Il vend un **studio de jardin premium**, ou **studio de
jardin d'exception**. La consigne vaut pour toutes les demandes à venir, pas
seulement pour ce lot.

**Ce qui change.**

- **« maison » redevient interdit** et sort du vocabulaire imposé, où il était
  entré le 2026-08-03. `maisons?` retourne dans `PROSCRITS`.
- **Terme imposé : « studio de jardin »**, accord au **masculin**. Tous les
  accords féminins posés le 03/08 sont repassés au masculin — `BRAND.madeIn`
  redevient « Fabriqué au Pays-Basque », le pied de page « Conçu », les
  promesses « livré prêt à vivre ».
- **« construction », « maison à bâtir », « construction de maison
  individuelle » sortent du discours.** L'étape 01 du parcours ne dit plus
  « Construite entière » mais « Fabriqué entier » — le mot évoquait exactement
  le régime dont la marque se démarque.
- **Trois `<h1>` dictés par Richard** : accueil, Arko One, Arko Max.
- **Deux pages renommées** — `/arko-one` → `/studio-jardin-arko-one`,
  `/arko-max` → `/studio-jardin-arko-max`.

**Effet de bord favorable, à porter au dossier avocat.** Ce repositionnement
**éloigne** le site du régime **CCMI** (loi du 19 déc. 1990), risque 🔴 ouvert
depuis le 03/08 et joint au dossier des CGV (ADR-015). Un studio de jardin
n'est pas une maison individuelle. La question reste posée à l'avocat, mais
elle porte désormais sur beaucoup moins. **C'est le premier mouvement de ce
projet qui réduit une exposition juridique au lieu de l'augmenter.**

**Les anciennes URL sont indexées — d'où des redirections permanentes.**
`/arko-one` et `/arko-max` sont au sitemap depuis juin, avec canonical et
JSON-LD `Product`. Les renommer sans redirection jetterait le référencement
acquis et servirait un 404 à tout lien entrant. Deux règles `permanent: true`
(**308**, traité comme un 301) dans `next.config.ts`. **Elles ne s'enlèvent
pas** : une ancienne URL peut rester référencée des années.

**Le `<h1>` des pages produit n'est plus le nom du produit.** Il portait
« Arko One » en très grand ; il porte désormais la catégorie, que le nom ne dit
pas — personne ne cherche « arko one », on cherche « studio de jardin ». Le nom
reste l'élément visuel dominant mais passe en `<p>`, comme la baseline du pied
de page et les libellés du méga-menu : dominant à l'œil, décoratif dans le plan
des titres. Le plan reste à un seul `<h1>` par page.

**`BRAND.h1` est distinct de `BRAND.baseline`.** Le titre nomme la catégorie et
la marque pour le référencement ; la baseline reste la signature éditoriale
rendue en très grand au pied de page. Les deux ne se déduisent pas l'une de
l'autre — la ponctuation même diffère.

⚠ **Une faute d'accord dans un `<h1>` dicté, signalée et non corrigée.** Le
titre d'Arko Max — « Studio de jardin de 40 m² d'architecte, **livrés prêts** à
vivre. » — accorde au pluriel un sujet singulier. C'est un repli de l'ancien
« Deux maisons … livrées prêtes ». Repris **tel quel** : c'est de la copie de
marque, elle appartient à Richard. Correction d'une ligne si validée.

**Menu « Maisons » → « Nos Studios ».**

**Périmètre inchangé** : pages légales toujours exclues (§5), domaine mandataire
suspendu (ADR-028) et back-office hors contrôle. Leur vocabulaire reste
l'ancien — incohérence assumée, comme depuis le 31/07.

## Points ouverts — arbitrage Howner requis

Ces trois points sont apparus en croisant la spec avec le code existant. Aucun n'empêche de commencer ; les deux premiers doivent être tranchés avant la réécriture des textes, le troisième avant toute mise en ligne.

**1. La spec se contredit sur « clé en main ».** Le §1 écrit « le configurateur affiche un **prix indicatif clé en main** », alors que le §2, le §12 (`vocabulaire_interdit`) et le §16 (critère de recette) l'interdisent. Lecture retenue par défaut : le §2 prime, l'expression du §1 est un reste de rédaction. À confirmer — le critère de recette échouera sinon.

**2. « module » imposé vs « modulaire » interdit.** Lecture retenue : cumulatives, voir §2 de la décision. Si Howner considère que la spec lève la blocklist ADR-004, il faut le dire explicitement : la réécriture de 105 occurrences dépend de cette règle.

**3. « Une seule identité » vs réalité juridique.** Le §1 exige que Howner soit seule citée, « y compris mentions légales, coordonnées bancaires ». Or les mentions légales déclarent aujourd'hui **Affinity House Factory, SAS** comme éditeur — obligation légale de nommer l'entité réelle. Howner ne peut être seule citée que s'il s'agit d'un nom commercial déposé d'AHF, et la mention de l'entité juridique reste obligatoire. **Ce point ne peut pas être appliqué à la lettre sur les pages légales sans validation juridique.** Il rejoint §17.10.

## Faisabilité

- **Verdict** : 🟠 Moyenne. La décision elle-même est nette et sourcée. Son application est volumineuse (105 occurrences de « maison », 3 de « clé en main », 4 de « maison individuelle ») et touche des surfaces sensibles : JSON-LD, métadonnées OG, FAQ, pages produit.
- **Dépendances externes** : les 10 points du §17 bloquent la mise en ligne, pas le développement. Le §17.4 avertit que les prix d'options peuvent encore bouger (devis fournisseurs en cours) — d'où l'exigence de grilles pilotées par données, jamais codées en dur.
- **Risques** :
  - *SEO* — le JSON-LD `Product`, les métadonnées OG et le sitemap portent l'ancienne promesse et les anciens prix. Un oubli laisse Google afficher une offre qui n'existe plus.
  - *Juridique* — un prix public erroné de 18 000 € sur l'Arko One est une information commerciale inexacte. Le corriger est urgent indépendamment du reste du chantier.
  - *Cohérence temporaire* — pages légales non alignées (assumé, voir Périmètre).
  - *Régression de vocabulaire* — un nouveau texte réintroduisant un terme interdit. D'où le garde-fou automatisé ci-dessous.

## Conséquences

- **ADR-004 est remplacé par le présent ADR.** Sa blocklist est reprise et étendue ; ses règles « architecte intégrée » et « Puigbo » sont maintenues.
- **Amende ADR-021 / ADR-022** : le positionnement bi-produit reste valide, sa promesse change. Les noms « Arko One » et « Arko Max » sont conservés.
- **Précondition des ADR-030 → 034.** Le configurateur, les créneaux, le dossier terrain, le back-office et l'espace client s'écrivent dans ce cadre.
- **Garde-fou automatisé** : un script de vérification du vocabulaire (grep de la blocklist, hors pages légales) est à exécuter avant chaque PR. La spec en fait un critère de recette (§16), pas une bonne pratique optionnelle.
- **`CLAUDE.md` et `AGENTS.md`** : la section Marque est à réécrire intégralement.

## Sources

`docs/specs/SPEC_CONFIGURATEUR_HOWNER_v1.md` §1, §2, §5, §16, §17 — copie versionnée de la spécification d'Albert (source : Drive `AHF - Plans_SiteWeb_Inspirations`, déclaré dans `project-access.json`).
`src/lib/site.ts` (BRAND, PRODUCTS, FAQ), `src/app/(public)/mentions-legales/page.tsx`, ADR-004 (remplacé), ADR-015 (risque CGV), ADR-021, ADR-022.
