"use client";

/* HeroBackdrop — fond ambiant blueprint/ingénierie, adapté pour fond CLAIR ARKO
   (Affinity). Boucles CSS uniquement (survivent au throttle rAF, compatibles
   ADR-006 perf). Variantes : blueprint-cube (grille + cube qui se trace),
   grid (papier millimétré + impulsions). Absolu inset-0, derrière le contenu. */
import type { CSSProperties } from "react";
import { BlueprintCube } from "./BlueprintCube";

export type HeroBackdropVariant = "blueprint-cube" | "grid";

const WRAP: CSSProperties = {
  position: "absolute",
  inset: 0,
  overflow: "hidden",
  pointerEvents: "none",
  zIndex: 0,
};

// Tons sombres faibles sur clair (inversion vs labo prune)
const LINE_1 = "rgba(13,20,26,0.05)"; // grille de fond
const LINE_2 = "rgba(13,20,26,0.08)"; // arêtes / anneaux
const DOT = "rgba(13,20,26,0.18)"; // nœuds qui scintillent

export function HeroBackdrop({ variant }: { variant: HeroBackdropVariant }) {
  return (
    <div aria-hidden="true" style={WRAP}>
      {variant === "blueprint-cube" && <CubeBg />}
      {variant === "grid" && <GridBg />}
    </div>
  );
}

/* Grille ancrée haut-droite + cube qui se trace, masque qui dégage le titre. */
function CubeBg() {
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(to right, ${LINE_1} 1px, transparent 1px), linear-gradient(to bottom, ${LINE_1} 1px, transparent 1px)`,
          backgroundSize: "64px 64px, 64px 64px",
          backgroundPosition: "right top",
          WebkitMaskImage:
            "linear-gradient(100deg, transparent 0%, transparent 30%, #000 62%)",
          maskImage:
            "linear-gradient(100deg, transparent 0%, transparent 30%, #000 62%)",
        }}
      />
      <BlueprintCube
        stroke="var(--color-accent)"
        style={{ right: 128, top: 128 }}
      />
    </div>
  );
}

/* Papier millimétré + impulsions horizontales/verticales qui circulent. */
const GRID = 64;
const H_PULSES = [
  { top: 2 * GRID, dur: 6.5, delay: 0, accent: false },
  { top: 5 * GRID, dur: 9, delay: 2.4, accent: true },
  { top: 9 * GRID, dur: 7.5, delay: 4.1, accent: false },
];
const V_PULSES = [
  { left: 4 * GRID, dur: 8, delay: 1.2 },
  { left: 12 * GRID, dur: 6, delay: 3.3 },
  { left: 18 * GRID, dur: 9.5, delay: 0.4 },
];
const NODES = [
  { c: 4, r: 2, d: 0.2 },
  { c: 12, r: 5, d: 1.4 },
  { c: 18, r: 2, d: 2.1 },
  { c: 8, r: 9, d: 0.8 },
  { c: 16, r: 9, d: 2.7 },
  { c: 12, r: 2, d: 3.4 },
];

function GridBg() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        WebkitMaskImage:
          "radial-gradient(98% 82% at 41% 47%, transparent 0%, transparent 26%, #000 74%)",
        maskImage:
          "radial-gradient(98% 82% at 41% 47%, transparent 0%, transparent 26%, #000 74%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(to right, ${LINE_1} 1px, transparent 1px), linear-gradient(to bottom, ${LINE_1} 1px, transparent 1px)`,
          backgroundSize: "64px 64px, 64px 64px",
        }}
      />
      {NODES.map((n, i) => (
        <span
          key={`n${i}`}
          style={{
            position: "absolute",
            left: n.c * GRID - 1.5,
            top: n.r * GRID - 1.5,
            width: 3,
            height: 3,
            background: DOT,
            animation: `hb-twinkle ${4 + (i % 3)}s ease-in-out ${n.d}s infinite`,
          }}
        />
      ))}
      {H_PULSES.map((p, i) => (
        <span
          key={`h${i}`}
          style={{
            position: "absolute",
            top: p.top,
            left: 0,
            width: 150,
            height: 2,
            marginTop: -1,
            background: p.accent
              ? "linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-accent) 55%, transparent), transparent)"
              : `linear-gradient(90deg, transparent, ${LINE_2}, transparent)`,
            animation: `hb-trace-x ${p.dur}s linear ${p.delay}s infinite`,
            willChange: "transform",
          }}
        />
      ))}
      {V_PULSES.map((p, i) => (
        <span
          key={`v${i}`}
          style={{
            position: "absolute",
            left: p.left,
            top: 0,
            width: 2,
            height: 150,
            marginLeft: -1,
            background: `linear-gradient(180deg, transparent, ${LINE_2}, transparent)`,
            animation: `hb-trace-y ${p.dur}s linear ${p.delay}s infinite`,
            willChange: "transform",
          }}
        />
      ))}
    </div>
  );
}
