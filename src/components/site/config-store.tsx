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
  getProduct,
  type ProductKey,
  type Product,
} from "@/lib/site";

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
  // calculs
  optionsTotal: number;
  houseTotal: number;
  delivery: number | null;
  grandTotal: number;
  // réservations (Phase 1 démo, sessionStorage — Supabase Realtime en Phase 4, ADR-009)
  reservedByProduct: ReservedMap;
  remainingByProduct: ReservedMap;
  activeReserved: number;
  activeRemaining: number;
  incrementReserved: (k: ProductKey) => void;
};

const ConfigContext = createContext<Ctx | null>(null);

const STORAGE_KEY = "arko-reserved";

const initialReserved: ReservedMap = {
  one: PRODUCTS.one.reserved,
  max: PRODUCTS.max.reserved,
};

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
  const [reservedByProduct, setReservedByProduct] =
    useState<ReservedMap>(initialReserved);

  // Hydratation sessionStorage côté client (SSR-safe)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<ReservedMap>;
      const one = clamp(parsed.one ?? initialReserved.one, 0, PRODUCTS.one.total);
      const max = clamp(parsed.max ?? initialReserved.max, 0, PRODUCTS.max.total);
      setReservedByProduct({ one, max });
    } catch {
      /* noop */
    }
  }, []);

  const toggleOption = (id: string) =>
    setOptions((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const incrementReserved = useCallback((k: ProductKey) => {
    setReservedByProduct((prev) => {
      const total = PRODUCTS[k].total;
      const next = { ...prev, [k]: Math.min(prev[k] + 1, total) };
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
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
    const remainingByProduct: ReservedMap = {
      one: Math.max(0, PRODUCTS.one.total - reservedByProduct.one),
      max: Math.max(0, PRODUCTS.max.total - reservedByProduct.max),
    };
    const activeReserved = reservedByProduct[product];
    const activeRemaining = remainingByProduct[product];
    return {
      product, setProduct, active,
      cladding, setCladding, facade, setFacade, bar, setBar,
      bedroom, setBedroom, interior, setInterior,
      terrasseM2, setTerrasseM2, options, toggleOption,
      distanceKm, setDistanceKm,
      optionsTotal, houseTotal, delivery, grandTotal,
      reservedByProduct, remainingByProduct,
      activeReserved, activeRemaining, incrementReserved,
    };
  }, [
    product, cladding, facade, bar, bedroom, interior, terrasseM2,
    options, distanceKm, reservedByProduct, incrementReserved,
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
