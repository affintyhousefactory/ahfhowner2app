"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Arrow } from "@/components/ui/Button";

const PACKS = [
  {
    id: "essentiel" as const,
    label: "Pack Terrain Essentiel",
    prix: "4 900 € TTC",
    scope: "1 à 5 villes ciblées",
    detail: "Recherche concentrée sur les communes de votre choix.",
  },
  {
    id: "etendu" as const,
    label: "Pack Terrain Étendu",
    prix: "7 300 € TTC",
    scope: "1 zone de recherche élargie",
    detail: "Intercommunalité, bassin de vie ou zone géographique définie. Pour plusieurs zones, chaque demande fait l'objet d'un pack distinct.",
  },
  {
    id: "departement" as const,
    label: "Pack Terrain Département",
    prix: "11 200 € TTC",
    scope: "Couverture complète d'un département",
    detail: "Prospection sur l'ensemble du département avec qualification TAIF Zone Départementale.",
  },
] as const;

type PackId = (typeof PACKS)[number]["id"];

export function RechercheTerrainForm() {
  const router = useRouter();
  const [pack, setPack] = useState<PackId | "">("");

  const selectedPack = PACKS.find((p) => p.id === pack);

  function goToConfigurateur() {
    if (!pack) return;
    router.push(`/configurer?pack=${pack}`);
  }

  return (
    <div className="space-y-8">

      {/* ── Sélection du pack ── */}
      <div>
        <p className="mb-4 font-mono text-[0.72rem] uppercase tracking-[0.18em] text-muted">
          Votre pack terrain
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {PACKS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPack(p.id)}
              className={`relative flex flex-col rounded-2xl border p-5 text-left transition-colors ${
                pack === p.id
                  ? "border-accent bg-accent/[0.06]"
                  : "border-line hover:border-accent/40"
              }`}
            >
              {pack === p.id && (
                <span className="absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full bg-accent">
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path
                      d="M1 4l2.5 2.5L9 1"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              )}
              <span
                className={`font-mono text-[0.65rem] uppercase tracking-[0.14em] ${
                  pack === p.id ? "text-accent" : "text-muted"
                }`}
              >
                {p.id === "essentiel" ? "Essentiel" : p.id === "etendu" ? "Étendu" : "Département"}
              </span>
              <span className="mt-2 text-[1.15rem] font-semibold tracking-tight text-ink">
                {p.prix}
              </span>
              <span className="mt-1 font-mono text-[0.7rem] font-medium text-muted/70">
                {p.scope}
              </span>
              <span className="mt-2 text-[0.78rem] leading-relaxed text-muted/60">
                {p.detail}
              </span>
            </button>
          ))}
        </div>
        <p className="mt-3 font-mono text-[0.65rem] text-muted/50">
          Tarifs indicatifs — formalisés sur devis après étude de votre zone de recherche.
        </p>
      </div>

      {/* ── CTA ── */}
      <button
        type="button"
        onClick={goToConfigurateur}
        disabled={!pack}
        className="group inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-accent px-7 py-4 text-[1rem] font-medium tracking-tight text-white shadow-sm transition-colors hover:bg-accent-ink disabled:cursor-not-allowed disabled:opacity-40"
      >
        {selectedPack
          ? `Configurer mon Arko — ${selectedPack.label}`
          : "Sélectionnez un pack pour continuer"}
        {pack && <Arrow />}
      </button>

      <p className="text-center font-mono text-[0.68rem] leading-relaxed text-muted">
        Vous serez redirigé vers le configurateur avec votre pack pré-sélectionné.
      </p>
    </div>
  );
}
