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
import { PROSCRITS } from "./vocabulaire-proscrits.mjs";
import { join, relative } from "node:path";

const RACINE = process.cwd();
const CIBLES = ["src"];
const EXTENSIONS = [".ts", ".tsx", ".mjs"];

const EXCLUS = [
  // Pages légales — hors périmètre ADR-029 tant que §17.10 n'est pas fourni
  // (textes à livrer par Howner) et que le risque ADR-015 est ouvert.
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
