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

> ⚠ **Ce paragraphe est amendé** — voir « Amendement du 2026-08-03 » plus bas.
> « maison » n'est plus interdit : c'est désormais le terme **imposé**, et il
> remplace « module ». Seul « maison individuelle » reste proscrit. Le reste de
> la blocklist ci-dessous est inchangé.

**Interdits** : ~~maison, votre maison~~, maison individuelle, résidence principale, clé en main, toute raison sociale autre que Howner, tout nom de fournisseur ou de sous-traitant.

**Imposés** : maison (depuis le 2026-08-03, ~~module~~), unité, studio, hébergement, annexe, espace supplémentaire, prêt à vivre.

**Repris d'ADR-004, non contredits par la spec, donc maintenus** : « notre architecte intégrée » (sans prénom, sans marqueur de genre additionnel) ; « Puigbo » (sans accent) ; et la blocklist historique — modulaire, préfabriqué, tiny house, conteneur, catalogue.

> **Les deux blocklists sont cumulatives.** « module » (nom) est imposé par la spec ; « modulaire » (adjectif, méthode de construction) reste interdit par ADR-004. Ce n'est pas une contradiction : le premier désigne l'objet vendu, le second une catégorie de construction dont la marque se démarque. Lecture à confirmer (§ Points ouverts).

### 3. Prix et volumes

Arko One **77 900 € TTC**, Arko Max **99 900 € TTC** (TVA 20 %, construction neuve). Réservation **2 000 €**, intégralement remboursable, imputée sur le prix. Acompte de confirmation **30 %**.

> **Amendement du 2026-08-02 — Série 01 reste à 12 unités.** La spec fixait 6 ; **arbitrage de Richard : le volume public ne change pas**. `SERIE_TOTAL = 12` (`site.ts`) et `serie.unites = 12` (`configurateur/config.ts`) sont donc alignés, et le sélecteur de numéros du configurateur v2 en propose douze. La Série 02 sans limite reste prévue. Écart assumé par rapport au §5 de la spec, au même titre que les trois écarts d'ADR-030.

Le §17.1 est explicite : « le site public porte encore d'autres montants que ceux du §5. Un seul jeu de prix doit exister. »

### 4. Une seule identité

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
