/**
 * Vérifie que l'échéancier éditorial concorde avec les CGV.
 *
 * Le §9.3 des CGV fait foi : c'est le texte opposable, relu par le conseil.
 * `ECHEANCIER` (`src/lib/site.ts`) en est le reflet, lu par la FAQ et par tout
 * ce qui parle paiement côté site. Deux écritures d'une même règle finissent
 * toujours par diverger — sauf si quelque chose le refuse.
 *
 * Ce contrôle compare les pourcentages, dans l'ordre. Il ne compare pas les
 * formulations : les CGV parlent en clauses, le site en phrases. Ce sont les
 * chiffres qui engagent.
 *
 * Usage : node scripts/check-echeancier.mjs   (ou npm run check:echeancier)
 */

import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..");

/* ── Côté CGV — le tableau du §9.3 ───────────────────────────────────────── */

const fichierCgv = readdirSync(join(RACINE, "docs/legal"))
  .filter((f) => /^cgv-\d{4}-\d{2}-\d{2}\.md$/.test(f))
  .sort()
  .pop();
if (!fichierCgv) {
  console.error("✗ Aucun docs/legal/cgv-AAAA-MM-JJ.md — rien à vérifier.");
  process.exit(1);
}

const cgv = readFileSync(join(RACINE, "docs/legal", fichierCgv), "utf8").replace(/\r\n/g, "\n");
const bloc93 = cgv.split(/^### 9\.3 /m)[1]?.split(/^### /m)[0];
if (!bloc93) {
  console.error("✗ §9.3 introuvable dans les CGV — la structure du document a changé.");
  process.exit(1);
}

/* Le §9.3 porte deux tableaux : la règle, puis un exemple chiffré. Seul le
   premier définit les pourcentages ; l'exemple en découle et les répéterait,
   ce qui donnerait dix étapes au lieu de cinq. */
const regle = bloc93.split(/À titre d.exemple/)[0];

const rangs = regle
  .split("\n")
  .filter((l) => /^\| Étape \d/.test(l))
  .map((l) => l.split("|").map((c) => c.trim()));

const partsCgv = [];
for (const r of rangs) {
  const cellule = r.find((c) => /%/.test(c)) ?? "";
  if (/0\s*%\s*du prix total/.test(cellule)) { partsCgv.push(0); continue; }
  const m = cellule.match(/\*\*(\d+)\s*%/) ?? cellule.match(/(\d+)\s*%/);
  if (m) partsCgv.push(Number(m[1]));
}

/* ── Côté site — ECHEANCIER ──────────────────────────────────────────────── */

const site = readFileSync(join(RACINE, "src/lib/site.ts"), "utf8");
const blocEch = site.split("export const ECHEANCIER = [")[1]?.split("] as const;")[0];
if (!blocEch) {
  console.error("✗ `ECHEANCIER` introuvable dans src/lib/site.ts.");
  process.exit(1);
}
const partsSite = [...blocEch.matchAll(/part:\s*(\d+)/g)].map((m) => Number(m[1]));

/* ── Comparaison ─────────────────────────────────────────────────────────── */

const ecarts = [];
if (partsCgv.length !== partsSite.length) {
  ecarts.push(`${partsCgv.length} étapes aux CGV, ${partsSite.length} sur le site`);
}
const n = Math.max(partsCgv.length, partsSite.length);
for (let k = 0; k < n; k++) {
  if (partsCgv[k] !== partsSite[k]) {
    ecarts.push(`étape ${k + 1} : ${partsCgv[k] ?? "—"} % aux CGV, ${partsSite[k] ?? "—"} % sur le site`);
  }
}

/* Le total doit faire 100 % — un échéancier qui ne solde pas la commande est
   un problème avant même d'être une divergence. */
const total = partsSite.reduce((s, p) => s + p, 0);
if (total !== 100) ecarts.push(`les parts du site totalisent ${total} %, pas 100 %`);

if (ecarts.length) {
  console.error(`✗ L'échéancier du site diverge des CGV (${fichierCgv}) :`);
  for (const e of ecarts) console.error(`  · ${e}`);
  console.error("\n  Les CGV font foi. Corriger `ECHEANCIER` dans src/lib/site.ts.");
  process.exit(1);
}

console.log(
  `✓ Échéancier conforme aux CGV (${fichierCgv}) — ${partsSite.length} étapes : ` +
    `${partsSite.map((p) => `${p} %`).join(" · ")}.`,
);
