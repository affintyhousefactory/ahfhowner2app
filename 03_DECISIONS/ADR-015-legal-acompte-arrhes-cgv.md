# ADR-015 — Légal : acompte vs arrhes + CGV + remboursement

- **Statut** : **Levé le 2026-08-22** — voir § Amendement (était : Bloqué, avocat)
- **Date** : 2026-06-16
- **Phase** : pré-lancement
- **Faisabilité** : ~~🔴 Bloquant — risque HAUT~~ → **🟢 levé** (CGV validées du 2026-08-22)
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


## Amendement du 2026-08-22 — CGV validées, blocker levé

**Décision de Richard** : les CGV livrées le 2026-08-22 (`docs/legal/cgv-2026-08-22.md`, source Drive *Direction/Juridique*) sont réputées **relues et valides**. Les trois points de la décision d'origine sont traités.

### 1. Acompte ou arrhes — la question est tranchée, et pas par le mot attendu

Les CGV ne retiennent **ni** « acompte » **ni** « arrhes » pour la réservation. Le §8.3 institue un **« versement initial de réservation »** de 2 000 €, « intégralement remboursable avant la signature du contrat », qui « ne constitue pas un engagement définitif de fabrication, de livraison ou d'installation ».

C'est le régime que le site décrivait déjà — mais sous un nom qui le contredisait. **« Acompte remboursable, sans engagement de construction » est une contradiction dans les termes** : un acompte engage fermement les deux parties (art. 1590 du Code civil), et c'est précisément ce que cette somme ne fait pas. Le mot promettait l'inverse de la clause.

Le wording est donc aligné partout où le client le lit :

| Surface | Avant | Après |
|---|---|---|
| `Reservation.tsx` — ligne de devis | « Acompte de réservation Arko — remboursable, sans engagement de construction » | « Versement initial de réservation Arko — intégralement remboursable avant signature du contrat » |
| `Reservation.tsx` — mention légale | « Acompte de réservation de 2 000 € — remboursable » | « Versement initial de réservation de 2 000 € — intégralement remboursable avant signature du contrat » |
| `Reservation.tsx` — projection | « le paiement sécurisé de l'acompte » | « le paiement sécurisé du versement initial » |
| `StickyCta.tsx` — barre flottante | « acompte 2 000 € » | « réservation 2 000 € » |
| `configurateur/mentions.ts` — devis | idem ligne de devis | idem |

Le `TODO LÉGAL` de `LegalNote()` est remplacé par la référence à la clause qui tranche. Le §10 de la spec configurateur interdit de reformuler ces textes sans amendement d'ADR-030 : la reformulation est ici imposée par un document opposable, et actée par le présent amendement.

### 2. CGV rédigées et validées

La page `/cgv` est **générée** depuis le markdown validé (`scripts/build-cgv.mjs`) et non recopiée : 47 Ko de texte opposable, où une clause avalée à la transcription ne se verrait pas à la relecture. La conversion est vérifiée mot à mot — **5 648 mots, identiques à la source** — et le générateur refuse de publier en cas d'écart.

**Ce qui n'est pas publié**, parce que ce sont des notes de production et non des clauses : le bandeau « version de travail » et la note au conseil, le §29 « Points à compléter avant publication » — publier la liste de ce qui manque à ses propres CGV donne une prise à qui les conteste — et le §30 « Termes à proscrire », consigne de communication interne. Rien n'est modifié dans la source : ces blocs sont exclus du rendu, et `docs/legal/` reste la copie conforme.

### 3. Remboursement et rétractation

Le §20 renvoie aux droits impératifs du consommateur et précise que « toute clause contraire est réputée non écrite ». Le §8.3 fixe le remboursement intégral avant signature. Cohérent avec le point 1.

### Ce que cet amendement ne lève pas

- **Le médiateur de la consommation n'est pas nommé.** Le §22 renvoie à la médiation, et le §1 indique « information fournie lors de la remise du contrat ». Or l'article L.616-1 du Code de la consommation impose de communiquer les coordonnées du médiateur **sur le site**, avant tout litige, dès lors qu'on s'adresse à des consommateurs. Même chose pour l'assureur RC professionnelle et la garantie décennale. Ces trois trous figurent au §29 des CGV, qui les qualifie lui-même de « à compléter **avant publication** » — et la publication a lieu.
- **Le vocabulaire des CGV n'est pas celui du site.** Elles emploient « unité modulaire » et « studios de jardin modulaires », termes proscrits par ADR-029. Les pages légales sont exclues du contrôle (§17.10), donc rien ne casse ; mais un client attentif lira sur le même site deux vocabulaires en désaccord.
- **Aucun encaissement n'est branché** : ADR-008 (Stripe) reste à faire. Le blocker levé ici est juridique, pas technique.


## Conséquences
**Bloque ADR-008** côté mise en production commerciale (le code peut être prêt, l'encaissement non). À remonter en alerte AHF_CORE (risque juridique).

## Sources
`PASSATION_RICHARD.md` (risques légaux, CGV en validation), `src/components/site/Reservation.tsx` (`<LegalNote/>`, FAQ garanties).
