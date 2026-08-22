/**
 * Générateur des templates Brevo — HTML versionné.
 *
 * Pourquoi ce script existe : le 2026-08-22, le template Brevo n°9
 * (`BREVO_TEMPLATE_RECAP`) a été écrasé dans le dashboard par le corps du
 * template CONTACT. Aucune copie n'existait ailleurs, et le récapitulatif de
 * configuration était donc **définitivement perdu** — quatre routes envoyaient
 * un email de confirmation de contact à la place.
 *
 * Un template qui ne vit que dans un dashboard n'a pas de filet : une fausse
 * manœuvre est irréversible et invisible jusqu'au premier envoi. Le HTML est
 * désormais produit ici et commité dans `docs/emails/`. Le dashboard reste la
 * copie servante ; ce dépôt garde la copie de référence.
 *
 * Usage : node scripts/build-email-brevo.mjs            (génère le HTML)
 *         node scripts/build-email-brevo.mjs --push     (écrit le récap)
 *         node scripts/build-email-brevo.mjs --push-all (écrit les deux)
 *
 * ⚠ Écrire dans Brevo écrase le template sans historique — c'est exactement
 *   l'accident du 2026-08-22. `--push` se limite donc au **récap**, dont le
 *   contenu est déjà perdu et qui n'a rien à préserver. Le template contact
 *   fonctionne : il demande `--push-all`, explicite, pour être touché.
 *   Identifiants lus dans `.env.local`.
 */

import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..");

/* Charte reprise de `docs/arko-email-studio.tsx`, l'outil de maquette. */
const C = {
  bg: "#f4f4f0", white: "#ffffff", info: "#f8f8f5", main: "#1a1a18",
  body: "#3a3a38", subtle: "#888", footer: "#aaa", sep: "#e8e8e4",
};
const SF = "Georgia,Times New Roman,serif";
const SS = "Arial,Helvetica,sans-serif";

const lbl = `font-family:${SS};font-size:10px;letter-spacing:2.5px;color:${C.subtle};text-transform:uppercase;margin:0 0 6px;`;
const val = `font-family:${SF};font-size:15px;color:${C.main};margin:0;line-height:1.4;`;
const blockSt = `background-color:${C.info};padding:15px 18px;border-left:3px solid ${C.main};`;

/** Placeholder Jinja2 du dashboard Brevo. */
const p = (k) => `{{ params.${k} }}`;
/** Section conditionnelle — n'apparaît que si le paramètre est renseigné. */
const si = (k, contenu) => `\n{% if params.${k} %}${contenu}{% endif %}\n`;

const esp = (h = 20) =>
  `<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="height:${h}px;line-height:${h}px;font-size:${h}px;">&nbsp;</td></tr></table>`;

const bloc = (libelle, valeur) => `
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:0 40px 13px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="${blockSt}">
<p style="${lbl}">${libelle}</p><p style="${val}">${valeur}</p>
</td></tr></table></td></tr></table>`;

const blocProse = (libelle, valeur) => `
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:0 40px 13px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="${blockSt}">
<p style="${lbl}">${libelle}</p><p style="font-family:${SS};font-size:13px;color:${C.body};margin:0;line-height:1.65;">${valeur}</p>
</td></tr></table></td></tr></table>`;

const deuxCol = (l1, v1, l2, v2) => `
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:0 40px 12px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td width="50%" style="padding-right:6px;vertical-align:top;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="${blockSt}"><p style="${lbl}">${l1}</p><p style="${val}">${v1}</p></td></tr></table></td>
<td width="50%" style="padding-left:6px;vertical-align:top;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="${blockSt}"><p style="${lbl}">${l2}</p><p style="${val}">${v2}</p></td></tr></table></td>
</tr></table></td></tr></table>`;

const montant = (libelle, valeur) => `
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:0 40px 13px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-top:2px solid ${C.main};padding:18px 22px;background-color:${C.info};">
<p style="${lbl}">${libelle}</p>
<p style="font-family:${SF};font-size:22px;font-weight:700;color:${C.main};margin:0;">${valeur}</p>
</td></tr></table></td></tr></table>`;

const titreSection = (txt) => `
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:0 40px 12px;">
<p style="font-family:${SS};font-size:10px;letter-spacing:2.5px;color:${C.subtle};text-transform:uppercase;margin:0;border-bottom:1px solid ${C.sep};padding-bottom:10px;">${txt}</p>
</td></tr></table>`;

const entete = `
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:32px 40px 0;">
<img src="https://affinityhousefactory.com/images/howner-logo.png" width="34" height="44" alt="Howner" style="display:block;margin-bottom:10px;">
<p style="margin:0 0 3px;font-family:${SF};font-size:18px;font-weight:400;color:${C.main};letter-spacing:-0.2px;">Howner</p>
<p style="margin:0;font-family:${SS};font-size:10px;letter-spacing:3px;color:${C.subtle};text-transform:uppercase;">By Affinity House Factory</p>
</td></tr></table>`;

const h1 = (txt) => `
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:24px 40px 0;">
<h1 style="font-family:${SF};font-size:24px;font-weight:400;color:${C.main};margin:0;line-height:1.2;letter-spacing:-0.3px;">${txt}</h1>
</td></tr></table>`;

const lienPied = `color:${C.footer};font-family:${SS};font-size:10px;text-decoration:underline;`;

const pied = (mentionFinale) => `
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:24px 40px 40px;">
<hr style="border:none;border-top:1px solid ${C.sep};margin:0 0 18px;">
<p style="font-family:${SS};font-size:11px;color:${C.footer};margin:0 0 3px;">Affinity House Factory &mdash; <a href="https://affinityhousefactory.com" style="color:${C.footer};text-decoration:none;">affinityhousefactory.com</a></p>
<p style="font-family:${SS};font-size:11px;color:${C.footer};margin:0 0 3px;">Howner &mdash; une marque de Affinity House Factory.</p>
<p style="font-family:${SS};font-size:11px;color:${C.footer};margin:0 0 16px;">${mentionFinale}</p>
<hr style="border:none;border-top:1px solid ${C.sep};margin:0 0 14px;">
<p style="font-family:${SS};font-size:10px;color:${C.footer};margin:0;line-height:2;letter-spacing:0.2px;">
<a href="{{ unsubscribe_link }}" style="${lienPied}">Se d&eacute;sinscrire</a>
<span style="color:${C.sep};padding:0 8px;">&middot;</span>
<a href="{{ update_profile }}" style="${lienPied}">G&eacute;rer mes pr&eacute;f&eacute;rences</a>
<span style="color:${C.sep};padding:0 8px;">&middot;</span>
<a href="https://affinityhousefactory.com/compte/supprimer" style="${lienPied}">Supprimer mon compte</a>
</p>
</td></tr></table>`;

const enveloppe = (interieur) => `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:${C.bg};">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${C.bg};padding:36px 16px;">
<tr><td align="center">
<table cellpadding="0" cellspacing="0" border="0" style="background-color:${C.white};width:100%;max-width:560px;">
<tr><td>${interieur}</td></tr>
</table></td></tr></table>
</body></html>`;

const para = (txt, bas = 0) =>
  `<p style="font-family:${SS};font-size:14px;color:${C.body};line-height:1.65;margin:0 0 ${bas}px;">${txt}</p>`;

/* ── Template CONTACT (n°10) — paramètres en minuscules ─────────────────── */
function contact() {
  return enveloppe(`
${entete}
${h1("Votre message<br>a bien &eacute;t&eacute; re&ccedil;u.")}
${esp(20)}
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:0 40px;">
${para(`Bonjour <strong style="color:${C.main};">${p("prenom")} ${p("nom")}</strong>,`, 6)}
${para("Nous avons bien re&ccedil;u votre message et reviendrons vers vous sous 24&nbsp;h ouvr&eacute;es.")}
</td></tr></table>
${esp(22)}
${si("produit_label", bloc("MOD&Egrave;LE CONCERN&Eacute;", p("produit_label")))}
${bloc("VOTRE MESSAGE", `<em style="font-family:${SF};font-size:14px;color:${C.body};line-height:1.7;font-style:italic;">${p("message")}</em>`)}
${pied("Cet email confirme la r&eacute;ception de votre demande.")}`);
}

/* ── Template RÉCAP (n°9) — paramètres en MAJUSCULES ────────────────────────
   Servi par quatre routes, d'où les sections conditionnelles : chacune
   n'envoie qu'une partie des paramètres, et une section sans donnée doit
   disparaître plutôt que s'afficher vide.
     · /api/configurateur/reservation  → réservation + studio + terrain
     · /api/reservation (v1)           → idem, tunnel historique
     · /api/recherche-terrain          → recherche de terrain
     · /api/admin/leads/[id]/recap-client → studio, renvoi manuel depuis le CRM

   Vocabulaire ADR-029 : « studio de jardin », jamais « maison » — y compris
   dans les noms de paramètres, qu'un jour quelqu'un relira. */
function recap() {
  const reservation = `
${esp(8)}
${titreSection("VOTRE R&Eacute;SERVATION")}
${esp(8)}
${bloc("NUM&Eacute;RO R&Eacute;SERV&Eacute;", `N&deg;&nbsp;${p("NUMERO")} &mdash; s&eacute;rie limit&eacute;e &agrave; 6 unit&eacute;s`)}
${si("RESERVATION_TTC", bloc("ACOMPTE DE R&Eacute;SERVATION", `${p("RESERVATION_TTC")} &mdash; remboursable`))}
${si("SOUS_CONDITION", blocProse("&Agrave; CONFIRMER", p("SOUS_CONDITION")))}`;

  const studio = `
${esp(8)}
${titreSection("VOTRE STUDIO DE JARDIN")}
${esp(8)}
${bloc("MOD&Egrave;LE", p("MODELE"))}
${si("STUDIO_TTC", bloc("STUDIO TTC", p("STUDIO_TTC")))}
${deuxCol("BARDAGE EXT&Eacute;RIEUR", p("BARDAGE"), "AMBIANCE INT&Eacute;RIEURE", p("INTERIEUR"))}
${si("TERRASSE", bloc("TERRASSE", `${p("TERRASSE")}${si("TERRASSE_TTC", ` &mdash; ${p("TERRASSE_TTC")}`)}`))}
${si("OPTIONS_LABELS", blocProse("OPTIONS", `${p("OPTIONS_LABELS")}${si("OPTIONS_TTC", ` &mdash; ${p("OPTIONS_TTC")}`)}`))}
${si("LIVRAISON", bloc("LIVRAISON ET POSE", p("LIVRAISON")))}
${si("TERRAIN", bloc("TERRAIN", p("TERRAIN")))}
${si("TOTAL_ESTIME", montant("ESTIMATION TOTALE TTC", p("TOTAL_ESTIME")))}
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:0 40px 13px;">
<p style="font-family:${SS};font-size:11px;color:${C.subtle};margin:0;line-height:1.6;">Estimation indicative, non contractuelle. Prix TTC, TVA&nbsp;20&nbsp;%. Seul le devis sign&eacute; apr&egrave;s visite technique fait foi. Les raccordements aux r&eacute;seaux, les fondations et les travaux de terrain ne sont pas compris.</p>
</td></tr></table>`;

  const terrainTeste = `
${esp(8)}
${titreSection("VOTRE TERRAIN")}
${esp(8)}
${si("PLU_ADRESSE", bloc("ADRESSE", p("PLU_ADRESSE")))}
${si("PLU_PARCELLE", deuxCol("PARCELLE", p("PLU_PARCELLE"), "ZONE PLU", p("PLU_ZONE")))}
${si("PLU_TYPEDOC", bloc("DOCUMENT D&rsquo;URBANISME", `${p("PLU_TYPEDOC")}${si("PLU_DATAPPRO", ` &mdash; ${p("PLU_DATAPPRO")}`)}`))}
${si("PLU_PRESCRIPTIONS", blocProse("PRESCRIPTIONS", p("PLU_PRESCRIPTIONS")))}
${si("PLU_SERVITUDES", blocProse("SERVITUDES", p("PLU_SERVITUDES")))}
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:0 40px 13px;">
<p style="font-family:${SS};font-size:11px;color:${C.subtle};margin:0;line-height:1.6;">Pr&eacute;-analyse indicative. Votre parcelle est &eacute;tudi&eacute;e par nos soins, &agrave; la main, avant la visite technique.</p>
</td></tr></table>`;

  const rechercheTerrain = `
${esp(8)}
${titreSection("RECHERCHE DE TERRAIN")}
${esp(8)}
${bloc("PACK", p("PACK_LABEL"))}
${si("ZONES", blocProse("ZONES / COMMUNES", p("ZONES")))}
${si("BUDGET", bloc("BUDGET TERRAIN", p("BUDGET")))}`;

  const coordonnees = `
${esp(8)}
${titreSection("VOS COORDONN&Eacute;ES")}
${esp(8)}
${deuxCol("NOM", p("NOM"), "EMAIL", p("EMAIL"))}
${si("TEL", bloc("T&Eacute;L&Eacute;PHONE", p("TEL")))}
${si("ADRESSE", bloc("ADRESSE", `${p("ADRESSE")}${si("CP_VILLE", `<br>${p("CP_VILLE")}`)}`))}`;

  return enveloppe(`
${entete}
${h1("R&eacute;capitulatif<br>de votre demande.")}
${esp(20)}
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:0 40px;">
${para(`Bonjour <strong style="color:${C.main};">${p("PRENOM")} ${p("NOM")}</strong>,`, 6)}
${para("Voici le r&eacute;capitulatif de votre demande. Notre conseiller vous rappelle sous 48&nbsp;h ouvr&eacute;es pour confirmer votre configuration et pr&eacute;parer l&rsquo;&eacute;tude de votre terrain.")}
</td></tr></table>
${esp(24)}
${si("NUMERO", reservation)}
${si("MODELE", studio)}
${si("PLU_ADRESSE", terrainTeste)}
${si("PACK_LABEL", rechercheTerrain)}
${coordonnees}
${si("GRILLE_VERSION", `
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:0 40px 13px;">
<p style="font-family:${SS};font-size:10px;color:${C.footer};margin:0;">Grille tarifaire ${p("GRILLE_VERSION")}</p>
</td></tr></table>`)}
${pied("Cet email r&eacute;capitule votre demande. Il ne vaut pas contrat.")}`);
}

/* ── Sortie ─────────────────────────────────────────────────────────────── */
const SORTIES = [
  { fichier: "docs/emails/brevo-09-recap.html", html: recap(), envVar: "BREVO_TEMPLATE_RECAP", nom: "récap" },
  { fichier: "docs/emails/brevo-10-contact.html", html: contact(), envVar: "BREVO_TEMPLATE_CONTACT", nom: "contact" },
];

for (const s of SORTIES) {
  writeFileSync(join(RACINE, s.fichier), s.html, "utf8");
  console.log(`✓ ${s.fichier} (${s.html.length} caractères)`);
}

const push = process.argv.includes("--push");
const pushAll = process.argv.includes("--push-all");
if (!push && !pushAll) {
  console.log("\nHTML généré. `--push` pour écrire le récap dans Brevo.");
  process.exit(0);
}
const aPousser = pushAll ? SORTIES : SORTIES.filter((s) => s.nom === "récap");

/* Lecture de `.env.local` — les valeurs Vercel sont chiffrées et non
   rapatriables ; le fichier local est la seule source d'identifiants. */
const envPath = join(RACINE, ".env.local");
if (!existsSync(envPath)) {
  console.error("✗ .env.local introuvable — impossible de pousser.");
  process.exit(1);
}
const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trimStart().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, "")];
    }),
);

for (const s of aPousser) {
  const id = env[s.envVar];
  if (!id) {
    console.error(`✗ ${s.envVar} absent de .env.local — template ${s.nom} non poussé.`);
    continue;
  }
  const r = await fetch(`https://api.brevo.com/v3/smtp/templates/${id}`, {
    method: "PUT",
    headers: { "api-key": env.BREVO_API_KEY, "content-type": "application/json" },
    body: JSON.stringify({ htmlContent: s.html }),
  });
  console.log(
    r.ok
      ? `✓ Brevo template ${id} (${s.nom}) mis à jour.`
      : `✗ Brevo template ${id} (${s.nom}) — HTTP ${r.status} ${await r.text()}`,
  );
}
