# ADR-015 — Légal : acompte vs arrhes + CGV + remboursement

- **Statut** : Bloqué (avocat)
- **Date** : 2026-06-16
- **Phase** : pré-lancement
- **Faisabilité** : 🔴 Bloquant — risque HAUT
- **Alerte Albert** : **Oui — bloque le lancement commercial**

## Contexte
Le front annonce un acompte « remboursable, sans engagement de construction ». Or **acompte** et **arrhes** ont des régimes juridiques différents (conditions de rétractation/remboursement). Les CGV pointent vers `#` (« en cours de validation juridique »). Le composant `<LegalNote/>` a un TODO LÉGAL en place.

## Décision
**Obtenir un avis juridique** avant tout encaissement réel :
1. Trancher acompte vs arrhes → aligner le wording front.
2. Rédiger/valider les CGV.
3. Fixer les conditions de remboursement/rétractation cohérentes avec le point 1.

## Faisabilité
- **Verdict** : 🔴 Bloquant — **on ne peut pas vendre sans CGV valides ni régime d'acompte clarifié**.
- **Dépendances externes** : avocat (TBD).
- **Risques** : HAUT — risque contractuel/consommateur si encaissement avant validation.

## Conséquences
**Bloque ADR-008** côté mise en production commerciale (le code peut être prêt, l'encaissement non). À remonter en alerte AHF_CORE (risque juridique).

## Sources
`PASSATION_RICHARD.md` (risques légaux, CGV en validation), `src/components/site/Reservation.tsx` (`<LegalNote/>`, FAQ garanties).
