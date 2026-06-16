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
| 004 | Règles de marque absolues | Accepté |
| 019 | Structure cognitive INDEX/HUB/_RUNTIME | Accepté |

## Règles
- Toute décision structurante = un ADR (`ADR-NNN-titre.md`).
- Marque (ADR-004) : interdits CCMI, LSF, acier, hors-site, modulaire, préfabriqué, tiny house, conteneur, catalogue, micro-maison ; « notre architecte intégrée » ; « Puigbo ».
- Secrets jamais dans Git ; placeholders only.

## Alertes Albert (AHF_CORE)
Positionnement/marque · charte/design (ADR-002) · prix cible · risque juridique (ADR-015) · RGPD/sécurité · dépendance externe critique · dérive planning. Format : sujet · impact · gravité · décision attendue · recommandation.

## Questions ouvertes
Validation Albert : charte (ADR-002), légal (ADR-015). Voir `_RUNTIME/pending-questions.md`.
