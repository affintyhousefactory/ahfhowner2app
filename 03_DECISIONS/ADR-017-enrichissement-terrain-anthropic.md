# ADR-017 — Enrichissement terrain via Anthropic (option)

- **Statut** : Différé (option)
- **Date** : 2026-06-16
- **Phase** : 4
- **Faisabilité** : ⚪ Optionnel
- **Alerte Albert** : Non

## Contexte
Le PASSATION évoque une clé `ANTHROPIC_API_KEY` optionnelle pour enrichir/synthétiser l'analyse terrain avant restitution (résumé, reformulation du verdict zonage).

## Décision
**Optionnel, différé**. Possible couche d'enrichissement de la sortie LandTool (ADR-011/012) via un modèle Anthropic — uniquement si valeur démontrée. Côté serveur (clé secrète).

## Faisabilité
- **Verdict** : ⚪ Optionnel — n'apporte rien tant que le zonage réel (ADR-011) n'est pas en place.
- **Dépendances externes** : `ANTHROPIC_API_KEY` (secret serveur), coût par appel.
- **Risques** : coût, ne jamais présenter une synthèse IA comme verdict réglementaire certain.

## Conséquences
À évaluer après ADR-011. Aucun blocage.

## Sources
`PASSATION_RICHARD.md` (variable `ANTHROPIC_API_KEY` optionnelle).
