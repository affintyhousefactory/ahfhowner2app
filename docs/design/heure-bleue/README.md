# Direction « Heure bleue » — pages produit Arko One et Arko Max

> Matériel d'intégration, versé le 2026-08-25. **Rien ici n'est servi au public** :
> ce dossier est une référence pour l'implémentation, pas du code de production.

## Ce que contient ce dossier

Quatre maquettes au format Design Components (`.dc.html`), autonomes, qui
s'ouvrent dans un navigateur :

| Fichier | Écran |
|---|---|
| `arko-one-bureau.dc.html` | `/studio-jardin-arko-one`, 1280 px |
| `arko-one-mobile.dc.html` | idem, 390 px |
| `arko-max-bureau.dc.html` | `/studio-jardin-arko-max`, 1280 px |
| `arko-max-mobile.dc.html` | idem, 390 px |

Les canevas commentés, avec les notes de motion et les arbitrages, vivent hors
dépôt (artefacts publiés) — ce dossier en fige le contenu pour que
l'implémentation ne dépende pas d'un lien.

## La direction en trois lignes

Fond encre (`#0f1519`), lumière chaude (`#e8c9a0`) qui traverse surtitres,
filets, chiffres et boutons. L'objet **habité** plutôt que l'objet montré.
Typographies inchangées : Space Grotesk en titrage, Inter en texte — ce qui
change est la composition et le fond, pas la fonte.

## Ce que les deux pages ne disent pas pareil

Si les deux pages disent la même chose, la gamme n'a pas de sens et le visiteur
choisit au prix.

- **One** — la pièce qui manquait : bureau, chambre d'amis, atelier.
  Argument : ne pas déménager. « À vingt pas de chez vous, et tout à fait ailleurs. »
- **Max** — un logement d'appoint autonome : chambre à part, cuisine ouverte,
  salle de bain. Argument : accueillir dans la durée. « La même adresse, et
  pourtant un autre chez-soi. »

## Les quatre moments de motion

`framer-motion` est déjà dans la stack : aucune dépendance à ajouter.

1. **Ouverture** — l'image se dézoome de 1.07 à 1 sur 2,4 s pendant que le
   titre monte ligne par ligne. `staggerChildren: 0.1`, courbe `[.16, 1, .3, 1]`
   (celle de `--ease-out-expo`, déjà partout sur le site).
2. **Entrées au défilement** — réutiliser le composant `Reveal` existant plutôt
   que d'en écrire un second. ⚠ Jamais de `<h1>`/`<h2>` sous un bloc animé en
   JS : un titre en `opacity: 0` sérialisé n'est pas indexé (leçon du 2026-08-19).
3. **Les chiffres** — s'incrémentent une fois, à l'entrée dans le cadre.
   `useMotionValue` + `animate`. À ne faire que là.
4. **Barre d'action mobile** — collante, révélée après le hero.

## Les visuels

Fournis par Richard depuis le Drive partagé (`plans_visuels`, dossiers
`SITE_CAROUSSEL`), encodés en AVIF 2000 px :

- `public/assets/arko/one/carousel/` — `exterieur`, `cuisine`, `chambre`,
  `salle-eau`, `pose-grue`
- `public/assets/arko/max/carousel/` — `exterieur`, `salon`, `cuisine`,
  `chambre`, `salle-bain`

**Aucun filtre d'assombrissement** n'est appliqué dans les maquettes : les
rendus sont finis, les altérer les abîmerait.

⚠ `one/carousel/pose-grue.avif` **n'est pas un rendu** : c'est une photo de pose
réelle, l'unité suspendue au-dessus d'une haie. Elle prouve d'un coup la pose en
un jour, l'absence d'accès chantier et l'annexe sur parcelle déjà bâtie — le
cadre de vente d'ADR-029. **Retirée du carrousel sur demande de Richard**
(2026-08-25) ; conservée au dépôt car c'est la seule image non générée du lot.

## Ce qui reste à trancher avant d'implémenter

- **Le fond sombre impose de reprendre l'en-tête et le pied de page**, pensés
  pour un fond clair. C'est le vrai coût de cette direction, pas le motion.
- **ADR-006** verrouille Lighthouse 100 et un LCP sous 0,8 s. L'image du hero
  **est** le LCP : `priority`, AVIF, et pas de JS devant elle. Le dézoom est un
  `transform` composité, sans effet sur la mesure.
- **ADR-002** (charte Affinity) attend toujours la validation d'Albert : cette
  direction s'en écarte, c'est une **alerte Albert** et un amendement à écrire.
- **Le pool de six est commun** aux deux modèles — ce n'est pas 6 + 6. Les deux
  pages affichent chacune « 6 numéros encore libres » sans le préciser : à
  arbitrer.
- **« La grue le matin, vos clés le soir »** est une promesse d'exécution, pas
  une donnée du dépôt. À confirmer ou à réécrire avant mise en ligne.
- **Le hero de l'Arko One** montre encore un intérieur de l'Arko **Max** au
  crépuscule : les rendus One fournis sont diurnes. Trois issues — assumer le
  contraste, basculer sur l'extérieur One, ou commander un rendu nocturne.

## Vocabulaire

Les quatre maquettes passent la blocklist d'ADR-029 : aucun terme proscrit,
accord au masculin sur « studio », et plus aucune mention d'une série qui se
fermerait — **« Six exemplaires pour cette collection Arko »** (correction de
Richard du 2026-08-25 : la collection compte six unités, mais rien ne ferme et
il n'y a pas de commande en lot).
