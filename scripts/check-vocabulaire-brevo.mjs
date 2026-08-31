#!/usr/bin/env node
/**
 * Garde-fou vocabulaire — volet Brevo (ADR-029, ADR-044 §10).
 *
 * ══════════════════════════════════════════════════════════════════════════
 * Pourquoi ce second contrôle existe
 * ══════════════════════════════════════════════════════════════════════════
 *
 * `check-vocabulaire.mjs` scanne `src/`. Or **les textes que les clients lisent
 * le plus ne sont pas dans `src/`** : ils sont rédigés dans l'éditeur de Brevo.
 * Le 2026-08-31, quatre templates actifs portaient des termes proscrits — dont
 * le 22, qui partait en production ce matin-là avec « maison ».
 *
 * C'est la huitième occurrence de la même leçon : **un contrôle qui n'observe
 * pas la sortie réelle ne contrôle rien.** Sauf qu'ici, le texte non contrôlé
 * est celui qu'un client a sous les yeux.
 *
 * ⚠ **Ce script n'entre pas dans la porte de PR.** Il exige `BREVO_API_KEY`,
 * absente du poste de contrôle, et un template peut être corrigé dans Brevo
 * sans qu'aucun commit ne l'accompagne — un échec de CI serait alors
 * indéchiffrable. Il se lance à la main **avant toute campagne et après toute
 * retouche de template**, et c'est cette obligation-là qui compte.
 *
 * Usage :  node scripts/check-vocabulaire-brevo.mjs
 * Sortie :  code 0 si conforme, 1 sinon.
 */
import { PROSCRITS } from "./vocabulaire-proscrits.mjs";

const API = "https://api.brevo.com/v3/smtp/templates";

/**
 * Templates hors périmètre. Même logique que les exclusions de fichiers : ce
 * qu'un client ne lit pas dans le cadre de la marque Howner n'a pas à être
 * contrôlé.
 */
const EXCLUS = [
  // Domaine « Mandataire & Terrain » suspendu (ADR-028) — vocabulaire encore
  // l'ancien, aucune de ces surfaces n'est atteignable. À réintégrer le jour
  // où le flag est levé.
  /mandataire/i,
  // Templates système de Brevo (double opt-in, confirmations) — non rédigés
  // par nous, et sans contenu commercial.
  /^Template (par défaut|de confirmation)/i,
];

/**
 * Le texte est extrait du HTML : c'est ce que le destinataire lit, pas ce que
 * l'éditeur a produit. Même principe que l'aplatissement du JSX côté `src/` —
 * un terme coupé par une balise (« clé <b>en main</b> ») échapperait à une
 * lecture naïve.
 */
function texteLisible(html) {
  return (html ?? "")
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const apiKey = process.env.BREVO_API_KEY;
if (!apiKey) {
  console.error("✗ BREVO_API_KEY absente — impossible de lire les templates.");
  console.error("  Renseigner .env.local, ou lancer depuis un environnement qui la porte.");
  process.exit(1);
}

const res = await fetch(`${API}?limit=100&sort=asc`, { headers: { "api-key": apiKey } });
if (!res.ok) {
  console.error(`✗ Brevo a refusé la requête (${res.status}) : ${await res.text()}`);
  process.exit(1);
}

const { templates = [] } = await res.json();
const infractions = [];
let controles = 0;

for (const t of templates) {
  /* Un template inactif ne part à personne. Le contrôler ferait échouer le
     garde-fou sur des brouillons abandonnés, et on finirait par ne plus le
     lancer — c'est ainsi qu'un contrôle meurt. */
  if (!t.isActive) continue;
  if (EXCLUS.some((motif) => motif.test(t.name ?? ""))) continue;

  controles++;
  const texte = `${t.subject ?? ""} ${texteLisible(t.htmlContent)}`;

  for (const { mot, libelle } of PROSCRITS) {
    /* Mêmes limites Unicode que le contrôle des fichiers : `\b` ne connaît que
       l'ASCII, et « rentabilité. » lui échappe silencieusement. */
    const motif = new RegExp(`(?<![\\p{L}\\p{N}])${mot}(?![\\p{L}\\p{N}])`, "giu");
    for (const m of texte.matchAll(motif)) {
      infractions.push({
        id: t.id,
        nom: t.name,
        terme: libelle,
        extrait: texte.slice(Math.max(0, m.index - 60), m.index + m[0].length + 60).trim(),
      });
    }
  }
}

if (infractions.length === 0) {
  console.log(`✓ Vocabulaire conforme (ADR-029) — ${controles} template(s) actif(s) contrôlé(s).`);
  process.exit(0);
}

console.error(
  `✗ ${infractions.length} occurrence(s) de vocabulaire proscrit dans les templates Brevo ` +
    `(${controles} contrôlés) :\n`,
);
for (const { id, nom, terme, extrait } of infractions) {
  console.error(`  template ${id} — ${nom}  « ${terme} »`);
  console.error(`    …${extrait}…\n`);
}
console.error("⚠ Ces textes ne sont PAS dans le dépôt : ils se corrigent dans le");
console.error("  dashboard Brevo. Aucun commit ne les changera.");
console.error("Vocabulaire imposé : studio de jardin (premium / d'exception),");
console.error("unité, hébergement, annexe, espace supplémentaire, prêt à vivre.");
console.error("Accord au MASCULIN. Voir ADR-029 § Amendement du 2026-08-19.");
process.exit(1);
