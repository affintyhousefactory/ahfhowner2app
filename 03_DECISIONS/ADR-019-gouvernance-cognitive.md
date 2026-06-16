# ADR-019 — Structure de gouvernance cognitive (INDEX / HUB / _RUNTIME)

- **Statut** : Accepté
- **Date** : 2026-06-16
- **Phase** : All
- **Faisabilité** : ✅ Fait
- **Alerte Albert** : Non

## Contexte
Le projet a besoin d'une reprise rapide (`/resume`, `/memory-sync`) sans rescanner tout le repo. Un scaffold `00_INDEX/` + `_RUNTIME/` avait été ajouté mais **contaminé par du contenu AHF_WEB2** (4 segments, Brevo, Smart Nano/Max, Villa Arko) — projet différent, en violation de « ne pas mélanger les projets » et d'ADR-004. Deux `PROJECT_STATE.md` divergeaient (`context/` vs `00_INDEX/`).

## Décision
Adopter une structure de gouvernance cognitive **lean**, calquée sur AHF_WEB2 mais calibrée mono-produit :
- **`00_INDEX/PROJECT_STATE.md`** = **source de vérité canonique** de l'état (phases, blockers, index ADR). `context/PROJECT_STATE.md` n'est qu'un pointeur.
- **`00_INDEX/INDEX.md`** = carte de démarrage + liste des HUB.
- **HUB** (`00_INDEX/HUB_*.md`) = points d'entrée par domaine : `GOUVERNANCE`, `FRONTEND`, `BACKEND`, `RELEASE`, `PRODUCT`.
- **`_RUNTIME/`** = mémoire active courte et jetable : `CURRENT_SESSION.md`, `active-context.md`, `recent-decisions.md`, `pending-questions.md`.
- **`03_DECISIONS/`** = mémoire décisionnelle durable (ADR immuables).

## Faisabilité
- **Verdict** : ✅ Fait (documentation).
- **Dépendances externes** : aucune.
- **Risques** : dérive si `_RUNTIME` devient un backlog permanent, ou si une vérité est dupliquée hors `00_INDEX/PROJECT_STATE.md`.

## Conséquences
Règles : (1) ne jamais mélanger les projets ; (2) une seule vérité d'état (00_INDEX) ; (3) `_RUNTIME` reste court (`CURRENT_SESSION` ≤ 1200 tokens) ; (4) toute décision durable → ADR. `CLAUDE.md`/`AGENTS.md` câblent l'ordre de lecture `_RUNTIME → 00_INDEX/PROJECT_STATE → INDEX(HUB) → DESIGN → ADR`.

## Sources
`_RUNTIME/active-context.md` (règles cognitives), convention AHF_WEB2 (`00_INDEX/`, `_RUNTIME/`), plan de session 2026-06-16.
