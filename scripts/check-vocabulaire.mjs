#!/usr/bin/env node
/**
 * Garde-fou vocabulaire de marque — ADR-029.
 *
 * La spec configurateur v2 en faisait un critère de recette (§16) :
 *   « Aucune occurrence de "maison", "clé en main", "résidence principale"
 *     dans les textes. »
 * Amendement du 2026-08-03 : « maison » sort de la liste et devient le terme
 * imposé (ADR-029 § Amendement). Le critère §16 de la spec est caduc sur ce
 * point ; les deux autres termes restent contrôlés, ainsi que « maison
 * individuelle » qui, lui, porte un régime contractuel (CCMI).
 *
 * Usage :  node scripts/check-vocabulaire.mjs
 * Sortie :  code 0 si conforme, 1 sinon (utilisable en CI ou pre-commit).
 *
 * Les pages légales sont exclues : leur réécriture dépend du §17.10 (textes à
 * fournir par Howner) et du risque ADR-015 (CGV non validées, live en prod).
 * Retirer ces exclusions le jour où les textes légaux sont livrés.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const RACINE = process.cwd();
const CIBLES = ["src"];
const EXTENSIONS = [".ts", ".tsx", ".mjs"];

const EXCLUS = [
  // Pages légales — hors périmètre ADR-029 tant que §17.10 n'est pas fourni
  // (textes à livrer par Howner) et que le risque ADR-015 est ouvert.
  "src/app/(public)/cgv/",
  "src/app/(public)/mentions-legales/",
  "src/app/(public)/confidentialite/",
  "src/app/(public)/cgu-mandataire/",
  // Domaine « Mandataire & Terrain » — suspendu (ADR-028), aucune de ces
  // surfaces n'est atteignable par un client. À réintégrer au contrôle le
  // jour où le flag est levé : leur vocabulaire est encore l'ancien.
  "src/app/(mandataire)/",
  "src/components/mandataire/",
  "src/shared/components/mandataire/",
  "src/shared/lib/contrat-pdf.ts",
  // Back-office : libellés internes, jamais vus par un client. La spec vise
  // explicitement le vocabulaire « côté client » (§1, §2).
  "src/app/(admin)/",
  "src/components/admin/",
];

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
const PROSCRITS = [
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
  { mot: "garantie de rentabilit[ée]", libelle: "garantie de rentabilité (§30 CGV)" },
  { mot: "financement garanti", libelle: "financement garanti (§30 CGV)" },
  { mot: "terrain garanti", libelle: "terrain garanti (§30 CGV)" },
  { mot: "pr[êe]ts? [àa] louer", libelle: "prêt à louer (§30 CGV)" },
];

function fichiers(dir, acc = []) {
  for (const entree of readdirSync(dir)) {
    if (entree === "node_modules" || entree.startsWith(".")) continue;
    const chemin = join(dir, entree);
    if (statSync(chemin).isDirectory()) fichiers(chemin, acc);
    else if (EXTENSIONS.some((e) => chemin.endsWith(e))) acc.push(chemin);
  }
  return acc;
}

const infractions = [];

for (const cible of CIBLES) {
  for (const chemin of fichiers(join(RACINE, cible))) {
    const rel = relative(RACINE, chemin).split("\\").join("/");
    if (EXCLUS.some((e) => rel.startsWith(e))) continue;

    const lignes = readFileSync(chemin, "utf-8").split("\n");

    // Le contrôle s'exerce sur le texte **tel que le visiteur le lit**, pas tel
    // qu'il est écrit. Un terme proscrit coupé par un retour à la ligne JSX
    // — « … € — clé\n  en main … » — échappait à une lecture ligne à ligne :
    // le rendu affichait « clé en main » sur /arko-one et /arko-max pendant que
    // le contrôle annonçait « conforme » (constaté le 2026-08-02).
    // On aplatit donc les blancs, en gardant de quoi retrouver la ligne.
    // Les blancs internes sont réduits à un espace unique, pas seulement les
    // retours à la ligne. L'indentation JSX en produit des paquets : « Prise en
    // charge\n      globale » aplati sans normalisation donne « Prise en charge
    //       globale », qu'aucun motif écrit avec un espace simple ne peut
    // atteindre. Le correctif du 2026-08-02 ne traitait que la coupure de
    // ligne ; il laissait passer tout terme multi-mots coupé sur du code
    // indenté — c'est-à-dire la quasi-totalité du JSX.
    const debuts = [];
    let plat = "";
    lignes.forEach((ligne, i) => {
      // Les commentaires citant la règle ne sont pas des infractions.
      const utile = /ADR-029|ADR-004/.test(ligne) ? "" : ligne.replace(/\s+/g, " ").trim();
      debuts.push({ index: plat.length, ligne: i + 1, texte: ligne });
      plat += utile + " ";
    });

    const ligneDe = (index) => {
      let trouve = debuts[0];
      for (const d of debuts) {
        if (d.index > index) break;
        trouve = d;
      }
      return trouve;
    };

    for (const { mot, libelle, sauf } of PROSCRITS) {
      if (sauf?.some((s) => rel.startsWith(s))) continue;
      /* `\b` ne connaît que l'ASCII : entre « rentabilité » et le point qui
         suit, il n'y a **pas** de limite de mot, `é` n'appartenant pas à `\w`.
         Un terme finissant par une lettre accentuée échappait donc au contrôle
         — silencieusement, ce qui est le pire des cas pour un garde-fou. Les
         limites sont exprimées en propriétés Unicode. */
      const motif = new RegExp(`(?<![\\p{L}\\p{N}])${mot}(?![\\p{L}\\p{N}])`, "giu");
      for (const m of plat.matchAll(motif)) {
        const { ligne, texte } = ligneDe(m.index);
        infractions.push({ fichier: rel, ligne, terme: libelle, texte: texte.trim().slice(0, 100) });
      }
    }
  }
}

if (infractions.length === 0) {
  console.log("✓ Vocabulaire conforme (ADR-029) — aucun terme proscrit hors pages légales.");
  process.exit(0);
}

console.error(`✗ ${infractions.length} occurrence(s) de vocabulaire proscrit (ADR-029) :\n`);
for (const { fichier, ligne, terme, texte } of infractions) {
  console.error(`  ${fichier}:${ligne}  « ${terme} »`);
  console.error(`    ${texte}\n`);
}
console.error("Vocabulaire imposé : studio de jardin (premium / d'exception),");
console.error("unité, hébergement, annexe, espace supplémentaire, prêt à vivre.");
console.error("Accord au MASCULIN. Voir ADR-029 § Amendement du 2026-08-19.");
process.exit(1);
