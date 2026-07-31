# ADR-004 — Règles de marque absolues

- **Statut** : **Remplacé → ADR-029** (2026-07-31) — voir la note en fin de fichier
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

## Remplacement 2026-07-31 — ADR-029

Cet ADR est **remplacé par ADR-029** (repositionnement produit & marque), qui applique la
spécification configurateur v2 d'Albert (`docs/specs/SPEC_CONFIGURATEUR_HOWNER_v1.md`).

**Ce qui est repris tel quel** : « notre architecte intégrée » (sans prénom, sans marqueur de
genre additionnel), « Puigbo » (sans accent), et la blocklist historique — modulaire,
préfabriqué, tiny house, conteneur, catalogue.

**Ce qui change** : la blocklist est étendue à *maison*, *votre maison*, *maison individuelle*,
*résidence principale*, *clé en main*, toute raison sociale autre que Howner, tout nom de
fournisseur ou de sous-traitant. Un vocabulaire imposé apparaît — module, unité, studio,
hébergement, annexe, espace supplémentaire, prêt à vivre.

Les deux blocklists sont **cumulatives** : « module » (nom, imposé) et « modulaire » (adjectif,
interdit) coexistent sans se contredire.

Ne plus amender ce fichier : toute évolution des règles de marque passe désormais par ADR-029.
