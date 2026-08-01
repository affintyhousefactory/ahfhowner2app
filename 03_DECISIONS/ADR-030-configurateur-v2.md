# ADR-030 — Configurateur v2 : parcours en 7 écrans, grilles pilotées par données

- **Statut** : **Accepté — en cours de développement**
- **Date** : 2026-08-01
- **Phase** : All
- **Faisabilité** : 🟠 Moyenne — le parcours et les grilles sont entièrement spécifiés ; les montants d'options restent provisoires (§17.4) et deux points d'arbitrage conditionnent la mise en ligne
- **Alerte Albert** : **Oui — trois écarts assumés par rapport à sa spécification** (§8 pré-analyse PLU, §6-§7 paiement en ligne, §5 tarif de transport). Ce ne sont pas des impossibilités techniques mais des arbitrages produit de Richard, à porter à sa connaissance. Deux points ouverts lui reviennent par ailleurs (§ Points ouverts).

## Contexte

Le configurateur actuel est un écran unique : sélection de modèle, bardage, cuisine, barre, chambre, intérieur, terrasse au m², puis un encadré de total. Sa logique de calcul est verrouillée depuis le début du projet (ADR-005, amendée ADR-020).

La spécification d'Albert (`docs/specs/SPEC_CONFIGURATEUR_HOWNER_v1.md`) décrit un tout autre objet : **un tunnel en 7 écrans**, avec un filtre d'usage en entrée, des ambiances pré-composées, une terrasse par paliers, des options dont certaines verrouillent la structure, un transport par zone, et un récapitulatif qui débouche sur une réservation payante.

Ce n'est pas une évolution du configurateur : c'est son remplacement. Le modèle de calcul lui-même change — `perM2` et `terrassePerM2` disparaissent au profit de grilles à paliers.

## Décision

### 1. Parcours — 7 écrans (§3)

| # | Écran | Contenu |
|---|---|---|
| 0 | Votre projet | Filtre d'usage, 3 boutons |
| 1 | Modèle | Arko One 20 m² · Arko Max 40 m² (+ quantité en parcours pro) |
| 2 | Ambiance | 2 à 3 versions pré-composées, incluses |
| 3 | Terrasse | 4 paliers, grille par modèle |
| 4 | Options | 6 options tarifées, dont 3 structurelles |
| 5 | Dossier terrain | Qualification d'accès, uploads, rendez-vous → **ADR-032** |
| 6 | Récapitulatif | Prix, inclus, à votre charge, **choix du numéro**, coordonnées → **ADR-031** |

**L'écran 1 porte aussi la pré-analyse du terrain** (champ d'adresse + zonage PLU). Une seule saisie sert deux réponses : la constructibilité indicative et les coordonnées, qui donnent la distance de transport. Elle précède donc le total. Voir § Écarts assumés, point 1.

Compteur de prix visible en permanence à partir de l'écran 1, avec sa mention fixe. Retour arrière libre, sans perte de choix.

**Écran 0 est un filtre, pas une question de confort.** Le choix « un logement indépendant sur un terrain nu » mène à une page « prochainement » avec formulaire d'inscription, **sans aucun prix affiché**, et termine le parcours. La spec le formule comme une contrainte de développement : « le parcours ne doit en aucun cas permettre d'aller au bout avec ce cas de figure ». C'est le critère de recette n°1 (§16).

### 2. Grilles pilotées par données, jamais en dur

Le §12 fournit le JSON complet (usages, cycles, modèles, ambiances, terrasse, options, transport, rentabilité) et la spec avertit : « Toutes ces valeurs sont éditables sans redéploiement : prix, paliers, options, nombre d'unités de la série. **Elles bougeront.** » Le §17.4 confirme que les prix d'options sont provisoires — des devis fournisseurs sont en cours.

Conséquence : **une table de configuration en base**, chargée une fois côté client, et non des constantes TypeScript. Les tables `config_variables` et `options_produits` existent déjà (migration `20260622_config_tarifs.sql`) et servent de point de départ plutôt qu'un nouveau schéma.

Corollaire de performance (§14) : le configurateur **ne doit pas dépendre d'un appel réseau pour recalculer un prix**. Les grilles sont chargées une fois, le calcul est local.

### 3. Modèle de calcul

`total TTC = prix_base + terrasse + options + transport`. Aucune remise, aucun code promotionnel en v1.

- **Terrasse** : 4 paliers par modèle. **Ne jamais afficher de prix au m²** — c'est explicite au §5.
- **Options** : filtrage par le champ `modeles` de chaque option, **jamais en dur**. Le poêle n'existe que sur l'Arko Max ; la climatisation existe sur les deux à des prix différents. Une option incompatible n'est **pas affichée** — jamais grisée avec un message d'erreur (§15).
- **Options structurelles** (casquette, poêle, kit solaire) : elles entrent dans l'étude d'exécution de l'ossature. Choisies avant la réservation, **non ajoutables ensuite**. Mention obligatoire à l'écran.
- **Transport** : calculé **au kilomètre depuis l'atelier de Bayonne** — `grutage + distance routière × (poids du modèle × tarif €/t/km)`, soit le modèle déjà en production (`TRANSPORT` dans `site.ts`). Voir § Écarts assumés, point 3. C'est le **seul calcul automatique du configurateur**.

### 4. Parcours professionnel

Mêmes écrans, plus un champ *nombre d'unités* à l'écran 1. **À partir de 3 unités**, le prix unitaire reste affiché mais le récapitulatif bascule sur *devis dédié* : bouton de prise de rendez-vous à la place du bouton de réservation.

Bloc rentabilité (§9) : le visiteur pose ses hypothèses — deux curseurs (prix par nuit, taux d'occupation) et une ligne de charges d'exploitation modifiable, initialisée à 30 %. Sorties : revenu brut, revenu net, durée d'amortissement. **Vocabulaire proscrit** : rendement garanti, revenu assuré, investissement sûr, placement, rentabilité assurée. Mention obligatoire visible sans interaction sous le résultat.

### 5. Mentions — textes exacts, hiérarchie imposée

Le §10 fournit les textes au mot. Règle d'affichage non négociable : **une bulle ne suffit jamais pour une mention essentielle** — la mention courte est visible sans interaction, la bulle donne le détail. Les bulles doivent être accessibles **au clavier et au toucher**, pas seulement au survol.

### 6. Contraintes d'interface (§14)

**Mobile d'abord, cible 390 px.** L'essentiel des visites se fera au téléphone. Affichage du contenu principal sous 2,5 s en 4G. Images en format moderne compressé, plusieurs résolutions, chargement différé, **préchargement de l'ambiance suivante** pour que le changement soit instantané — « le poids des visuels est le premier facteur de perte de visiteurs sur ce type de parcours ».

Accessibilité : navigation clavier complète, contrastes suffisants, textes alternatifs, formulaires étiquetés, mentions atteignables sans souris.

**Visuels** : les images et l'ambiance visuelle actuelles sont conservées (décision Richard, 2026-08-01) ; de nouvelles arriveront. La nomenclature cible est `{modele}_{vue}_{ambiance}.webp` (§12) — à adopter au fil des remplacements, sans casser l'existant.

La proposition d'interface détaillée (composants, comportements tactiles, gabarits mobile et desktop) fait l'objet d'un document séparé : `docs/design/configurateur-v2.md`.

## Écarts assumés par rapport à la spec

Arbitrages de Richard, 2026-08-01. Ils sont assumés et documentés ici pour
qu'Albert voie ce qui diverge de son document, et pourquoi.

### 1. La pré-analyse du terrain est conservée — écart au §8

Le champ « Votre situation terrain » et l'analyse PLU par adresse restent dans le
parcours client, à l'écran 1, dans leur forme actuelle (`ParcelleAnalyse`).

La spec écrit : « Aucune analyse automatique. **Aucun appel à un service de
cadastre, de plan local d'urbanisme ou de géoportail.** […] C'est une consigne,
pas une limite technique. » L'outil existe, fonctionne, et rend deux services
d'un seul appel : le zonage indicatif et les coordonnées qui donnent la distance
de transport. Le supprimer obligerait à redemander l'adresse pour le seul calcul
de transport.

**Conséquence** : ADR-032 ne supprime plus `ParcelleAnalyse` du parcours client.
Les mentions du §10 s'appliquent — la pré-analyse est indicative, l'étude
d'urbanisme reste faite « à la main, après réservation ».

### 2. Aucun paiement en ligne — écart aux §6 et §7

Le lien de paiement est envoyé **après l'appel de qualification**. L'écran 6
recueille les coordonnées et enregistre une demande de numéro ; il ne débite
rien. Cohérent avec ADR-008 (Stripe retiré du MVP, paiement hors-ligne).

La spec fait du webhook de paiement la source de vérité et l'ancre de
l'horodatage (« jamais sur le clic, jamais côté client »). Sans lui, tout le
mécanisme du §6 perd son point d'appui.

**Mode retenu : « demandé puis confirmé ».** Le numéro n'est pas bloqué à la
soumission du formulaire ; il le devient à la confirmation du conseiller. Deux
visiteurs peuvent donc demander le même numéro — l'arbitrage est humain.

**Ce que cela expose, et qu'ADR-031 doit traiter** : le compteur public peut
afficher « 3 numéros restants » alors que les trois sont déjà demandés. Il reste
une projection de la base, donc conforme à la lettre du §6, mais il ne reflète
plus la réalité commerciale. Deux garde-fous : la mention « attribué à la
signature du devis », visible sous la grille, et l'état `demande` exposé
**côté back-office**, où il sert à arbitrer. À six unités le risque reste
théorique ; il faudra rouvrir la question si le volume de demandes augmente.

### 3. Transport au kilomètre — écart au §5

Le modèle en production est conservé : `grutage 1 440 € + distance routière ×
(poids du modèle × 0,24 €/t/km)`, soit 2,16 €/km pour l'Arko Max et 1,44 €/km
pour l'Arko One. La distance vient de la pré-analyse (Haversine × `roadFactor`
1,3 depuis les coordonnées de l'atelier).

Le §5 donne une grille par zone (0 / 1 500 / 2 900 € / sur étude). Le calcul au
kilomètre est plus juste et **varie avec le modèle**, ce que la grille par zone
ignore — un Arko Max de 9 t et un Arko One de 6 t ne coûtent pas le même convoi
sur la même distance.

**Conséquence d'interface** : changer de modèle après avoir saisi l'adresse
recalcule le transport. Le total doit en tenir compte.

### 4. Écran 6 — réservation sans paiement

- CTA : **« Réserver ce numéro »**, qui devient « Réserver le n° 04 » une fois le
  numéro choisi.
- **Sélecteur de numéro** : les 6 numéros de la Série 01, les confirmés barrés et
  non cliquables, les autres sélectionnables. C'est le seul FOMO autorisé par le
  §6 — rareté réelle et vérifiable, jamais de compte à rebours ni de « N
  personnes regardent cette page ».
- Un numéro **déjà demandé reste libre et sélectionnable** ; l'information
  n'apparaît qu'**après** sélection, en une ligne sous la grille. Un troisième
  état sur la grille n'est pas actionnable, crée de l'hésitation au pire endroit
  du tunnel, et brouille le compteur.
- **Texte du devis** (fourni, à reprendre au mot) : « Après votre échange avec
  notre conseiller, vous recevrez un devis détaillé mentionnant un échéancier et
  une demande de paiement de réservation validant votre exclusivité. » puis
  « 2 000 € · Acompte de réservation Arko — remboursable, sans engagement de
  construction », puis « Conditions précisées dans les CGV » avec lien.
- **Formulaire** : prénom, nom, téléphone, email — tous obligatoires. Téléphone
  avec sélecteur d'indicatif drapeau/pays (`react-phone-number-input`,
  `defaultCountry="FR"`, déjà en place dans `Reservation.tsx`).
- **Deux cases, aucune pré-cochée** (§7) : opt-in email **facultatif** (texte
  repris de `ContactForm.tsx`), acceptation **obligatoire** des CGV et de la
  politique de confidentialité. Le CTA reste inactif tant que la seconde n'est
  pas cochée, avec le motif affiché sous le bouton.
- « À votre charge » : « …étude de sol si exigée, **aménagement des accès camion
  et grue si nécessaire**, mobilier et décoration. »

## Points ouverts — arbitrage Howner

1. **Nombre d'ambiances au lancement** (§17.3) : deux ou trois, selon la disponibilité des visuels. Le tableau `ambiances` doit être bouclé, **jamais codé en dur** — la v1 doit fonctionner avec 2 comme avec 3.
2. **Bloc rentabilité dans le parcours particulier** (§17.5) : ouvert ou réservé au professionnel. Le JSON porte `"bloc_rentabilite": "en_attente_arbitrage"` pour l'usage `annexe`. Implémenté comme un drapeau par usage, la bascule est gratuite.

Ni l'un ni l'autre n'empêche de développer.

## Faisabilité

- **Verdict** : 🟠 Moyenne. Le parcours et les grilles sont entièrement spécifiés, sans dépendance externe — le transport est un calcul de distance, pas un appel de service. Le risque est de volume et de rigueur, pas d'inconnue technique.
- **Dépendances externes** : aucune pour cet ADR. Les écrans 5 et 6 dépendent d'ADR-032 et ADR-031.
- **Risques** :
  - *Régression de conversion* — passer d'un écran unique à sept multiplie les points d'abandon. D'où la sauvegarde de configuration et l'email de reprise (§15, ADR-033), et un compteur de prix toujours visible.
  - *Grilles figées par erreur* — si les valeurs finissent en constantes TypeScript, chaque ajustement tarifaire redevient un déploiement. La spec l'interdit explicitement.
  - *Poids des visuels* — premier facteur d'abandon selon la spec, et le budget performance est serré (2,5 s en 4G).
  - *Mentions traitées comme du décor* — les afficher uniquement en bulle est une non-conformité, pas un choix esthétique.

## Conséquences

- **Remplace ADR-005 et ADR-020.** Le guardrail « ne pas toucher `Configurator.tsx` / `config-store.tsx` » **est levé** : ces fichiers sont réécrits. `CLAUDE.md` et `AGENTS.md` doivent en prendre acte, sinon toute PR future sera bloquée par un garde-fou devenu caduc.
- `perM2` et `terrassePerM2` disparaissent du modèle. Les champs `TODO ARKO ONE` qui les concernaient deviennent sans objet.
- Le mode « Je cherche un terrain » suspendu par ADR-028 ne revient pas : le nouveau parcours ne le prévoit pas.
- **`ParcelleAnalyse` reste dans le parcours client** (écart 1) — ADR-032 ne la retire plus, contrairement à ce qu'annonçait la première rédaction de cet ADR.
- La réservation et les numéros relèvent d'ADR-031 : l'écran 6 affiche le récapitulatif, le sélecteur de numéro et le formulaire ; le verrou et l'état `demande` sont ailleurs.
- **ADR-008 est confirmée, pas rouverte** : le paiement reste hors-ligne. Le webhook, l'idempotence et l'horodatage serveur du §7 deviennent sans objet en v1 — ADR-031 devra le dire explicitement plutôt que de les reprendre de la spec.

## Sources

`docs/specs/SPEC_CONFIGURATEUR_HOWNER_v1.md` §3, §5, §9, §10, §12, §14, §15, §16, §17 · `docs/design/configurateur-v2.md` (proposition d'interface) · `src/components/site/Configurator.tsx`, `config-store.tsx` (remplacés) · `supabase/migrations/20260622_config_tarifs.sql` · ADR-005 et ADR-020 (remplacées), ADR-029 (vocabulaire), ADR-031, ADR-032, ADR-033.
