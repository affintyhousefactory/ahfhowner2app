/**
 * Aperçu local d'un template Brevo — rend le Jinja2 sans rien envoyer.
 *
 * Ne gère que les deux constructions qu'emploient nos templates :
 * `{{ params.X }}` et `{% if params.X %}…{% endif %}`, imbrications comprises.
 * Un moteur Jinja complet serait une dépendance de plus pour relire un email.
 *
 * Usage : node scripts/apercu-email.mjs <fichier.html> > apercu.html
 */

import { readFileSync } from "node:fs";

/** Jeu de valeurs de démonstration — jamais les données d'un lead réel. */
const P = {
  PRENOM: "Camille", NOM: "Duforest", EMAIL: "camille.duforest@example.fr",
  TEL: "06 12 34 56 78", ADRESSE: "14 chemin des Vignes", CP_VILLE: "64200 Biarritz",
  NUMERO: "03", RESERVATION_TTC: "2 500 €",
  SOUS_CONDITION: "Vous n'avez pas testé de terrain — l'éligibilité de votre adresse sera vérifiée lors de l'entretien avec notre conseiller.",
  MODELE: "Arko Max 40 m²", STUDIO_TTC: "109 900 €",
  BARDAGE: "Gris anthracite", INTERIEUR: "Ambiance bois",
  TERRASSE: "Grande terrasse", TERRASSE_TTC: "9 380 €",
  OPTIONS_LABELS: "", OPTIONS_TTC: "",
  LIVRAISON: "À estimer", TERRAIN: "",
  TOTAL_ESTIME: "119 280 €", GRILLE_VERSION: "2026-08-20",
  PLU_ADRESSE: "", PLU_PARCELLE: "", PLU_ZONE: "", PLU_TYPEDOC: "",
  PLU_DATAPPRO: "", PLU_PRESCRIPTIONS: "", PLU_SERVITUDES: "",
  PACK_LABEL: "", ZONES: "", BUDGET: "",
};

/** Rend les `{% if %}` par une pile, pour supporter l'imbrication. */
function rendreConditions(html) {
  const jetons = html.split(/(\{%\s*if\s+params\.[A-Za-z_0-9]+\s*%\}|\{%\s*endif\s*%\})/);
  const pile = [{ texte: "", garde: true }];
  for (const jeton of jetons) {
    const ouvre = jeton.match(/^\{%\s*if\s+params\.([A-Za-z_0-9]+)\s*%\}$/);
    if (ouvre) {
      pile.push({ texte: "", garde: Boolean(P[ouvre[1]]) });
      continue;
    }
    if (/^\{%\s*endif\s*%\}$/.test(jeton)) {
      const bloc = pile.pop();
      if (!bloc) throw new Error("`endif` sans `if`");
      pile[pile.length - 1].texte += bloc.garde ? bloc.texte : "";
      continue;
    }
    pile[pile.length - 1].texte += jeton;
  }
  if (pile.length !== 1) throw new Error("`if` non fermé");
  return pile[0].texte;
}

const fichier = process.argv[2];
if (!fichier) {
  console.error("Usage : node scripts/apercu-email.mjs <fichier.html>");
  process.exit(1);
}
const rendu = rendreConditions(readFileSync(fichier, "utf8")).replace(
  /\{\{\s*params\.([A-Za-z_0-9]+)\s*\}\}/g,
  (_, k) => P[k] ?? "",
).replace(/\{\{\s*(unsubscribe_link|update_profile)\s*\}\}/g, "#");
process.stdout.write(rendu);
