# HUB_GOUVERNANCE — Howner / ARKO

## Rôle du HUB
Point d'entrée pour : gouvernance ADR, règles de marque, secrets, alertes Albert, structure cognitive.

## À lire en priorité
1. `CLAUDE.md` — gouvernance, guardrails, alertes Albert.
2. `00_INDEX/PROJECT_STATE.md` — index ADR + blockers.
3. `03_DECISIONS/ADR_TEMPLATE.md` — format ADR.

## Documents clés
| Document | Contenu |
|---|---|
| `03_DECISIONS/` | ADR (mémoire décisionnelle durable) |
| `src/lib/site.ts` | Règles de marque + montants (vérité) |
| `_RUNTIME/` | Mémoire active courte |

## Décisions liées
| ADR | Sujet | Statut |
|---|---|---|
| 003 | Secrets & montants via env | Accepté (partiel) |
| 004 | Règles de marque absolues | Accepté — amendé 022 (wordmark accueil) |
| 019 | Structure cognitive INDEX/HUB/_RUNTIME | Accepté |
| 020 | Configurateur multi-produit (amende 005) | Accepté |
| 021 | Multi-pages + nav Tesla | Accepté |
| 022 | Split produit One/Max + repositionnement | Accepté — valider Albert |

## Règles
- Toute décision structurante = un ADR (`ADR-NNN-titre.md`).
- Marque (ADR-004) : interdits CCMI, LSF, acier, hors-site, modulaire, préfabriqué, tiny house, conteneur, catalogue, micro-maison ; « notre architecte intégrée » ; « Puigbo ».
- Secrets jamais dans Git ; placeholders only.

## Alertes Albert (AHF_CORE)
Positionnement/marque · charte/design (ADR-002) · prix cible · risque juridique (ADR-015) · RGPD/sécurité · dépendance externe critique · dérive planning. Format : sujet · impact · gravité · décision attendue · recommandation.

## Alertes Albert en attente (2026-06-16)
- Repositionnement mono → bi-produit, total 12 → 12+5 (ADR-022).
- Déverrouillage configurateur (ADR-005 → 020).
- Retrait wordmark ARKO accueil (ADR-004 → 022).
- Charte Affinity (ADR-002) ; légal acompte/CGV (ADR-015).

## Questions ouvertes
Validation Albert (ci-dessus). Voir `_RUNTIME/pending-questions.md`.
