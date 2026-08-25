/**
 * CRM interne — source unique des référentiels du portail `/admin` (ADR-035).
 *
 * Les huit statuts commerciaux étaient déclarés en trois endroits, avec des
 * libellés et des couleurs qui divergeaient déjà. Même raison qu'ADR-029 pour
 * le vocabulaire : une valeur dupliquée finit par diverger, et personne ne s'en
 * aperçoit. Tout ce qui suit se lit ici, jamais dans un écran.
 *
 * ⚠ Ne pas confondre `responsable` (conseiller AHF, ce fichier) avec
 * `mandataire_id` (domaine suspendu, ADR-028). Ce sont deux notions sans
 * rapport ; la seconde n'est pas réactivée par la première.
 */

import type { EtatNumero } from "@/lib/configurateur/numeros";
import {
  loadConfig,
  optionsPourModele,
  paliersPourModele,
  prixOption,
  type ModeleId,
} from "@/lib/configurateur/config";

/* ══════════════════════════════════════════════════════════════════════════ */
/* Statuts commerciaux                                                        */
/* ══════════════════════════════════════════════════════════════════════════ */

/**
 * L'ordre de ce tableau est l'avancement commercial, du premier contact à la
 * clôture. Les deux derniers (`actif: false`) sont des affaires closes.
 *
 * `paiement_reserve` (ex-`chaud`, renommé le 2026-08-04 — ADR-035 § Amendement)
 * n'est **pas une appréciation du conseiller** : il constate un fait comptable,
 * l'encaissement de la réservation du numéro de série. Il a vocation à être
 * **synchronisé depuis Pennylane** (MCP/API) plutôt que posé à la main ; d'ici
 * là il reste saisissable dans la fiche. Le connecteur fera l'objet de son
 * propre ADR — c'est une dépendance externe.
 */
export const STATUTS_COMMERCIAUX = [
  { id: "nouveau",       label: "Nouveau",       badge: "bg-white/10 text-white/40",             dot: "bg-white/40",    couleur: "#9ca3af", actif: true  },
  { id: "a_rappeler",    label: "À rappeler",    badge: "bg-blue-500/20 text-blue-400",          dot: "bg-blue-400",    couleur: "#60a5fa", actif: true  },
  { id: "contact_pris",  label: "Contact pris",  badge: "bg-[#7469F4]/20 text-[#7469F4]",        dot: "bg-[#7469F4]",   couleur: "#7469F4", actif: true  },
  { id: "en_discussion", label: "En discussion", badge: "bg-[#e07b28]/20 text-[#e07b28]",        dot: "bg-[#e07b28]",   couleur: "#e07b28", actif: true  },
  { id: "devis_envoye",  label: "Devis envoyé",  badge: "bg-yellow-500/20 text-yellow-400",      dot: "bg-yellow-400",  couleur: "#facc15", actif: true  },
  { id: "paiement_reserve", label: "Paiement réservé", badge: "bg-teal-500/20 text-teal-300",    dot: "bg-teal-300",    couleur: "#2dd4bf", actif: true  },
  { id: "signe",         label: "Signé",         badge: "bg-green-500/20 text-green-400",        dot: "bg-green-400",   couleur: "#4ade80", actif: false },
  { id: "perdu",         label: "Non retenu",    badge: "bg-red-500/10 text-red-400/60",         dot: "bg-red-400/60",  couleur: "#6b7280", actif: false },
] as const;

export type StatutCommercialId = (typeof STATUTS_COMMERCIAUX)[number]["id"];
export type StatutCommercial = (typeof STATUTS_COMMERCIAUX)[number];

export function statutCommercial(id: string | null | undefined): StatutCommercial {
  return STATUTS_COMMERCIAUX.find((s) => s.id === id) ?? STATUTS_COMMERCIAUX[0];
}

/** `actif: false` = affaire close. Ni relance, ni alerte de silence. */
export function estClos(id: string | null | undefined): boolean {
  return !statutCommercial(id).actif;
}

/* ══════════════════════════════════════════════════════════════════════════ */
/* Numéro de série — deux niveaux de prise (ADR-035 § Amendement 2026-08-04)   */
/* ══════════════════════════════════════════════════════════════════════════ */

/**
 * Ce que le statut commercial dit du numéro de série demandé par le lead.
 * Règle métier posée par Richard le 2026-08-04, seule source de vérité :
 *
 * — avant « Devis envoyé » : le numéro **n'est pas pris**. Un lead qui a coché
 *   un numéro dans le configurateur ne l'immobilise pas ; plusieurs peuvent
 *   viser le même. C'est le mode « demandé puis confirmé » d'ADR-030.
 * — « Devis envoyé » : le numéro est **réservé** — retiré des propositions
 *   commerciales, mais toujours sélectionnable côté visiteur (`demande`).
 * — « Paiement réservé » et au-delà : le numéro est **bloqué** pour de bon
 *   (`confirme`), parce que l'argent est encaissé. C'est le seul état qui
 *   décrémente le compteur public.
 * — « Non retenu » relâche le numéro.
 *
 * ⚠ Ceci est le **contrat** ; la table des numéros qui l'appliquera arrive avec
 * ADR-031. Tant qu'elle n'existe pas, rien ne décrémente réellement le stock.
 */
export function etatNumeroPourStatut(id: string | null | undefined): EtatNumero {
  switch (statutCommercial(id).id) {
    case "devis_envoye":
      return "demande";
    case "paiement_reserve":
    case "signe":
      return "confirme";
    default:
      return "libre";
  }
}

/** Le numéro est-il définitivement pris ? (paiement encaissé) */
export function numeroBloque(id: string | null | undefined): boolean {
  return etatNumeroPourStatut(id) === "confirme";
}

/* ══════════════════════════════════════════════════════════════════════════ */
/* Conseillers AHF (« affectation » interne — ADR-035 §1)                     */
/* ══════════════════════════════════════════════════════════════════════════ */

/**
 * Liste surchargeable sans redéploiement par `NEXT_PUBLIC_CRM_CONSEILLERS`
 * (valeurs séparées par des virgules). Même principe que les grilles du
 * configurateur : une liste d'exploitation ne se code pas en dur dans un écran.
 *
 * Le champ reste du texte libre en base : il n'existe pas de table de comptes
 * AHF (l'authentification admin passe par un rôle Supabase, sans profil).
 */
export const CONSEILLERS: string[] = (
  process.env.NEXT_PUBLIC_CRM_CONSEILLERS ?? "Richard,Albert,Accueil"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

/* ══════════════════════════════════════════════════════════════════════════ */
/* Retard — deux définitions, jamais confondues (ADR-035 §2)                  */
/* ══════════════════════════════════════════════════════════════════════════ */

/** Jours de silence au-delà desquels un lead actif est signalé. */
export const SLA_JOURS = Number(process.env.NEXT_PUBLIC_CRM_SLA_JOURS ?? 7) || 7;

export type LeadSuivi = {
  statut_commercial?: string | null;
  created_at: string;
  dernier_appel_at?: string | null;
  prochain_rappel_at?: string | null;
};

export type EtatSuivi = {
  /** Un engagement pris n'a pas été tenu. */
  rappelDepasse: boolean;
  /** Le lead s'éteint faute de contact. */
  silencieux: boolean;
  /**
   * Jours depuis le dernier contact. Un lead jamais appelé compte depuis sa
   * création — sinon les plus négligés seraient les seuls à n'alerter jamais.
   */
  joursSansContact: number;
  /** `true` si le compte part de la création, faute d'appel. */
  jamaisAppele: boolean;
  joursRetardRappel: number | null;
  clos: boolean;
};

const JOUR_MS = 24 * 3600 * 1000;

export function joursDepuis(iso: string | null | undefined, maintenant = Date.now()): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return Math.floor((maintenant - t) / JOUR_MS);
}

export function etatSuivi(lead: LeadSuivi, maintenant = Date.now()): EtatSuivi {
  const clos = estClos(lead.statut_commercial);
  const jamaisAppele = !lead.dernier_appel_at;
  const joursSansContact =
    joursDepuis(lead.dernier_appel_at ?? lead.created_at, maintenant) ?? 0;

  const rappel = lead.prochain_rappel_at ? new Date(lead.prochain_rappel_at).getTime() : null;
  const rappelDepasse = !clos && rappel != null && !Number.isNaN(rappel) && rappel < maintenant;

  return {
    clos,
    jamaisAppele,
    joursSansContact,
    rappelDepasse,
    silencieux: !clos && joursSansContact > SLA_JOURS,
    joursRetardRappel: rappelDepasse && rappel != null ? Math.floor((maintenant - rappel) / JOUR_MS) : null,
  };
}

/** Tri « à traiter en priorité » : rappels dépassés d'abord, silences ensuite. */
export function urgence(e: EtatSuivi): number {
  if (e.clos) return -1;
  return (e.rappelDepasse ? 10_000 + (e.joursRetardRappel ?? 0) : 0) + e.joursSansContact;
}

/* ══════════════════════════════════════════════════════════════════════════ */
/* Journal d'appels (ADR-035 §3)                                              */
/* ══════════════════════════════════════════════════════════════════════════ */

export const SENS_APPEL = [
  { id: "sortant", label: "Appel sortant", icone: "↗" },
  { id: "entrant", label: "Appel entrant", icone: "↙" },
  { id: "note",    label: "Note",          icone: "✎" },
] as const;

export type SensAppel = (typeof SENS_APPEL)[number]["id"];

export const ISSUES_APPEL = [
  { id: "joint",          label: "Joint",           badge: "bg-green-500/20 text-green-400" },
  { id: "repondeur",      label: "Répondeur",       badge: "bg-yellow-500/20 text-yellow-400" },
  { id: "pas_de_reponse", label: "Pas de réponse",  badge: "bg-white/10 text-white/40" },
  { id: "rappel_demande", label: "Rappel demandé",  badge: "bg-blue-500/20 text-blue-400" },
  { id: "refus",          label: "Refus",           badge: "bg-red-500/10 text-red-400/70" },
] as const;

export type IssueAppel = (typeof ISSUES_APPEL)[number]["id"];

export function issueAppel(id: string | null | undefined) {
  return ISSUES_APPEL.find((i) => i.id === id) ?? null;
}

/* ══════════════════════════════════════════════════════════════════════════ */
/* GED Client — pièces attendues (ADR-035 §5)                                 */
/* ══════════════════════════════════════════════════════════════════════════ */

export const ORIGINES_DOC = [
  { id: "ahf",    label: "Déposé par AHF",    court: "AHF" },
  { id: "client", label: "Déposé par le client", court: "Client" },
] as const;

export type OrigineDoc = (typeof ORIGINES_DOC)[number]["id"];

/**
 * Liste des pièces qui constituent un dossier complet. Constante de
 * configuration, pas une donnée : une pièce attendue sans document est une
 * absence, pas une ligne en base.
 *
 * `attenduDe` indique qui doit la fournir — c'est ce qui distingue les pièces
 * que nous proposons au client de celles qu'il doit nous remettre.
 */
export const PIECES_DOSSIER = [
  { id: "piece_identite",       label: "Pièce d'identité",            attenduDe: "client" },
  { id: "justificatif_domicile", label: "Justificatif de domicile",   attenduDe: "client" },
  { id: "titre_propriete",      label: "Titre de propriété / acte",   attenduDe: "client" },
  { id: "plan_parcelle",        label: "Plan de parcelle / cadastre", attenduDe: "client" },
  { id: "photos_terrain",       label: "Photos du terrain",           attenduDe: "client" },
  { id: "financement",          label: "Plan de financement",         attenduDe: "client" },
  { id: "devis",                label: "Devis",                       attenduDe: "ahf" },
  { id: "plans_studio",         label: "Plans du studio",            attenduDe: "ahf" },
  { id: "notice_technique",     label: "Notice technique",            attenduDe: "ahf" },
  { id: "autre",                label: "Autre",                       attenduDe: "ahf" },
] as const;

export type PieceId = (typeof PIECES_DOSSIER)[number]["id"];

export function pieceDossier(id: string | null | undefined) {
  return PIECES_DOSSIER.find((p) => p.id === id) ?? null;
}

/* ══════════════════════════════════════════════════════════════════════════ */
/* Configuration v2 — résolution des libellés (ADR-035 §4)                    */
/* ══════════════════════════════════════════════════════════════════════════ */

export type LeadConfigV2 = {
  cfg_version?: string | null;
  cfg_usage?: string | null;
  cfg_quantite?: number | null;
  cfg_modele?: string | null;
  cfg_ambiance?: string | null;
  /* Ajouté le 2026-08-20 avec la rubrique d'ambiance intérieure du
     configurateur. Le contrat de données doit suivre le parcours : ADR-031
     écrira ce que ce type décrit, et une dimension absente d'ici serait une
     dimension que la soumission oublierait de transmettre. Optionnel, comme
     ses voisines — les leads antérieurs ne la portent pas. */
  cfg_ambiance_interieure?: string | null;
  cfg_terrasse?: string | null;
  cfg_options?: string[] | null;
  cfg_prix_base?: number | null;
  cfg_prix_terrasse?: number | null;
  cfg_prix_options?: number | null;
  cfg_transport?: number | null;
  cfg_total?: number | null;
  slot?: number | null;
};

/**
 * Les libellés ne sont PAS stockés sur le lead : ils sont résolus ici depuis
 * `loadConfig()`, seule source des grilles (ADR-030). Stocker un libellé, c'est
 * le figer — et le voir mentir dès la première correction de la grille.
 *
 * Un identifiant absent de la grille courante (option retirée, ambiance
 * renommée) est restitué tel quel, marqué `inconnu` : mieux vaut un code brut
 * à l'écran qu'une ligne disparue silencieusement.
 */
export function resoudreConfigV2(lead: LeadConfigV2) {
  const cfg = loadConfig();
  const modeleId = (lead.cfg_modele ?? "max") as ModeleId;
  const modele = cfg.modeles.find((m) => m.id === lead.cfg_modele) ?? null;
  const usage = cfg.usages.find((u) => u.id === lead.cfg_usage) ?? null;
  const ambiance = cfg.ambiances.find((a) => a.id === lead.cfg_ambiance) ?? null;
  const ambianceInterieure =
    cfg.ambiancesInterieures.find((a) => a.id === lead.cfg_ambiance_interieure) ?? null;
  const palier = modele
    ? paliersPourModele(cfg, modeleId).find((p) => p.id === lead.cfg_terrasse) ?? null
    : null;

  const dispo = modele ? optionsPourModele(cfg, modeleId) : [];
  const options = (lead.cfg_options ?? []).map((id) => {
    const o = dispo.find((x) => x.id === id);
    return o
      ? { id, label: o.nom, detail: o.detail ?? null, prix: prixOption(o, modeleId), structurelle: o.structurelle, inconnu: false }
      : { id, label: id, detail: null, prix: null, structurelle: false, inconnu: true };
  });

  return {
    versionGrille: lead.cfg_version ?? null,
    versionCourante: cfg.version,
    /** La grille a bougé depuis la configuration : les prix ci-dessous sont ceux du jour J. */
    grillePerimee: Boolean(lead.cfg_version && lead.cfg_version !== cfg.version),
    usage: usage ? { id: usage.id, label: usage.libelle, eligible: usage.eligible } : null,
    quantite: lead.cfg_quantite ?? 1,
    modele: modele ? { id: modele.id, label: modele.nom, surface: modele.surface, emprise: modele.emprise } : null,
    ambiance: ambiance ? { id: ambiance.id, label: ambiance.nom, teinte: ambiance.teinte } : null,
    ambianceInterieure: ambianceInterieure
      ? {
          id: ambianceInterieure.id,
          label: ambianceInterieure.nom,
          teinte: ambianceInterieure.teinte,
        }
      : null,
    /* Un palier absent de la grille courante est **affiché quand même**, avec
       son identifiant brut et `inconnu: true` — même traitement que les options
       depuis toujours. Sans cela, les leads antérieurs à un changement de grille
       perdaient silencieusement leur ligne terrasse à l'écran alors que
       `cfg_prix_terrasse` restait en base. Constaté le 2026-08-25 en passant les
       paliers de « petite/moyenne/grande » à « std/plus » : trois leads
       portaient « moyenne ». */
    terrasse: palier
      ? {
          id: palier.id,
          label: palier.nom,
          prix: palier.prixTtc,
          surfaceM2: palier.surfaceM2 ?? null,
          inconnu: false,
        }
      : lead.cfg_terrasse
        ? {
            id: lead.cfg_terrasse,
            label: lead.cfg_terrasse,
            prix: lead.cfg_prix_terrasse ?? null,
            surfaceM2: null,
            inconnu: true,
          }
        : null,
    options,
    optionsStructurelles: options.filter((o) => o.structurelle),
    optionsLibres: options.filter((o) => !o.structurelle),
    prix: {
      base: lead.cfg_prix_base ?? null,
      terrasse: lead.cfg_prix_terrasse ?? null,
      options: lead.cfg_prix_options ?? null,
      transport: lead.cfg_transport ?? null,
      total: lead.cfg_total ?? null,
    },
    numero: lead.slot ?? null,
  };
}

/** `cfg_version` renseigné = lead issu du configurateur v2 (ADR-035 §4). */
export function estConfigV2(lead: LeadConfigV2): boolean {
  return Boolean(lead.cfg_version);
}

export const eur = (n: number | null | undefined) =>
  n == null ? "—" : `${Number(n).toLocaleString("fr-FR")} €`;

/**
 * Fuseau **épinglé** sur Europe/Paris, et non laissé à l'environnement.
 *
 * Ces formats sont appelés depuis des composants client, donc rendus une
 * première fois sur le serveur : Vercel tourne en UTC, le navigateur en heure
 * de Paris. Sans épinglage, un appel de 00 h 30 s'afficherait la veille côté
 * serveur — décalage d'hydratation, et surtout heure fausse pour un conseiller
 * qui rappelle depuis la France.
 */
const TZ = "Europe/Paris";

export const dateFr = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString("fr-FR", { timeZone: TZ }) : "—";

export const dateHeureFr = (iso: string | null | undefined) =>
  iso
    ? new Date(iso).toLocaleString("fr-FR", {
        timeZone: TZ,
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : "—";
