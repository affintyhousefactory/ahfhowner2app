/**
 * Termes proscrits par ADR-029 — **source unique**.
 *
 * Extrait de `check-vocabulaire.mjs` le 2026-08-31 (ADR-044 §10) parce qu'un
 * second contrôle en a besoin : celui des templates Brevo, dont les textes ne
 * vivent pas dans `src/` et échappaient donc entièrement au garde-fou. Quatre
 * templates actifs étaient en infraction, dont un envoyé en production.
 *
 * Dupliquer la liste aurait recréé exactement ce qu'ADR-029 combat : deux
 * définitions d'une même règle, qui divergent sans que personne s'en aperçoive.
 */

/**
 * Termes proscrits.
 *
 * `mot`    : recherché sur frontière de mot, insensible à la casse.
 * `sauf`   : préfixes de chemin où CE terme précis est toléré. À n'employer
 *            que pour une exception écrite dans un ADR, jamais pour faire
 *            taire un échec. Une exception porte sur **un terme et un
 *            chemin** — elle ne désarme pas le reste du contrôle sur ce
 *            fichier, contrairement à `EXCLUS` qui, lui, en sort le fichier
 *            entier. C'est la différence entre « ce mot-là, ici, a un sens
 *            précis » et « cette zone n'est pas contrôlée ».
 */
export const PROSCRITS = [
  /* « maison » redevient proscrit — ADR-029 § Amendement du 2026-08-19,
     décision de Richard : le site ne vend plus une maison mais un **studio de
     jardin premium / d'exception**. Le terme imposé est « studio de jardin »,
     au masculin. C'est l'inverse exact de l'amendement du 2026-08-03, qui
     l'avait rendu obligatoire — les deux mouvements sont datés dans l'ADR
     plutôt qu'effacés.

     Effet de bord favorable : le repositionnement **éloigne** le site du
     régime CCMI (loi du 19 déc. 1990), risque 🔴 ouvert depuis le 2026-08-03.
     Un studio de jardin n'est pas une maison individuelle. La question reste
     posée à l'avocat, mais elle porte désormais sur beaucoup moins.

     Les deux entrées ci-dessous se recouvrent volontairement : « maison »
     suffirait à attraper « maison individuelle », mais garder la ligne CCMI
     explicite empêche qu'un futur relâchement de « maison » emporte
     silencieusement le garde-fou juridique avec lui. */
  { mot: "maisons?", libelle: "maison (terme proscrit — dire « studio de jardin »)" },
  { mot: "maisons? individuelles?", libelle: "maison individuelle (régime CCMI)" },
  { mot: "clé[ -]en[ -]main", libelle: "clé en main" },
  { mot: "résidences? principales?", libelle: "résidence principale" },
  // Blocklist historique reprise d'ADR-004.
  { mot: "modulaires?", libelle: "modulaire" },
  { mot: "préfabriquée?s?", libelle: "préfabriqué" },
  /* Exception ADR-029 § Amendement du 2026-08-20 (décision de Richard) :
     « tiny house » est autorisé sur la seule page qui compare le studio à ce
     produit — et où il désigne toujours le produit concurrent qu'on écarte,
     jamais un Arko. On ne peut pas se démarquer de ce qu'on refuse de nommer,
     et c'est le mot que le visiteur tape. Partout ailleurs, il reste proscrit.
     Trois chemins, pas un : la page, **son fichier de contenu** (le copy vit
     dans `src/lib/pages/contenu/`, jamais dans le JSX — convention ADR-038) et
     le registre, qui porte son titre et son résumé. Le mot y vit pour la même
     raison, et l'exception doit suivre le texte là où il est réellement écrit.
     Sur ces trois fichiers, tout le reste de la blocklist continue de
     s'appliquer.

     ⚠ Ce qu'une exception de chemin ne peut PAS voir : ce que le fichier
     exempté **diffuse ailleurs**. Le registre porte le `h1` de la page (affiché
     sur elle seule) mais aussi son `libelle` et son `resume`, repris par le pied
     de page et le maillage — donc servis sur toutes les pages du site. Avec
     « Studio ou tiny house » en libellé, le terme est apparu sur les dix pages
     du lot 3 sans qu'aucun contrôle ne bronche. Corrigé côté registre, où la
     règle est désormais écrite : sous exception, seul un `h1` peut porter le
     terme. Une exception se juge donc sur la **portée du texte**, pas
     seulement sur le fichier qui l'héberge. */
  {
    mot: "tiny[ -]house",
    libelle: "tiny house",
    sauf: [
      "src/app/(public)/studio-jardin-tiny-house/",
      "src/lib/pages/contenu/studio-jardin-tiny-house.ts",
      "src/lib/pages/registry.ts",
    ],
  },
  { mot: "conteneurs?", libelle: "conteneur" },
  { mot: "catalogues?", libelle: "catalogue" },

  /* ── §30 des CGV du 2026-08-22 — promesses à ne pas faire ────────────────
     Les CGV validées consacrent une section aux « termes à proscrire dans les
     supports publics HOWNER ». Ce ne sont pas des préférences de style : ce
     sont des formulations qui **promettent un résultat qu'AHF ne maîtrise
     pas** — une autorisation d'urbanisme délivrée par une mairie, la
     rentabilité d'un investissement, l'accord d'un financeur, la compatibilité
     d'une parcelle avant étude. Chacune transforme une obligation de moyens en
     obligation de résultat, et se retourne contre la société le jour où la
     promesse n'est pas tenue.

     Le §30 est resté hors de la page publiée : c'est une consigne interne, pas
     une clause opposable au client. Sa place est ici, où elle agit — une règle
     de communication qu'aucun contrôle n'applique finit par être oubliée.

     « clé en main » figure déjà plus haut, au titre d'ADR-029. */
  { mot: "solutions? compl[èe]tes?", libelle: "solution complète (§30 CGV)" },
  { mot: "prise en charge globale", libelle: "prise en charge globale (§30 CGV)" },
  { mot: "garantie d[e’']autorisation", libelle: "garantie d’autorisation (§30 CGV)" },
  {
    mot: "garantie de rentabilit[ée]",
    libelle: "garantie de rentabilité (§30 CGV)",
    /* Les CGV emploient l'expression pour la **nier** — « les simulations […]
       ne constituent pas une garantie de rentabilité » (§19). C'est la clause
       qui protège la société, pas une promesse. Exception bornée à ce chemin :
       le terme reste proscrit partout ailleurs, et les autres termes restent
       contrôlés sur les CGV. */
    sauf: ["src/app/(public)/cgv/"],
  },
  { mot: "financement garanti", libelle: "financement garanti (§30 CGV)" },
  { mot: "terrain garanti", libelle: "terrain garanti (§30 CGV)" },
  { mot: "pr[êe]ts? [àa] louer", libelle: "prêt à louer (§30 CGV)" },
];
