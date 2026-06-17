# ADR-005 — Configurator / pricing 3 couches verrouillé

- **Statut** : Accepté (guardrail) — **amendé par ADR-020** (2026-06-16)
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
