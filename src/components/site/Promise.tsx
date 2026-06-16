"use client";

import { PROMISE } from "@/lib/site";
import { Reveal } from "@/components/ui/Reveal";

export function Promesse() {
  return (
    <section className="bg-canvas py-20 md:py-28">
      <div className="container-page">
        <Reveal>
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
            La promesse
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <p className="editorial mt-6 max-w-4xl text-balance text-[1.8rem] leading-[1.18] text-ink md:text-[3rem] md:leading-[1.16]">
            {PROMISE}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
