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
  { n: 7, cle: "reservation", titre: "Réserver un numéro" },
] as const;

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
  terrasse: PalierId;
  setTerrasse: (t: PalierId) => void;
  options: string[];
  toggleOption: (id: string) => void;

  preAnalyse: PreAnalyse | null;
  setPreAnalyse: (p: PreAnalyse | null) => void;

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
  }, [cfg, usage, quantite, modele, setModele, ambiance, ambianceInterieure, terrasse, options, toggleOption, preAnalyse, numero]);

  return <ConfigCtx.Provider value={value}>{children}</ConfigCtx.Provider>;
}

export function useConfigurateur(): Ctx {
  const c = useContext(ConfigCtx);
  if (!c) throw new Error("useConfigurateur doit être utilisé dans <ConfigurateurProvider>");
  return c;
}

export const eur = (n: number) => `${n.toLocaleString("fr-FR")} €`;
