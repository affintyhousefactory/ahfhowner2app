# ADR-004 — Règles de marque absolues

- **Statut** : Accepté (gouvernance) — révisé 2026-07-09
- **Date** : 2026-06-16
- **Phase** : All
- **Faisabilité** : ✅ Vérifiable par grep
- **Alerte Albert** : Oui (révision du 2026-07-09 — changement de positionnement/marque, à remonter)

## Contexte
`src/lib/site.ts` (en-tête) fixe des règles de marque non négociables qui s'appliquent à tout contenu, code, doc et asset.

## Révision 2026-07-09
Richard a demandé le retrait de CCMI, LSF, acier, hors-site, micro-maison de la blocklist —
aucune justification juridique n'était documentée dans cet ADR pour ces termes spécifiquement
(vérifié : ni ici, ni dans ADR-015, ni ailleurs dans `03_DECISIONS/`). Restent interdits :
modulaire, préfabriqué, tiny house, conteneur, catalogue.

## Décision
- **Blocklist termes interdits** (jamais utilisés) : modulaire, préfabriqué, tiny house, conteneur, catalogue.
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
