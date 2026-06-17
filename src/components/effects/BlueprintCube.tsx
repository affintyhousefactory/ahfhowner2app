"use client";

/* BlueprintCube — cube wireframe blueprint, ambient (jamais lié au scroll).
   Projection cabinet calée sur grille du fond ; arêtes tracées une par une,
   puis hold → fondu → reconstruction. reduced-motion : état final fixe.
   Adapté depuis landing-sections-lab pour charte ARKO (Affinity, fond clair). */
import { useEffect, useState, type CSSProperties } from "react";
import { useReducedMotion } from "framer-motion";

type Pt = [number, number];
type Edge = [Pt, Pt];

const isStatic = () =>
  typeof document !== "undefined" &&
  document.documentElement.classList.contains("force-final");

function geometry(cell: number, S: number, D: number) {
  const FX = 0;
  const FY = D * cell;
  const f = {
    tl: [FX, FY] as Pt,
    tr: [FX + S * cell, FY] as Pt,
    br: [FX + S * cell, FY + S * cell] as Pt,
    bl: [FX, FY + S * cell] as Pt,
  };
  const dx = D * cell;
  const dy = -D * cell;
  const shift = (p: Pt): Pt => [p[0] + dx, p[1] + dy];
  const b = { tl: shift(f.tl), tr: shift(f.tr), br: shift(f.br), bl: shift(f.bl) };
  const edges: Edge[] = [
    [f.tl, f.tr], [f.tr, f.br], [f.br, f.bl], [f.bl, f.tl],
    [f.tl, b.tl], [f.tr, b.tr], [f.br, b.br], [f.bl, b.bl],
    [b.tl, b.tr], [b.tr, b.br], [b.br, b.bl], [b.bl, b.tl],
  ];
  const verts: Pt[] = [f.tl, f.tr, f.br, f.bl, b.tl, b.tr, b.br, b.bl];
  return { edges, verts, view: (S + D) * cell };
}

export function BlueprintCube({
  cell = 64,
  s = 3,
  d = 2,
  stroke = "var(--color-accent)",
  className,
  style,
}: {
  cell?: number;
  s?: number;
  d?: number;
  stroke?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const reduce = useReducedMotion() || isStatic();
  const { edges, verts, view } = geometry(cell, s, d);
  const [step, setStep] = useState(reduce ? edges.length : 0);
  const [vis, setVis] = useState(1);

  useEffect(() => {
    if (reduce) {
      setStep(edges.length);
      setVis(1);
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    let alive = true;
    const START = 200;
    const STEP = 180;
    const HOLD = 2200;
    const FADE = 800;
    const run = () => {
      if (!alive) return;
      setVis(1);
      setStep(0);
      edges.forEach((_, i) =>
        timers.push(setTimeout(() => setStep(i + 1), START + i * STEP)),
      );
      const built = START + edges.length * STEP;
      timers.push(setTimeout(() => setVis(0), built + HOLD));
      timers.push(setTimeout(run, built + HOLD + FADE));
    };
    run();
    return () => {
      alive = false;
      timers.forEach(clearTimeout);
    };
  }, [reduce]);

  return (
    <div
      aria-hidden="true"
      className={className}
      style={{
        position: "absolute",
        width: view,
        height: view,
        opacity: vis,
        transition: "opacity 650ms ease",
        ...style,
      }}
    >
      <svg
        width={view}
        height={view}
        viewBox={`0 0 ${view} ${view}`}
        style={{ display: "block", overflow: "visible" }}
      >
        {edges.slice(0, step).map((e, i) => (
          <line
            key={i}
            x1={e[0][0]}
            y1={e[0][1]}
            x2={e[1][0]}
            y2={e[1][1]}
            stroke={stroke}
            strokeWidth="1.4"
            strokeLinecap="round"
            pathLength={1}
            style={
              reduce
                ? undefined
                : ({
                    strokeDasharray: 1,
                    strokeDashoffset: 1,
                    animation: "lab-dash 0.42s ease forwards",
                  } as CSSProperties)
            }
          />
        ))}
        {step >= edges.length &&
          verts.map((p, i) => (
            <rect
              key={`v${i}`}
              x={p[0] - 2.5}
              y={p[1] - 2.5}
              width={5}
              height={5}
              fill={stroke}
            />
          ))}
      </svg>
    </div>
  );
}
