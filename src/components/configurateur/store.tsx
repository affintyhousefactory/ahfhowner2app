"use client";

/**
 * État du parcours configurateur v2 (ADR-030).
 *
 * Toutes les grilles viennent de `loadConfig()` — jamais de constante lue
 * directement. Le calcul est local : « Le configurateur ne doit pas dépendre
 * d'un appel réseau pour recalculer un prix : toutes les grilles sont chargées
 * une fois » (§14).
 *
 * Ne remplace pas `config-store.tsx` tant que l'ancien parcours vit : les deux
 * coexistent le temps de la bascule, puis l'ancien est retiré.
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
  type ModeleId,
  type Option,
  type Palier,
  type PalierId,
  type UsageId,
} from "@/lib/configurateur/config";

/** Écrans du parcours — l'ordre est celui du §3. */
export const ETAPES = [
  { n: 0, cle: "usage", titre: "Votre projet" },
  { n: 1, cle: "modele", titre: "Votre unité" },
  { n: 2, cle: "ambiance", titre: "Ambiance" },
  { n: 3, cle: "terrasse", titre: "Terrasse" },
  { n: 4, cle: "options", titre: "Options" },
  { n: 5, cle: "terrain", titre: "Dossier terrain" },
  { n: 6, cle: "recap", titre: "Récapitulatif" },
] as const;

export type PreAnalyse = {
  adresse: string;
  /** Zonage indicatif — jamais présenté comme un verdict de constructibilité. */
  zone: string | null;
  parcelle: string | null;
  /** Distance routière depuis l'atelier, en km. Entre dans le transport. */
  distanceKm: number | null;
};

type Ctx = {
  cfg: ConfigurateurConfig;

  etape: number;
  aller: (n: number) => void;
  suivant: () => void;
  precedent: () => void;

  usage: UsageId | null;
  setUsage: (u: UsageId) => void;
  quantite: number;
  setQuantite: (n: number) => void;
  /** Parcours pro au-delà du seuil : le récapitulatif bascule sur devis dédié. */
  devisDedie: boolean;

  modele: ModeleId;
  setModele: (m: ModeleId) => void;
  ambiance: string;
  setAmbiance: (a: string) => void;
  terrasse: PalierId;
  setTerrasse: (t: PalierId) => void;
  options: string[];
  toggleOption: (id: string) => void;

  preAnalyse: PreAnalyse | null;
  setPreAnalyse: (p: PreAnalyse | null) => void;

  numero: number | null;
  setNumero: (n: number | null) => void;

  /* dérivés */
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

export function ConfigurateurProvider({ children }: { children: ReactNode }) {
  const cfg = useMemo(() => loadConfig(), []);

  const [etape, setEtape] = useState(0);
  const [usage, setUsageState] = useState<UsageId | null>(null);
  const [quantite, setQuantite] = useState(1);
  const [modele, setModeleState] = useState<ModeleId>("max");
  const [ambiance, setAmbiance] = useState<string>(cfg.ambiances[0].id);
  const [terrasse, setTerrasse] = useState<PalierId>("sans");
  const [options, setOptions] = useState<string[]>([]);
  const [preAnalyse, setPreAnalyse] = useState<PreAnalyse | null>(null);
  const [numero, setNumero] = useState<number | null>(null);

  const aller = useCallback((n: number) => {
    setEtape(Math.max(0, Math.min(6, n)));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  const suivant = useCallback(() => aller(etape + 1), [aller, etape]);
  const precedent = useCallback(() => aller(etape - 1), [aller, etape]);

  const setUsage = useCallback((u: UsageId) => setUsageState(u), []);

  /* Changer de modèle purge les options devenues incompatibles : le poêle
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
      etape,
      aller,
      suivant,
      precedent,
      usage,
      setUsage,
      quantite,
      setQuantite,
      devisDedie: Boolean(seuil && quantite >= seuil),
      modele,
      setModele,
      ambiance,
      setAmbiance,
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
  }, [
    cfg, etape, aller, suivant, precedent, usage, setUsage, quantite, modele,
    setModele, ambiance, terrasse, options, toggleOption, preAnalyse, numero,
  ]);

  return <ConfigCtx.Provider value={value}>{children}</ConfigCtx.Provider>;
}

export function useConfigurateur(): Ctx {
  const c = useContext(ConfigCtx);
  if (!c) throw new Error("useConfigurateur doit être utilisé dans <ConfigurateurProvider>");
  return c;
}

export const eur = (n: number) => `${n.toLocaleString("fr-FR")} €`;
