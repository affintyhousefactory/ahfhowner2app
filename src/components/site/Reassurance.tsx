"use client";

import { REASSURANCE } from "@/lib/site";
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
          <h2 className="editorial mt-12 max-w-4xl text-balance text-[2.4rem] leading-[1.02] text-canvas md:mt-16 md:text-[4.4rem]">
            Réserver, sans rien risquer.
          </h2>
        </Reveal>

        <Stagger className="mt-16 grid gap-x-10 gap-y-12 md:mt-24 md:grid-cols-2 lg:grid-cols-4">
          {REASSURANCE.map((r, i) => (
            <StaggerItem key={r.t}>
              <div className="border-t border-canvas/15 pt-5">
                <span className="font-mono text-xs text-canvas/60">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="editorial mt-3 text-xl text-canvas">{r.t}</h3>
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
