# ADR-005 — Configurator / pricing 3 couches verrouillé

- **Statut** : **Remplacé → ADR-030** (2026-08-01) — **amendé par ADR-020** (2026-06-16)
- **Date** : 2026-06-16
- **Phase** : 1
- **Faisabilité** : ✅ Guardrail
- **Alerte Albert** : Non

> **Amendement (ADR-020)** : le verrou porte désormais sur la **logique de calcul 3 couches** (à ne pas modifier), et non plus sur les fichiers entiers. Le configurateur est devenu multi-produit (source des montants = `PRODUCTS[product].pricing`). Voir ADR-020.

## Contexte
Le calcul de devis (3 couches : maison = base + bardage + options + terrasse ; livraison = km + grutage ; frais terrain = lignes indicatives séparées) est correct et validé. Le PASSATION le marque explicitement *« juste, ne pas toucher »*.

## Décision
**Ne pas modifier** `src/components/site/Configurator.tsx` ni `src/components/site/config-store.tsx`. Le store de config est la source de vérité du devis. Toute évolution pricing passe par un ADR dédié + validation.

## Faisabilité
- **Verdict** : ✅ Guardrail — interdiction de modification.
- **Dépendances externes** : aucune.
- **Risques** : une modif non concertée casse le devis (couche 3 frais terrain jamais dans le total maison).

## Conséquences
Les intégrations Phase 4 (Stripe ADR-008) **consomment** le store sans le réécrire (snapshot config dans la metadata de session).

## Sources
`PASSATION_RICHARD.md` (table features — Devis « ne pas toucher »), `config-store.tsx`.

## Amendement 2026-07-30 — ADR-028 (suspension domaine mandataire)
`Configurator.tsx` et `config-store.tsx` sont modifiés sous **ADR-028** : le sélecteur
« J'ai un terrain / Je cherche un terrain » est retiré tant que le réseau mandataire est
suspendu, `terrainMode` démarre sur `"have"` et le mode `"pack"` est verrouillé dans le store.
**Le verrou de pricing tient** : `optionsTotal`, `houseTotal`, `delivery`, `grandTotal` et la
logique 3 couches sont inchangés. La modification est strictement UI / parcours.

## Remplacement 2026-08-01 — ADR-030

Le verrou posé par cet ADR est **levé**. `Configurator.tsx` et `config-store.tsx`
sont réécrits par ADR-030 : parcours en 7 écrans, grilles pilotées par données,
`perM2` et `terrassePerM2` supprimés du modèle de calcul.

La règle qui prend la relève n'est plus « ne pas toucher » mais **« ne jamais coder
les grilles en dur »** : prix, paliers, options et volume de série doivent rester
éditables sans redéploiement (§12 de la spec — « elles bougeront »).

Ne plus amender ce fichier.
