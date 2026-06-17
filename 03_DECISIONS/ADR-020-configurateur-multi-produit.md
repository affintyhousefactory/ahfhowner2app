# ADR-020 — Configurateur multi-produit (One/Max)

- **Statut** : Accepté
- **Date** : 2026-06-16
- **Phase** : 1
- **Faisabilité** : ✅ Élevée
- **Alerte Albert** : **Oui — déverrouillage contrôlé du configurateur (amende ADR-005)**

## Contexte
Le passage à deux produits (Arko One 20 m² / Arko Max 40 m² — ADR-022) impose que le configurateur calcule le devis selon le produit choisi. ADR-005 verrouillait `Configurator.tsx` / `config-store.tsx` (« ne pas toucher »). L'évolution était donc impossible sans amendement explicite.

## Décision
Amender ADR-005 : `config-store.tsx` porte désormais un produit actif (`product: "one" | "max"`) et lit la grille tarifaire depuis `PRODUCTS[product].pricing` (`src/lib/site.ts`) au lieu de la constante globale `PRICING`. La **logique de calcul 3 couches reste identique** (optionsTotal / houseTotal / delivery / grandTotal) — seule la source des montants est paramétrée. Le configurateur affiche un sélecteur segmenté One/Max ; `/configurer?produit=` présélectionne via `ProductSync`.

## Faisabilité
- **Verdict** : ✅ Élevée — refacto de paramétrage, aucune nouvelle dépendance.
- **Dépendances externes** : aucune.
- **Risques** : régression du devis si les grilles produit sont mal renseignées. Mitigé : Max = valeurs historiques inchangées ; One = grille `ONE_PRICING` isolée, valeurs provisoires marquées `TODO ARKO ONE`.

## Conséquences
- Le verrou ADR-005 devient « ne pas modifier la **logique** de calcul » (et non plus le fichier entier).
- Stripe Phase 4 (ADR-008) consomme le store inchangé (snapshot inclut désormais `product`).
- À faire : renseigner la vraie grille Arko One (base confirmée 59 900 € ; perM2/options/terrasse/dimensions à fournir).

## Sources
`src/lib/site.ts` (`PRODUCTS`, `ONE_PRICING`), `config-store.tsx`, `Configurator.tsx`, `ProductSync.tsx`, ADR-005, ADR-022.
