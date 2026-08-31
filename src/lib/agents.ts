/**
 * Agents immobiliers partenaires — référentiels du domaine (ADR-044).
 *
 * Même règle que `src/lib/crm.ts` pour les leads : tout ce qui est ici ne se
 * redéclare jamais dans un écran. Une valeur dupliquée finit par diverger, et
 * personne ne s'en aperçoit.
 *
 * ⚠ **Un agent n'est pas un lead.** Il n'achète pas un studio, il le prescrit à
 * sa propre clientèle. Les statuts commerciaux d'ADR-035 — « Devis envoyé »,
 * « Paiement réservé », le numéro de série — n'ont aucun sens ici. Décision de
 * Richard, 2026-08-31.
 *
 * ⚠ **Ce n'est pas non plus un mandataire** (ADR-028, suspendu). Un mandataire
 * est un sous-traitant qui cherche des terrains pour Howner ; un agent est une
 * entreprise indépendante qui recommande Howner. Ne rien importer de ce domaine.
 *
 * Ce qui est *commun* aux deux domaines reste dans `crm.ts` et se réemploie tel
 * quel : `SENS_APPEL`, `ISSUES_APPEL`, `etatSuivi()`, `urgence()`, `SLA_JOURS`,
 * `CONSEILLERS`, `dateFr`. Rien n'en est recopié ici.
 */

/* ══════════════════════════════════════════════════════════════════════════ */
/* Statuts de partenariat                                                     */
/* ══════════════════════════════════════════════════════════════════════════ */

/**
 * L'ordre du tableau est le cycle de vie du partenariat, du fichier de
 * prospection au contrat. Les trois derniers (`actif: false`) sont des
 * relations closes ou dormantes : ni relance, ni alerte de silence.
 *
 * `a_contacter` est le défaut — il reprend la valeur que la liste Brevo porte
 * déjà dans son attribut `STATUT_PROSPECTION`, pour que les deux se lisent
 * pareil (ADR-044 §6, écriture en retour).
 *
 * ⚠ `sous_contrat` est posé **comme statut, vide de machinerie**. Aucune
 * colonne `taux_commission` ni `contrat_url` n'existe : une colonne posée un an
 * trop tôt n'est remplie par personne et fait croire que la fonctionnalité
 * existe. Le contrat d'apporteur d'affaires viendra dans sa propre migration,
 * quand son cadre juridique existera (loi Hoguet — alerte ouverte).
 */
export const STATUTS_PARTENARIAT = [
  { id: "a_contacter",      label: "À contacter",      badge: "bg-white/10 text-white/40",        dot: "bg-white/40",  couleur: "#9ca3af", actif: true  },
  { id: "contact_pris",     label: "Contact pris",     badge: "bg-blue-500/20 text-blue-400",     dot: "bg-blue-400",  couleur: "#60a5fa", actif: true  },
  { id: "interesse",        label: "Intéressé",        badge: "bg-[#7469F4]/20 text-[#7469F4]",   dot: "bg-[#7469F4]", couleur: "#7469F4", actif: true  },
  { id: "partenaire",       label: "Partenaire",       badge: "bg-[#e07b28]/20 text-[#e07b28]",   dot: "bg-[#e07b28]", couleur: "#e07b28", actif: true  },
  { id: "sous_contrat",     label: "Sous contrat",     badge: "bg-green-500/20 text-green-400",   dot: "bg-green-400", couleur: "#4ade80", actif: false },
  { id: "inactif",          label: "Inactif",          badge: "bg-white/5 text-white/30",         dot: "bg-white/20",  couleur: "#6b7280", actif: false },
  { id: "ne_pas_contacter", label: "Ne pas recontacter", badge: "bg-red-500/10 text-red-400/60",  dot: "bg-red-400/60", couleur: "#ef4444", actif: false },

  /* Rebut : ni un partenaire, ni un refus. Une ligne d'annuaire erronée, une
     agence fermée, un doublon d'import — des lignes qui ne décrivent personne.
     Retirées du Kanban, où elles fausseraient les compteurs de colonne, mais
     conservées en base et visibles dans la vue tableau. Même arbitrage
     qu'ADR-035 pour `erreur_test_doublon`. */
  { id: "erreur_test_doublon", label: "Erreur / Test / Doublon", badge: "bg-white/5 text-white/30", dot: "bg-white/20", couleur: "#4b5563", actif: false, horsKanban: true },
] as const;

export type StatutPartenariatId = (typeof STATUTS_PARTENARIAT)[number]["id"];
export type StatutPartenariat = (typeof STATUTS_PARTENARIAT)[number];

export function statutPartenariat(id: string | null | undefined): StatutPartenariat {
  return STATUTS_PARTENARIAT.find((s) => s.id === id) ?? STATUTS_PARTENARIAT[0];
}

/** Relation close ou dormante : ni relance, ni alerte de silence. */
export function partenariatClos(id: string | null | undefined): boolean {
  return !statutPartenariat(id).actif;
}

/** Le rebut, pas les relations closes — « Sous contrat » est clos et bien visible. */
export function horsKanbanAgent(id: string | null | undefined): boolean {
  const s = statutPartenariat(id);
  return "horsKanban" in s && s.horsKanban === true;
}

/** Colonnes du Kanban — le cycle, sans le rebut. */
export const STATUTS_PARTENARIAT_KANBAN = STATUTS_PARTENARIAT.filter(
  (s) => !("horsKanban" in s && s.horsKanban),
);

/**
 * Le statut se recopie-t-il chez Brevo, et sous quelle forme (ADR-044 §6) ?
 *
 * Sans cette remontée, le fichier qui sert à cibler les campagnes ignore tout
 * du travail fait au téléphone — et un agent qui a dit non reçoit quand même
 * l'emailing suivant.
 *
 * `blacklister` ne vaut que pour « Ne pas recontacter » : c'est le traitement
 * RGPD correct d'une opposition, et le seul verrou que Brevo respecte sur
 * **toutes** ses campagnes.
 */
export function remonteeBrevo(id: string | null | undefined): {
  statutProspection: string;
  blacklister: boolean;
} {
  const s = statutPartenariat(id);
  return { statutProspection: s.label, blacklister: s.id === "ne_pas_contacter" };
}

/* ══════════════════════════════════════════════════════════════════════════ */
/* État du dernier email (lu chez Brevo — ADR-044 §4)                         */
/* ══════════════════════════════════════════════════════════════════════════ */

/**
 * Les événements SMTP de Brevo, du plus faible au plus fort signal.
 *
 * L'ordre compte : c'est lui qui départage quand un même message porte
 * plusieurs événements — un email `delivered` puis `opened` se lit « ouvert ».
 * Les rejets ne sont pas une gradation mais une fin de course, d'où leur
 * `rang` négatif : ils l'emportent toujours.
 */
export const ETATS_EMAIL = [
  { id: "requests",     label: "Envoyé",       rang: 1, badge: "bg-white/10 text-white/50" },
  { id: "delivered",    label: "Délivré",      rang: 2, badge: "bg-blue-500/20 text-blue-400" },
  { id: "opened",       label: "Ouvert",       rang: 3, badge: "bg-[#e07b28]/20 text-[#e07b28]" },
  { id: "clicks",       label: "Cliqué",       rang: 4, badge: "bg-green-500/20 text-green-400" },
  { id: "softBounces",  label: "Rejet temporaire", rang: -1, badge: "bg-yellow-500/20 text-yellow-400" },
  { id: "hardBounces",  label: "Rejet définitif",  rang: -2, badge: "bg-red-500/20 text-red-400" },
  { id: "unsubscribed", label: "Désinscrit",   rang: -3, badge: "bg-red-500/20 text-red-400" },
  { id: "blocked",      label: "Bloqué",       rang: -4, badge: "bg-red-500/20 text-red-400" },
  { id: "spam",         label: "Signalé spam", rang: -5, badge: "bg-red-500/20 text-red-400" },
] as const;

export type EtatEmailId = (typeof ETATS_EMAIL)[number]["id"];

export function etatEmail(id: string | null | undefined) {
  return ETATS_EMAIL.find((e) => e.id === id) ?? null;
}

/**
 * Quel état retenir quand un message porte plusieurs événements.
 *
 * Un rejet l'emporte sur tout : savoir qu'un email a été « envoyé » alors qu'il
 * a rebondi est pire que ne rien savoir — on croit avoir communiqué.
 */
export function etatEmailDominant(evenements: (string | null | undefined)[]): EtatEmailId | null {
  let retenu: (typeof ETATS_EMAIL)[number] | null = null;
  for (const ev of evenements) {
    const e = etatEmail(ev);
    if (!e) continue;
    if (!retenu) { retenu = e; continue; }
    /* Un rang négatif gagne contre tout rang positif ; à signe égal, le plus
       éloigné de zéro gagne. */
    const gagne =
      (e.rang < 0 && retenu.rang >= 0) ||
      (e.rang < 0 && retenu.rang < 0 && e.rang < retenu.rang) ||
      (e.rang >= 0 && retenu.rang >= 0 && e.rang > retenu.rang);
    if (gagne) retenu = e;
  }
  return retenu?.id ?? null;
}

/* ══════════════════════════════════════════════════════════════════════════ */
/* Brevo — la liste qui sert de vivier                                        */
/* ══════════════════════════════════════════════════════════════════════════ */

/**
 * Liste Brevo « Agents » — le fichier de prospection, jamais copié en base.
 *
 * Surchargeable sans redéploiement, comme les conseillers et les grilles du
 * configurateur. Repli codé sur `9` : contrairement aux identifiants de
 * template, se tromper de liste ne fait rien partir — au pire le vivier est
 * vide, ce qui se voit immédiatement.
 */
export const BREVO_LIST_AGENTS = Number(process.env.NEXT_PUBLIC_BREVO_LIST_AGENTS ?? 9) || 9;

/**
 * Attributs Brevo d'un contact de cette liste, et leur destination dans la
 * fiche. Écrit ici plutôt qu'inline dans l'écran de reprise : le jour où un
 * import ajoute une colonne, c'est le seul endroit à toucher.
 */
export const ATTRIBUTS_BREVO = {
  AGENCE_OU_ENSEIGNE: "agence",
  PRENOM: "prenom",
  NOM: "nom",
  JOB_TITLE: "fonction",
  SMS: "tel",
  LANDLINE_NUMBER: "tel_fixe",
  ADRESSE: "adresse",
  CODE_POSTAL: "code_postal",
  COMMUNE: "commune",
  DEPARTEMENT: "departement",
  SIREN: "siren",
  SIRET: "siret",
  NAF_CIBLE: "naf",
  SITE_WEB: "site_web",
  LINKEDIN: "linkedin",
  SOURCE_CONTACT: "source_contact",
  URL_SOURCE: "url_source",
} as const satisfies Record<string, string>;
