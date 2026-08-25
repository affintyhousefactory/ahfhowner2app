# ADR-040 — Pages produit « Heure bleue »

- **Statut** : Accepté — livré, à vérifier en Preview
- **Date** : 2026-08-25
- **Décideur** : Richard
- **Faisabilité** : ✅ (aucune dépendance nouvelle)
- **Amende** : ADR-002 (charte Affinity)

## Contexte

Demande de Richard : « un site moderne avec framer motion digne des meilleurs
sites web startup » pour `/studio-jardin-arko-one`, puis `/studio-jardin-arko-max`.

Trois directions ont été maquettées et soumises — « Terre & atelier »,
« Silence éditorial », « Heure bleue ». **Richard a retenu Heure bleue.**

## Décision

Fond encre (`#0f1519`) de bout en bout, lumière chaude (`#e8c9a0`) qui traverse
surtitres, filets, chiffres et boutons. **L'objet habité plutôt que l'objet
montré.** Typographies inchangées : Space Grotesk en titrage, Inter en texte —
ce qui change est la composition et le fond, pas la fonte.

### Les deux pages ne disent pas la même chose

Si elles disaient la même chose, la gamme n'aurait pas de sens et le visiteur
choisirait au prix.

- **One** — la pièce qui manquait. « Vous n'avez pas besoin de déménager. »
- **Max** — un logement d'appoint autonome. « Accueillir sans se serrer », et la
  chambre porte la différence : « une pièce à part, porte fermée — ce que le
  20 m² ne permet pas ».

La **structure** est identique à dessein : c'est ce qui fait qu'on reconnaît une
page produit Howner d'une gamme à l'autre. Seul le contenu diffère, et il vit
dans `src/lib/produits/heure-bleue.ts`, jamais dans le JSX.

### Quatre moments de motion, et pas un de plus

`framer-motion` était déjà dans la stack : **aucune dépendance ajoutée**.

1. **Ouverture** — l'image se dézoome de 1.07 à 1 sur 2,4 s pendant que les
   blocs autour du titre montent, décalés de 100 ms. Courbe `[.16, 1, .3, 1]`,
   celle de `--ease-out-expo`, déjà partout sur le site.
2. **Entrées au défilement** — `Reveal` existant réutilisé plutôt qu'un second
   composant écrit pour l'occasion.
3. **Les chiffres** s'incrémentent une fois, à l'entrée dans le cadre.
4. **Barre d'action mobile** collante, révélée après le hero.

Une page animée de bout en bout fatigue et coûte ; l'orchestration reste au hero.

### Ce qui n'a PAS été repris, contrairement à ce qui avait été annoncé

L'en-tête et le pied de page étaient présentés comme le coût principal de cette
direction. Vérification faite dans le code **et sur la production** :

- la barre porte un **fond clair permanent** (`bg-canvas/80` + flou) depuis le
  2026-08-20 — elle avait précisément été corrigée pour survivre aux heros
  sombres des pages éditoriales ;
- le pied de page est **déjà sombre** (`bg-ink`, `#0d141a`), à deux points de la
  teinte de fond : la page s'y fond au lieu de trancher ;
- et le cas **tournait déjà en ligne** : `/guide` ouvre sur un hero `ink` sous
  cette même barre.

*Leçon : une réserve annoncée sans être vérifiée coûte un arbitrage inutile. La
question de Richard — « peut-on envisager un fond clair sur les menus ? » — a
fait tomber une objection que j'avais posée sans regarder le composant.*

## Contraintes tenues

- **ADR-006** — l'image du hero **est** le LCP : `priority`, `sizes="100vw"`,
  AVIF. Le dézoom porte sur `scale`, composité par le GPU, hors de la mesure du
  LCP (contrairement à un `width` animé).
- **Indexabilité** — le `<h1>` n'est **jamais** masqué en JS ; l'animation ne
  porte que sur les blocs qui l'entourent. Idem pour les chiffres : la valeur
  finale est rendue par le serveur, le compteur ne fait que la remplacer
  temporairement. Leçon du 2026-08-19 (un titre en `opacity: 0` sérialisé n'est
  pas indexé), déjà traitée en CSS dans `Reveal`.
- **ADR-029** — vocabulaire conforme, accord au masculin sur « studio ».
- **ADR-003** — aucun montant recopié : les prix sont lus sur
  `PRODUCTS[key].pricing`, le volume de série sur `SERIE_TOTAL`.

## Arbitrages de Richard (2026-08-25)

- **Charte** : la direction est validée ; ADR-002 ne conditionne plus
  l'implémentation. Cet ADR l'amende.
- **« Posé en une journée »** remplace « la grue le matin, vos clés le soir » —
  la seconde était une promesse d'exécution qu'aucune donnée du dépôt ne soutient.
- **Le pool de six reste tel quel** : commun aux deux modèles (ce n'est pas
  6 + 6), les deux pages annoncent le même compte sans le préciser.
- **La photo de pose à la grue** est retirée du carrousel. Conservée au dépôt
  (`one/carousel/pose-grue.avif`) : seule image non générée du lot, elle prouve
  la pose, l'absence d'accès chantier et l'annexe sur parcelle bâtie.

## Conséquences

- **Huit composants deviennent orphelins** : `ProductHero`, `RevealScrub`,
  `Discover`, `AvantPremiere`, `Process`, `Specs`, `Price`, `Included`. Ils ne
  servaient qu'aux deux pages produit — l'accueil n'en utilise aucun.
  **Volontairement non supprimés** : leur retrait élargirait la PR et enlèverait
  le retour arrière. Aucune ancre cassée (vérifié : rien ne pointe vers
  `#decouvrir`, `#specs`, `#prix`, `#process`).
- **Les métadonnées disent « Édition Arko »** au lieu de « Série 01 », alignées
  sur le libellé du configurateur.
- Le média `MAX_PANELS` / `MAX_REVEAL` (ADR-006, séquence scrubée du 2026-08-19)
  n'est plus servi. À rejuger : la séquence de révélation était un morceau de
  bravoure, elle n'a pas d'équivalent dans la nouvelle page.

## Reste ouvert

- **Le hero de l'Arko One** sert encore un intérieur de l'Arko **Max** au
  crépuscule : les rendus One fournis sont diurnes et ne tiennent pas l'heure
  bleue. Trois issues — assumer, basculer sur l'extérieur One, ou commander un
  rendu nocturne. Le Max, lui, a désormais le sien.
- **La barre est translucide à 80 %** : le contenu sombre qui défile dessous la
  teinte légèrement. La passer à 95 % sur ces pages est une valeur à changer.
- **Alerte Albert** — repositionnement visuel des deux pages produit les plus
  vues du site, écart assumé à la charte Affinity.
