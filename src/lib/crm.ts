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

  /* Rebut : ni un prospect, ni une affaire perdue. Une saisie de test, un
     doublon, une erreur de frappe — des lignes qui existent en base mais ne
     décrivent personne.

     `horsKanban` les retire du tableau de bord : mêlées aux vraies, elles
     faussent les compteurs de colonne, et « Non retenu » ne convenait pas — il
     dit qu'un prospect a dit non, ce qui est une information commerciale.
     Celui-ci dit qu'il n'y a jamais eu de prospect.

     ⚠ Retiré du Kanban, **pas supprimé** : la ligne reste en base et visible
     dans la vue tableau. Un statut qui efface pour de bon n'aurait pas sa place
     dans un menu déroulant qu'on manipule d'une main en parlant au téléphone. */
  { id: "erreur_test_doublon", label: "Erreur / Test / Doublon", badge: "bg-white/5 text-white/30", dot: "bg-white/20", couleur: "#4b5563", actif: false, horsKanban: true },
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

/**
 * Statuts qui ne paraissent pas au Kanban — le rebut, pas les affaires closes.
 *
 * `estClos()` et celui-ci ne se recouvrent pas : « Signé » est clos et bien
 * visible, c'est même la colonne qu'on regarde en premier.
 */
export function horsKanban(id: string | null | undefined): boolean {
  const statut = statutCommercial(id);
  return "horsKanban" in statut && statut.horsKanban === true;
}

/** Colonnes du Kanban — l'ordre d'avancement, sans le rebut. */
export const STATUTS_KANBAN = STATUTS_COMMERCIAUX.filter((s) => !("horsKanban" in s && s.horsKanban));

/* ══════════════════════════════════════════════════════════════════════════ */
/* Sourcing — d'où vient le prospect                                          */
/* ══════════════════════════════════════════════════════════════════════════ */

/**
 * Origine **commerciale** du lead, arrêtée avec Richard le 2026-08-28.
 *
 * ⚠ **À ne pas confondre avec `leads.source`**, qui porte le canal *technique*
 * de création — `configurateur_v2`, `admin` : d'où la ligne a été écrite. Un
 * lead saisi au back-office peut venir d'un fichier de prospection, d'un salon
 * ou d'une recommandation ; trois efforts qui n'ont ni le même coût ni le même
 * rendement, et que `source` confond en un seul « admin ».
 *
 * C'est ce champ qui dira si la prospection téléphonique paie.
 */
export const SOURCINGS = [
  { id: "prospection_tel", numero: 1, label: "Prospection téléphonique", detail: "fichier HPA" },
  { id: "appel_entrant",   numero: 2, label: "Appel entrant",            detail: "le prospect nous appelle" },
  { id: "formulaire_site", numero: 3, label: "Formulaire du site",       detail: "/contact" },
  { id: "configurateur",   numero: 4, label: "Configurateur en ligne",   detail: "demande de numéro" },
  { id: "recommandation",  numero: 5, label: "Recommandation",           detail: "bouche-à-oreille" },
  { id: "salon",           numero: 6, label: "Salon / événement",        detail: "" },
  { id: "reseaux_sociaux", numero: 7, label: "Réseaux sociaux",          detail: "LinkedIn, Instagram" },
  { id: "partenaire",      numero: 8, label: "Partenaire",               detail: "apporteur d'affaires" },
] as const;

export type SourcingId = (typeof SOURCINGS)[number]["id"];

export function sourcing(id: string | null | undefined) {
  return SOURCINGS.find((s) => s.id === id) ?? null;
}

/* ══════════════════════════════════════════════════════════════════════════ */
/* Cibles commerciales                                                        */
/* ══════════════════════════════════════════════════════════════════════════ */

/**
 * Les cinq cibles du script de phoning, dans l'ordre du document.
 *
 * Elles ne sont pas une catégorisation a posteriori : ce sont les cinq
 * populations pour lesquelles une trame d'appel distincte a été écrite —
 * accroche, punch lines, objections propres. Demander la cible à la création du
 * lead, c'est demander **avec quelle trame l'appel a été mené**. D'où le
 * caractère obligatoire : un lead sans cible est un appel dont on ignore ce qui
 * a été dit.
 *
 * ⚠ **Codes NAF rév. 2 (2008)**, vérifiés un à un sur insee.fr le 2026-08-27.
 * La NAF 2025 a beau être publiée, elle ne sert à coder les APE qu'à partir du
 * 1er janvier 2027 : d'ici là, les codes portés par les entreprises — et par
 * les fichiers de prospection — sont ceux-ci. Ils devront être revus à la
 * bascule.
 *
 * Les codes servent au ciblage et au rapprochement avec les fichiers de
 * prospection ; ils ne sont pas exhaustifs et ne valent pas règle : un camping
 * exploité en SCI peut porter un code immobilier. C'est le conseiller qui
 * tranche, la liste l'aide.
 */
export const CIBLES_COMMERCIALES = [
  {
    id: "hpa",
    numero: 1,
    label: "Campings et hôtellerie de plein air",
    court: "Camping / HPA",
    badge: "bg-emerald-500/15 text-emerald-300",
    naf: [{ code: "55.30Z", libelle: "Terrains de camping et parcs pour caravanes ou véhicules de loisirs" }],
  },
  {
    id: "tourisme",
    numero: 2,
    label: "Hôtels, domaines, gîtes et hébergements touristiques",
    court: "Hôtel / tourisme",
    badge: "bg-sky-500/15 text-sky-300",
    naf: [
      { code: "55.10Z", libelle: "Hôtels et hébergement similaire" },
      { code: "55.20Z", libelle: "Hébergement touristique et autre hébergement de courte durée" },
    ],
  },
  {
    id: "medico_social",
    numero: 3,
    label: "EHPAD, résidences services seniors, médico-social",
    court: "Médico-social",
    badge: "bg-violet-500/15 text-violet-300",
    naf: [
      { code: "87.10A", libelle: "Hébergement médicalisé pour personnes âgées" },
      { code: "87.30A", libelle: "Hébergement social pour personnes âgées" },
      { code: "87.10C", libelle: "Hébergement médicalisé pour adultes handicapés et autre hébergement médicalisé" },
      { code: "87.30B", libelle: "Hébergement social pour handicapés physiques" },
    ],
  },
  {
    id: "collectivites",
    numero: 4,
    label: "Collectivités, employeurs et logement des saisonniers",
    court: "Collectivité / employeur",
    badge: "bg-amber-500/15 text-amber-300",
    naf: [
      { code: "84.11Z", libelle: "Administration publique générale" },
      { code: "55.90Z", libelle: "Autres hébergements" },
      { code: "68.20B", libelle: "Location de terrains et d'autres biens immobiliers" },
    ],
  },
  {
    id: "investisseurs",
    numero: 5,
    label: "Particuliers investisseurs disposant de fonds",
    court: "Investisseur",
    badge: "bg-rose-500/15 text-rose-300",
    /* Un particulier n'a pas de code NAF — il n'exerce pas d'activité
       économique enregistrée. Le seul cas où un code apparaît est celui d'une
       société civile immobilière. Écrire ici un code « par défaut » aurait
       rendu la colonne inexploitable pour le ciblage. */
    naf: [{ code: "68.20A", libelle: "Location de logements — seulement si le lead investit via une SCI" }],
  },
] as const;

export type CibleCommercialeId = (typeof CIBLES_COMMERCIALES)[number]["id"];
export type CibleCommerciale = (typeof CIBLES_COMMERCIALES)[number];

export function cibleCommerciale(id: string | null | undefined): CibleCommerciale | null {
  return CIBLES_COMMERCIALES.find((c) => c.id === id) ?? null;
}

/* ── Quel email récapitulatif part ────────────────────────────────────────── */

/** Les sept emails possibles à l'issue d'un appel. */
export type CleEmailRecap = "recap" | "multicfg" | CibleCommercialeId;

/**
 * Quel email pour ce lead — **la règle**, ici et nulle part ailleurs.
 *
 * Deux situations, et une seule d'entre elles connaît un prix.
 *
 * 1. **Une configuration est arrêtée** → le récapitulatif chiffré : modèle,
 *    terrasse, options, transport, total. C'est le document de l'appel.
 * 2. **Rien n'est chiffrable** — modèles encore en balance, ou options hors
 *    grille assujetties à devis complémentaire. Chiffrer reviendrait à
 *    communiquer un prix sur un choix que personne n'a fait, et un prix
 *    communiqué ne se reprend pas. Part alors une **présentation**, choisie sur
 *    la cible du script de phoning : le camping ne lit pas le même argument que
 *    l'EHPAD, et ces cinq emails sont écrits pour ces cinq populations. Sans
 *    cible — cas des leads nés sur le site public, où personne n'a répondu au
 *    téléphone — c'est la présentation générique.
 *
 * ⚠ **La cible ne remplace jamais le récapitulatif chiffré.** Les cinq
 * présentations sectorielles ne portent aucun montant : les servir à un lead
 * dont la configuration est arrêtée priverait le client du chiffrage qu'on
 * vient de lui annoncer au téléphone. Décision de Richard, 2026-08-31.
 *
 * ⚠ **Fonction pure, sans `process.env`.** L'écran d'appel s'en sert pour
 * annoncer au conseiller ce qui partira, et il tourne dans le navigateur ; les
 * identifiants de template, eux, restent côté serveur
 * (`@/shared/lib/recap-client`). La règle est ici, sa traduction en numéro de
 * template est là-bas — jamais l'inverse.
 */
export type ChoixEmailRecap = {
  cle: CleEmailRecap;
  /** Ce que le conseiller lit avant d'envoyer. */
  libelle: string;
  /**
   * L'**objet** de l'email s'ouvre sur la raison sociale — « {Camping des Pins}
   * — on travaille sur vos locatifs ». Sans elle, il commencerait par un tiret :
   * l'écran doit le dire avant l'envoi, pas après.
   */
  objetPorteRaisonSociale: boolean;
  /**
   * L'email annonce combien de numéros de la série restent. Le compte se prend
   * en base au moment de l'envoi : un chiffre faux sur la rareté vaut moins que
   * pas d'email du tout.
   */
  annonceNumerosRestants: boolean;
};

export function choixEmailRecap(lead: {
  multi_configuration?: boolean | null;
  cible_commerciale?: string | null;
}): ChoixEmailRecap {
  const base = { objetPorteRaisonSociale: false, annonceNumerosRestants: false };

  if (!lead.multi_configuration) {
    return { ...base, cle: "recap", libelle: "Récapitulatif chiffré" };
  }

  const cible = cibleCommerciale(lead.cible_commerciale);
  if (!cible) return { ...base, cle: "multicfg", libelle: "Présentation générique" };

  return {
    cle: cible.id,
    libelle: `Présentation — ${cible.label}`,
    /* Quatre cibles sur cinq sont des personnes morales ; la cinquième — les
       particuliers investisseurs — n'a pas de raison sociale, et son email
       ouvre sur la disponibilité de la série au lieu d'un nom. */
    objetPorteRaisonSociale: cible.id !== "investisseurs",
    annonceNumerosRestants: cible.id === "investisseurs",
  };
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
