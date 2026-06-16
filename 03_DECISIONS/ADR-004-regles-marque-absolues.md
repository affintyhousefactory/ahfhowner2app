# ADR-004 — Règles de marque absolues

- **Statut** : Accepté (gouvernance)
- **Date** : 2026-06-16
- **Phase** : All
- **Faisabilité** : ✅ Vérifiable par grep
- **Alerte Albert** : Non

## Contexte
`src/lib/site.ts` (en-tête) fixe des règles de marque non négociables qui s'appliquent à tout contenu, code, doc et asset.

## Décision
- **Blocklist termes interdits** (jamais utilisés) : CCMI, LSF, acier, hors-site, modulaire, préfabriqué, tiny house, conteneur, catalogue, micro-maison.
- **Architecte** : toujours « notre architecte intégrée » — sans prénom, sans marqueur de genre additionnel.
- **Fondateur** : « Puigbo » (sans accent).

## Faisabilité
- **Verdict** : ✅ Contrôlable automatiquement (grep de la blocklist) avant tout commit / publication.
- **Dépendances externes** : aucune.
- **Risques** : introduction accidentelle d'un terme interdit dans un nouveau contenu (docs, SEO, ADR).

## Conséquences
Tout nouveau texte (pages, SEO ADR-018, JSON-LD) passe le contrôle blocklist. Cette règle prime sur toute autre formulation.

## Sources
`src/lib/site.ts` (lignes d'en-tête 1–7).
