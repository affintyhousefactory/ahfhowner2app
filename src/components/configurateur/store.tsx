"use client";

/**
 * État du parcours configurateur v2 (ADR-030).
 *
 * Le parcours n'est plus un stepper mais **une colonne de sections dépliantes**
 * à côté d'une scène collante — arbitrage du 2026-08-01. Il n'y a donc plus
 * d'étape courante : toutes les sections coexistent, l'état ne porte que les
 * choix.
 *
 * Toutes les grilles viennent de `loadConfig()` — jamais de constante lue
 * directement. Le calcul est local : « Le configurateur ne doit pas dépendre
 * d'un appel réseau pour recalculer un prix » (§14).
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  loadConfig,
  getModele,
  optionsPourModele,
  paliersPourModele,
  prixOption,
  transportEur,
  transportPerKm,
  type ConfigurateurConfig,
  type VueInterieure,
  type ModeleId,
  type Option,
  type Palier,
  type PalierId,
  type UsageId,
} from "@/lib/configurateur/config";

/**
 * Ordre des sections. Le studio ouvre le parcours et arrive présélectionnée
 * depuis le menu ; l'implantation et le terrain passent en avant-dernier,
 * juste avant la réservation, là où l'engagement se précise.
 */
export const SECTIONS = [
  { n: 1, cle: "module", titre: "Le studio" },
  /* « Ambiance » → « Bardage extérieur » le 2026-08-20 : le libellé désignait
     mal une rubrique qui ne porte que la peau extérieure, et il devenait
     ambigu dès lors qu'une ambiance intérieure la suit immédiatement. */
  { n: 2, cle: "ambiance", titre: "Bardage extérieur" },
  { n: 3, cle: "interieur", titre: "Ambiance intérieure" },
  { n: 4, cle: "terrasse", titre: "Terrasse" },
  { n: 5, cle: "options", titre: "Options" },
  { n: 6, cle: "terrain", titre: "Votre situation terrain" },
  /* L'adresse quitte la section « situation terrain » le 2026-08-20 : la
     pré-analyse y déployait zonage, distance, transport et avertissements sous
     le choix d'implantation, et l'ensemble devenait illisible. Deux questions
     distinctes — où l'on implante, puis où se trouve le terrain — méritent deux
     sections. */
  { n: 7, cle: "adresse", titre: "Adresse du terrain" },
  { n: 8, cle: "reservation", titre: "Réserver un numéro" },
  /* Les coordonnées quittent la réservation le 2026-08-20 : choisir un numéro
     et se présenter sont deux gestes différents, et le récapitulatif de prix
     qui les séparait obligeait à le traverser pour passer de l'un à l'autre.
     Ce récapitulatif vit désormais au pied du parcours, où il explique le total
     affiché juste à côté. */
  { n: 9, cle: "coordonnees", titre: "Vos coordonnées" },
] as const;

/** Verdict de la pré-analyse. `null` = aucune adresse analysée. */
export type Eligibilite = "ok" | "ineligible" | null;

export type Contact = {
  prenom: string;
  nom: string;
  tel: string;
  email: string;
  /* Adresse postale du contact — celle du devis, pas nécessairement celle du
     terrain. Les deux coïncident souvent, d'où la case de report. */
  adresse: string;
  cp: string;
  ville: string;
};

/**
 * Un élément manquant : son libellé pour l'utilisateur, et l'identifiant du
 * champ à mettre au premier plan. `ancre` sert au focus — un avertissement qui
 * dit ce qui manque sans emmener au bon endroit fait deviner l'utilisateur.
 */
export type Manque = {
  cle:
    | "numero"
    | "prenom"
    | "nom"
    | "adresse_postale"
    | "cp"
    | "ville"
    | "tel"
    | "email"
    | "cgv";
  libelle: string;
  ancre: string;
};

export type PreAnalyse = {
  adresse: string;
  zone: string | null;
  parcelle: string | null;
  distanceKm: number | null;
};

type Ctx = {
  cfg: ConfigurateurConfig;

  usage: UsageId | null;
  setUsage: (u: UsageId) => void;
  /** Branche fermée : ni prix, ni adresse, ni réservation. */
  brancheFermee: boolean;

  quantite: number;
  setQuantite: (n: number) => void;
  devisDedie: boolean;

  modele: ModeleId;
  setModele: (m: ModeleId) => void;
  ambiance: string;
  setAmbiance: (a: string) => void;
  ambianceInterieure: string;
  setAmbianceInterieure: (a: string) => void;
  /** Vues intérieures du modèle courant, pour l'ambiance sélectionnée. */
  vuesInterieures: VueInterieure[];
  /** Toutes les ambiances intérieures, vues déjà résolues pour ce modèle. */
  interieurs: { id: string; nom: string; vues: VueInterieure[] }[];
  /** Bardages, rendu déjà résolu pour ce modèle. */
  bardages: { id: string; nom: string; teinte: string; visuel: string }[];
  terrasse: PalierId;
  setTerrasse: (t: PalierId) => void;
  options: string[];
  toggleOption: (id: string) => void;

  preAnalyse: PreAnalyse | null;
  setPreAnalyse: (p: PreAnalyse | null) => void;
  /**
   * Verdict d'éligibilité du terrain, calculé par la pré-analyse.
   * `null` tant qu'aucune adresse n'a été analysée. `"ineligible"` n'interdit
   * pas de réserver : il change la nature de la réservation.
   */
  eligibilite: Eligibilite;
  /**
   * `true` dès qu'une parcelle a été analysée, quel que soit le verdict.
   *
   * Ne pas l'avoir testée n'interdit rien non plus — la réservation part
   * « sous condition ». Le parcours qualifie, il ne filtre pas.
   */
  terrainTeste: boolean;
  setEligibilite: (e: Eligibilite) => void;

  contact: Contact;
  setContact: (champ: keyof Contact, valeur: string) => void;
  optin: boolean;
  setOptin: (v: boolean) => void;
  cgv: boolean;
  setCgv: (v: boolean) => void;

  /**
   * Ce qui manque encore pour réserver, dans l'ordre où le parcours le
   * demande. Vide = la demande peut partir.
   *
   * Calculé ici et non dans la barre de prix : c'est une règle métier, pas une
   * question d'affichage. La barre s'en sert pour son libellé et son motif, la
   * section pour ses messages — une seule source, deux lectures.
   */
  manques: Manque[];

  numero: number | null;
  setNumero: (n: number | null) => void;

  paliers: Palier[];
  optionsDisponibles: Option[];
  optionsStructurelles: Option[];
  optionsLibres: Option[];
  prixBase: number;
  prixTerrasse: number;
  prixOptions: number;
  transport: number | null;
  transportDetailPerKm: number;
  total: number;
};

const ConfigCtx = createContext<Ctx | null>(null);

export function ConfigurateurProvider({
  children,
  modeleInitial = "max",
}: {
  children: ReactNode;
  /** Présélection depuis le menu « Nos Studios » (`?produit=one|max`). */
  modeleInitial?: ModeleId;
}) {
  const cfg = useMemo(() => loadConfig(), []);

  const [usage, setUsage] = useState<UsageId | null>(null);
  const [quantite, setQuantite] = useState(1);
  const [modele, setModeleState] = useState<ModeleId>(modeleInitial);
  const [ambiance, setAmbiance] = useState<string>(cfg.ambiances[0].id);
  const [ambianceInterieure, setAmbianceInterieure] = useState<string>(
    cfg.ambiancesInterieures[0].id,
  );
  const [terrasse, setTerrasse] = useState<PalierId>("sans");
  const [options, setOptions] = useState<string[]>([]);
  const [preAnalyse, setPreAnalyse] = useState<PreAnalyse | null>(null);
  const [numero, setNumero] = useState<number | null>(null);
  const [eligibilite, setEligibilite] = useState<Eligibilite>(null);
  const [contact, setContactState] = useState<Contact>({
    prenom: "",
    nom: "",
    tel: "",
    email: "",
    adresse: "",
    cp: "",
    ville: "",
  });
  const [optin, setOptin] = useState(false);
  const [cgv, setCgv] = useState(false); // jamais pré-cochée (§7)

  const setContact = useCallback((champ: keyof Contact, valeur: string) => {
    setContactState((prev) => ({ ...prev, [champ]: valeur }));
  }, []);

  /* Changer de studio purge les options devenues incompatibles : le poêle
     n'existe pas sur l'Arko One, et une option fantôme fausserait le total. */
  const setModele = useCallback(
    (m: ModeleId) => {
      setModeleState(m);
      const dispo = optionsPourModele(cfg, m).map((o) => o.id);
      setOptions((prev) => prev.filter((id) => dispo.includes(id)));
    },
    [cfg],
  );

  const toggleOption = useCallback((id: string) => {
    setOptions((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const value = useMemo<Ctx>(() => {
    const m = getModele(cfg, modele);
    const paliers = paliersPourModele(cfg, modele);
    const optionsDisponibles = optionsPourModele(cfg, modele);

    const prixBase = m.prixBaseTtc;
    const prixTerrasse = paliers.find((p) => p.id === terrasse)?.prixTtc ?? 0;
    const prixOptions = optionsDisponibles
      .filter((o) => options.includes(o.id))
      .reduce((s, o) => s + prixOption(o, modele), 0);
    const transport = transportEur(preAnalyse?.distanceKm ?? null, m);

    const usageDef = cfg.usages.find((u) => u.id === usage);
    const seuil = usageDef?.seuilDevisDedie;

    /* Un email « valide » se vérifie côté serveur ; ici on ne fait que
       distinguer une saisie commencée d'une saisie plausible, pour ne pas
       laisser partir une demande injoignable. Le parcours ne doit pas se
       transformer en contrôle de conformité. */
    const emailPlausible = /.+@.+\..{2,}/.test(contact.email.trim());
    /* Indicatif international compris : `PhoneInput` produit `+33…`. On exige
       une longueur minimale, pas un format national. */
    const telPlausible = contact.tel.replace(/\D/g, "").length >= 8;

    const manques: Manque[] = [];
    if (numero == null) manques.push({ cle: "numero", libelle: "choisir un numéro de série", ancre: "cfg-numeros" });
    /* ⚠ Le test d'éligibilité du terrain **ne bloque pas** la réservation
       (décision de Richard, 2026-08-20). Un visiteur qui ne connaît pas encore
       sa parcelle, dont le terrain sort du référentiel, ou que la pré-analyse
       ne sait pas traiter, doit pouvoir réserver et être rappelé — sans quoi
       le parcours retient un prospect au lieu de le qualifier. Terrain non
       testé ou jugé non éligible mènent au même endroit : une réservation
       « sous condition », dont le libellé du bouton dit la nature. */
    if (!contact.prenom.trim()) manques.push({ cle: "prenom", libelle: "votre prénom", ancre: "cfg-prenom" });
    if (!contact.nom.trim()) manques.push({ cle: "nom", libelle: "votre nom", ancre: "cfg-nom" });
    if (!contact.adresse.trim()) manques.push({ cle: "adresse_postale", libelle: "votre adresse", ancre: "cfg-adresse-postale" });
    if (!/^\d{5}$/.test(contact.cp.trim())) manques.push({ cle: "cp", libelle: "votre code postal", ancre: "cfg-cp" });
    if (!contact.ville.trim()) manques.push({ cle: "ville", libelle: "votre ville", ancre: "cfg-ville" });
    if (!telPlausible) manques.push({ cle: "tel", libelle: "votre téléphone", ancre: "cfg-tel" });
    if (!emailPlausible) manques.push({ cle: "email", libelle: "votre email", ancre: "cfg-email" });
    if (!cgv) manques.push({ cle: "cgv", libelle: "accepter les CGV", ancre: "cfg-cgv" });

    return {
      cfg,
      usage,
      setUsage,
      brancheFermee: usage === "logement_nu",
      quantite,
      setQuantite,
      devisDedie: Boolean(seuil && quantite >= seuil),
      modele,
      setModele,
      ambiance,
      setAmbiance,
      ambianceInterieure,
      setAmbianceInterieure,
      /* Résolu ici et non dans la scène : le modèle décide des vues
         disponibles (l'Arko Max a un salon, l'Arko One non), et un composant
         qui irait les chercher lui-même finirait par indexer en dur. */
      vuesInterieures:
        cfg.ambiancesInterieures.find((a) => a.id === ambianceInterieure)?.vues[modele] ?? [],
      bardages: cfg.ambiances.map((a) => ({
        id: a.id,
        nom: a.nom,
        teinte: a.teinte,
        visuel: a.visuel[modele],
      })),
      interieurs: cfg.ambiancesInterieures.map((a) => ({
        id: a.id,
        nom: a.nom,
        vues: a.vues[modele] ?? [],
      })),
      terrasse,
      setTerrasse,
      options,
      toggleOption,
      preAnalyse,
      setPreAnalyse,
      terrainTeste: Boolean(preAnalyse?.adresse || preAnalyse?.parcelle),
      eligibilite,
      setEligibilite,
      contact,
      setContact,
      optin,
      setOptin,
      cgv,
      setCgv,
      manques,
      numero,
      setNumero,
      paliers,
      optionsDisponibles,
      optionsStructurelles: optionsDisponibles.filter((o) => o.structurelle),
      optionsLibres: optionsDisponibles.filter((o) => !o.structurelle),
      prixBase,
      prixTerrasse,
      prixOptions,
      transport,
      transportDetailPerKm: transportPerKm(m),
      total: prixBase + prixTerrasse + prixOptions + (transport ?? 0),
    };
  }, [cfg, usage, quantite, modele, setModele, ambiance, ambianceInterieure, terrasse, options, toggleOption, preAnalyse, numero, eligibilite, contact, setContact, optin, cgv]);

  return <ConfigCtx.Provider value={value}>{children}</ConfigCtx.Provider>;
}

export function useConfigurateur(): Ctx {
  const c = useContext(ConfigCtx);
  if (!c) throw new Error("useConfigurateur doit être utilisé dans <ConfigurateurProvider>");
  return c;
}

export const eur = (n: number) => `${n.toLocaleString("fr-FR")} €`;
