"use client";

import { REASSURANCE, REASSURANCE_INTRO } from "@/lib/site";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";

export function Reassurance() {
  return (
    <section id="confiance" className="bg-ink py-24 text-canvas md:py-36">
      <div className="container-page">
        <Reveal>
          <div className="flex items-baseline justify-between border-t border-canvas/15 pt-5">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-canvas/55">
              010 — En confiance
            </span>
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-canvas/55">
              HOWNER · ARKO
            </span>
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="titre-xl mt-12 max-w-4xl text-balance text-canvas md:mt-16">
            Réserver, sans rien risquer en deux étapes.
          </h2>
        </Reveal>

        <Stagger className="mt-10 grid gap-x-10 gap-y-6 md:grid-cols-2">
          {REASSURANCE_INTRO.map((r) => (
            <StaggerItem key={r.t}>
              <h3 className="titre-s text-canvas">{r.t}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-canvas/60">{r.d}</p>
            </StaggerItem>
          ))}
        </Stagger>

        <Stagger className="mt-16 grid gap-x-10 gap-y-12 md:mt-24 md:grid-cols-2">
          {REASSURANCE.map((r, i) => (
            <StaggerItem key={r.t}>
              <div className="border-t border-canvas/15 pt-5">
                <span className="font-mono text-xs text-canvas/60">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="titre-s mt-3 text-canvas">{r.t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-canvas/60">
                  {r.d}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
