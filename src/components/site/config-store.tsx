"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  PRODUCTS,
  SERIE_TOTAL,
  getProduct,
  type ProductKey,
  type Product,
} from "@/lib/site";

// Pool commun — les deux clés retournent le même compteur partagé (SERIE_TOTAL = 12)
type ReservedMap = Record<ProductKey, number>;

type Ctx = {
  // produit actif (ADR-020 — configurateur multi-produit)
  product: ProductKey;
  setProduct: (v: ProductKey) => void;
  active: Product;
  cladding: string;
  setCladding: (v: string) => void;
  facade: string;
  setFacade: (v: string) => void;
  bar: string;
  setBar: (v: string) => void;
  bedroom: string;
  setBedroom: (v: string) => void;
  interior: string;
  setInterior: (v: string) => void;
  terrasseM2: number;
  setTerrasseM2: (v: number) => void;
  options: string[];
  toggleOption: (id: string) => void;
  distanceKm: number | null;
  setDistanceKm: (v: number | null) => void;
  terrainMode: "have" | "pack" | null;
  setTerrainMode: (v: "have" | "pack" | null) => void;
  packTerrain: string | null;
  setPackTerrain: (v: string | null) => void;
  // calculs
  optionsTotal: number;
  houseTotal: number;
  delivery: number | null;
  grandTotal: number;
  // réservations — pool partagé 12 ex. (Phase 1 démo, sessionStorage — Supabase Phase 4, ADR-009)
  reservedByProduct: ReservedMap;
  remainingByProduct: ReservedMap;
  activeReserved: number;
  activeRemaining: number;
  incrementReserved: (k: ProductKey) => void;
};

const ConfigContext = createContext<Ctx | null>(null);

const STORAGE_KEY = "arko-reserved";

// Valeur initiale démo Phase 1 — sera remplacée par Supabase Realtime (ADR-009)
const DEMO_RESERVED = PRODUCTS.one.reserved + PRODUCTS.max.reserved; // = 3

export function ConfigProvider({
  children,
  initialProduct = "max",
}: {
  children: React.ReactNode;
  initialProduct?: ProductKey;
}) {
  const [product, setProduct] = useState<ProductKey>(initialProduct);
  const [cladding, setCladding] = useState("anthracite");
  const [facade, setFacade] = useState("fonce");
  const [bar, setBar] = useState("avec");
  const [bedroom, setBedroom] = useState("naturel");
  const [interior, setInterior] = useState("bois");
  const [terrasseM2, setTerrasseM2] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [terrainMode, setTerrainMode] = useState<"have" | "pack" | null>(null);
  const [packTerrain, setPackTerrain] = useState<string | null>(null);
  const [totalReserved, setTotalReserved] = useState<number>(DEMO_RESERVED);

  // Hydratation sessionStorage côté client (SSR-safe)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      // Support ancien format { one, max } et nouveau format { total }
      const parsed = JSON.parse(raw) as { total?: number; one?: number; max?: number };
      const n = parsed.total ?? ((parsed.one ?? 0) + (parsed.max ?? 0));
      setTotalReserved(clamp(n, 0, SERIE_TOTAL));
    } catch {
      /* noop */
    }
  }, []);

  const toggleOption = (id: string) =>
    setOptions((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const incrementReserved = useCallback((_k: ProductKey) => {
    setTotalReserved((prev) => {
      const next = Math.min(prev + 1, SERIE_TOTAL);
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ total: next }));
      } catch {
        /* noop */
      }
      return next;
    });
  }, []);

  const value = useMemo<Ctx>(() => {
    const active = getProduct(product);
    const p = active.pricing;
    const optionsTotal =
      terrasseM2 * p.terrassePerM2 +
      p.options
        .filter((o) => options.includes(o.id))
        .reduce((s, o) => s + o.price, 0);
    const houseTotal = p.base + optionsTotal;
    const delivery =
      distanceKm != null && distanceKm >= 0
        ? Math.round(p.delivery.grutage + distanceKm * p.delivery.perKm)
        : null;
    const grandTotal = houseTotal + (delivery ?? 0);
    // Pool commun : les deux clés retournent le même compteur partagé
    const reservedByProduct: ReservedMap = { one: totalReserved, max: totalReserved };
    const remaining = Math.max(0, SERIE_TOTAL - totalReserved);
    const remainingByProduct: ReservedMap = { one: remaining, max: remaining };
    const activeReserved = totalReserved;
    const activeRemaining = remaining;
    return {
      product, setProduct, active,
      cladding, setCladding, facade, setFacade, bar, setBar,
      bedroom, setBedroom, interior, setInterior,
      terrasseM2, setTerrasseM2, options, toggleOption,
      distanceKm, setDistanceKm,
      terrainMode, setTerrainMode, packTerrain, setPackTerrain,
      optionsTotal, houseTotal, delivery, grandTotal,
      reservedByProduct, remainingByProduct,
      activeReserved, activeRemaining, incrementReserved,
    };
  }, [
    product, cladding, facade, bar, bedroom, interior, terrasseM2,
    options, distanceKm, terrainMode, packTerrain, totalReserved, incrementReserved,
  ]);

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export function useConfig() {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error("useConfig must be used within ConfigProvider");
  return ctx;
}

export const eur = (n: number) => n.toLocaleString("fr-FR") + " €";

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

export { PRODUCTS };
