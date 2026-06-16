"use client";

import { FAQ } from "@/lib/site";
import { Reveal } from "@/components/ui/Reveal";

export function Faq() {
  return (
    <section id="faq" className="bg-canvas py-24 md:py-36">
      <div className="container-page">
        <Reveal>
          <div className="rule flex items-baseline justify-between pt-5">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
              012 — Questions
            </span>
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
              L'essentiel
            </span>
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="editorial mt-12 max-w-3xl text-balance text-[2.4rem] leading-[1.02] text-ink md:mt-16 md:text-[4rem]">
            Les réponses, franches.
          </h2>
        </Reveal>

        <div className="mt-14 md:mt-20">
          {FAQ.map((item, i) => (
            <Reveal key={item.q} delay={i * 0.04}>
              <details className="group border-b border-line py-5">
                <summary className="flex cursor-pointer list-none items-baseline justify-between gap-6">
                  <span className="text-[1.15rem] font-medium tracking-tight text-ink md:text-[1.4rem]">
                    {item.q}
                  </span>
                  <span className="mt-1 shrink-0 font-mono text-xl text-muted transition-transform duration-300 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-4 max-w-2xl text-[0.98rem] leading-relaxed text-muted">
                  {item.a}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
