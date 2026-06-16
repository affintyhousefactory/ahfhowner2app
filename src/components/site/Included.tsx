"use client";

import { INCLUDED, ON_YOU } from "@/lib/site";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";

export function Included() {
  return (
    <section id="perimetre" className="bg-canvas py-24 md:py-36">
      <div className="container-page">
        <Reveal>
          <div className="rule flex items-baseline justify-between pt-5">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
              006 — Le périmètre
            </span>
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
              Clair, sans surprise
            </span>
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="editorial mt-12 max-w-4xl text-balance text-[2.4rem] leading-[1.02] text-ink md:mt-16 md:text-[5rem]">
            Inclus. Et à votre charge.
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-12 md:mt-24 md:grid-cols-2 md:gap-20">
          <div>
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-ink">
              Inclus
            </p>
            <Stagger className="mt-6">
              {INCLUDED.map((i) => (
                <StaggerItem key={i}>
                  <div className="flex items-baseline gap-4 border-b border-line py-4">
                    <Check />
                    <span className="text-[1.05rem] leading-snug text-ink">{i}</span>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>

          <div>
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
              À votre charge
            </p>
            <Stagger className="mt-6">
              {ON_YOU.map((i) => (
                <StaggerItem key={i}>
                  <div className="flex items-baseline gap-4 border-b border-line py-4">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full border border-muted/50" />
                    <span className="text-[1.05rem] leading-snug text-muted">{i}</span>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </div>
    </section>
  );
}

function Check() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className="mt-1 shrink-0 text-ink"
      aria-hidden
    >
      <path
        d="M3 8.5l3.2 3.2L13 5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
