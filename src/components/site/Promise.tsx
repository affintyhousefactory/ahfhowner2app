"use client";

import { PROMISE } from "@/lib/site";
import { Reveal } from "@/components/ui/Reveal";

export function Promesse() {
  return (
    <section className="bg-canvas py-20 md:py-28">
      <div className="container-page">
        <Reveal>
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
            Notre promesse
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <p className="titre-l mt-6 text-ink">
            {PROMISE}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
