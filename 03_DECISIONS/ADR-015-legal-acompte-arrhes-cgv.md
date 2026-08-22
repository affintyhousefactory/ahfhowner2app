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

### Amendements de Richard du 2026-08-22 (même jour)

Deux corrections demandées après lecture de la version publiée. Elles portent sur le document lui-même : la version d'origine reçue du Drive reste consultable dans l'historique Git, au commit `082931cc`.

**1. « Modulaire » retiré — six occurrences.** Le terme est proscrit par ADR-029, et les CGV le portaient jusque dans un **terme défini** du §2 : « Unité modulaire ». Renommé en « Unité », qui est précisément le vocabulaire imposé. Les cinq autres emplois suivent, dont l'objet social du §1 et la qualité d'AHF au §4.1 (« fabricant-installateur de studios de jardin »).

**2. « À compléter » remplacé par la formule de Richard**, au §22 (médiateur), au §1 (assureurs et médiateur) et au titre du §29. Une même idée s'écrivait de deux façons dans un même document — « à compléter avant publication » d'un côté, « information fournie lors de la remise du contrat » de l'autre ; les deux cèdent la place à **« communiqué lors des devis et contrats émis par AHF »**. La note de travail du §22 (« cette clause doit être complétée avant toute publication définitive ») disparaît : elle contredisait la publication.

Le §29 change de titre en conséquence — « Éléments communiqués lors des devis et contrats émis par AHF » — et n'est toujours pas publié : c'est une liste de livrables internes, pas une clause.

### Les CGV passent sous contrôle de vocabulaire

Conséquence directe : les CGV ne contiennent plus **aucun** terme proscrit, à une occurrence près — le §19 emploie « garantie de rentabilité » pour la **nier** (« les simulations […] ne constituent pas une garantie de rentabilité »). C'est la clause qui protège la société, pas une promesse : exception bornée à ce terme et à ce chemin, comme « tiny house » sur la page de comparaison.

`src/app/(public)/cgv/` sort donc de la liste des fichiers exclus. **Ce n'est pas cosmétique** : retirer « modulaire » n'a de valeur durable que si quelque chose empêche le terme de revenir à la prochaine version du document. Vérifié en réintroduisant « maison » dans la page : le contrôle le voit.

⚠ **Contrepartie assumée** : à la prochaine livraison du conseil, un terme juridiquement nécessaire pourra faire échouer le contrôle. C'est le débat qu'on veut — explicite, au moment de la livraison — plutôt qu'une divergence silencieuse entre le site et ses propres CGV. **Amende ADR-029 §5**, qui excluait les pages légales en bloc : l'exclusion vaut toujours pour les mentions légales, la confidentialité et les CGU mandataire.

### Ce que cet amendement ne lève pas

- **Le médiateur de la consommation n'est toujours pas nommé.** La nouvelle formule dit *quand* l'information est communiquée, pas *qui* est le médiateur. Or l'article L.616-1 du Code de la consommation impose de communiquer ses coordonnées **sur le site**, avant tout litige, dès lors qu'on s'adresse à des consommateurs — pas au moment du devis. Même analyse pour l'assureur RC professionnelle et la garantie décennale, dont l'article L.111-1 du même code impose la mention. **Reste à porter à Albert** : la formule est cohérente et publiable, elle ne rend pas la mention conforme pour autant.
- **Aucun encaissement n'est branché** : ADR-008 (Stripe) reste à faire. Le blocker levé ici est juridique, pas technique.


## Conséquences
**Bloque ADR-008** côté mise en production commerciale (le code peut être prêt, l'encaissement non). À remonter en alerte AHF_CORE (risque juridique).

## Sources
`PASSATION_RICHARD.md` (risques légaux, CGV en validation), `src/components/site/Reservation.tsx` (`<LegalNote/>`, FAQ garanties).
