# ADR-011 — LandTool : zonage réel via GPU / IGN

- **Statut** : Proposé
- **Date** : 2026-06-16
- **Phase** : 4
- **Faisabilité** : 🟠 Faible-moyenne
- **Alerte Albert** : Non

## Contexte
`LandTool.tsx` géocode déjà réellement une adresse via **BAN** (api-adresse.data.gouv.fr, public, sans clé) et calcule la distance (haversine ×1.3 depuis Bayonne). En revanche le **zonage** (U / AU / A / N, ABF, SPR) est aujourd'hui **heuristique** (basé sur la précision du géocodage), pas un vrai verdict.

## Décision
Brancher le zonage réel via **GPU (Géoportail de l'Urbanisme)** + **IGN cadastre** : verdict U/AU/A/N, présence ABF, SPR, servitudes. Conserver l'affichage en 4 étapes (déjà prêt). BAN reste la brique d'entrée.

## Faisabilité
- **Verdict** : 🟠 Faible-moyenne — API publiques mais quotas/latence/format à intégrer ; le pipeline UI existe déjà.
- **Dépendances externes** : GPU, IGN (publics, possibles limites de débit).
- **Risques** : disponibilité/SLA API ; le **fallback dégradé heuristique actuel reste acceptable** si indispo.

## Conséquences
N'altère pas BAN (déjà fonctionnel). Le résultat alimente le snapshot lead (ADR-013).

## Sources
`PASSATION_RICHARD.md` §LandTool (zonage), `src/components/site/LandTool.tsx`.
