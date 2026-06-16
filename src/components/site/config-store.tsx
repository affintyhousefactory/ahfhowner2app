"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { PRICING } from "@/lib/site";

type Ctx = {
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
};

const ConfigContext = createContext<Ctx | null>(null);

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [cladding, setCladding] = useState("anthracite");
  const [facade, setFacade] = useState("fonce");
  const [bar, setBar] = useState("avec");
  const [bedroom, setBedroom] = useState("naturel");
  const [interior, setInterior] = useState("bois");
  const [terrasseM2, setTerrasseM2] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);

  const toggleOption = (id: string) =>
    setOptions((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const value = useMemo<Ctx>(() => {
    const optionsTotal =
      terrasseM2 * PRICING.terrassePerM2 +
      PRICING.options
        .filter((o) => options.includes(o.id))
        .reduce((s, o) => s + o.price, 0);
    const houseTotal = PRICING.base + optionsTotal;
    const delivery =
      distanceKm != null && distanceKm >= 0
        ? Math.round(PRICING.delivery.grutage + distanceKm * PRICING.delivery.perKm)
        : null;
    const grandTotal = houseTotal + (delivery ?? 0);
    return {
      cladding, setCladding, facade, setFacade, bar, setBar,
      bedroom, setBedroom, interior, setInterior,
      terrasseM2, setTerrasseM2, options, toggleOption,
      distanceKm, setDistanceKm,
      optionsTotal, houseTotal, delivery, grandTotal,
    };
  }, [cladding, facade, bar, bedroom, interior, terrasseM2, options, distanceKm]);

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export function useConfig() {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error("useConfig must be used within ConfigProvider");
  return ctx;
}

export const eur = (n: number) => n.toLocaleString("fr-FR") + " €";
