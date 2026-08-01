# ADR-030 — Configurateur v2 : parcours en 7 écrans, grilles pilotées par données

- **Statut** : **Accepté — en cours de développement**
- **Date** : 2026-08-01
- **Phase** : All
- **Faisabilité** : 🟠 Moyenne — le parcours et les grilles sont entièrement spécifiés ; les montants d'options restent provisoires (§17.4) et deux points d'arbitrage conditionnent la mise en ligne
- **Alerte Albert** : Non — la spécification vient de lui. Deux arbitrages lui reviennent (§ Points ouverts).

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
| 5 | Votre terrain | Qualification d'accès, uploads, rendez-vous → **ADR-032** |
| 6 | Récapitulatif | Prix, inclus, à votre charge, créneau, réservation → **ADR-031** |

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
- **Transport** : 4 zones depuis Bayonne. C'est le **seul calcul automatique du configurateur**. Zone 4 → aucun prix affiché, bascule sur formulaire de contact.

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
- L'analyse PLU automatique (`ParcelleAnalyse`) sort du parcours client — ADR-032, §8 de la spec.
- La réservation, les créneaux et le paiement relèvent d'ADR-031 : l'écran 6 affiche le récapitulatif et le bouton, la mécanique est ailleurs.

## Sources

`docs/specs/SPEC_CONFIGURATEUR_HOWNER_v1.md` §3, §5, §9, §10, §12, §14, §15, §16, §17 · `docs/design/configurateur-v2.md` (proposition d'interface) · `src/components/site/Configurator.tsx`, `config-store.tsx` (remplacés) · `supabase/migrations/20260622_config_tarifs.sql` · ADR-005 et ADR-020 (remplacées), ADR-029 (vocabulaire), ADR-031, ADR-032, ADR-033.
