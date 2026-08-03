"use client";

import Image from "next/image";
import { SPECS } from "@/lib/site";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";

const KEY_FIGURES = [
  { v: "40 m²", k: "habitable" },
  { v: "4 × 11 m", k: "un bloc" },
  { v: "12 sem", k: "délai" },
  { v: "Technopieux", k: "fondations" },
] as const;

export function Specs() {
  return (
    <section id="specs" className="bg-canvas py-24 md:py-36">
      <div className="container-page">
        <Reveal>
          <div className="rule flex items-baseline justify-between pt-5">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
              004 — Caractéristiques
            </span>
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
              T2 · prête à vivre
            </span>
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="editorial mt-12 max-w-4xl text-balance text-[2.4rem] leading-[1.02] text-ink md:mt-16 md:text-[5rem]">
            Pensé au millimètre.
          </h2>
        </Reveal>

        {/* Chiffres-clés — composition typographique */}
        <Stagger className="mt-16 grid grid-cols-2 gap-x-6 gap-y-10 md:mt-24 md:grid-cols-4">
          {KEY_FIGURES.map((f) => (
            <StaggerItem key={f.k}>
              <div className="border-t border-line pt-4">
                <p className="editorial text-[2.2rem] leading-none text-ink md:text-[3.2rem]">
                  {f.v}
                </p>
                <p className="mt-3 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
                  {f.k}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        {/* Du trait à la maison — l'étude au trait mariée au plan technique */}
        <div className="mt-20 grid gap-6 md:mt-28 md:grid-cols-2 md:gap-8">
          <Reveal>
            <figure className="group">
              <div className="relative aspect-[4/3] w-full overflow-hidden border border-line bg-[#efe7d6]">
                <Image
                  src="/assets/arko/sketch/arko-sketch-ink.jpg"
                  alt="Étude au trait de l'ARKO, posée dans son site boisé"
                  fill
                  sizes="(max-width: 1024px) 92vw, 46vw"
                  className="object-cover object-[center_64%] transition-transform duration-[1200ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.03]"
                />
                <span className="absolute left-3 top-3 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted">
                  L'étude
                </span>
              </div>
              <figcaption className="mt-3 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted">
                01 — Le trait d'origine, étude de volume
              </figcaption>
            </figure>
          </Reveal>

          <Reveal delay={0.06}>
            <figure className="group">
              <div className="relative aspect-[4/3] w-full overflow-hidden border border-ink bg-ink">
                <Image
                  src="/assets/arko/plans/plan.jpg"
                  alt="Plan de l'ARKO — T2 : chambre, salle de bain, séjour-cuisine"
                  fill
                  sizes="(max-width: 1024px) 92vw, 46vw"
                  className="object-contain p-4 transition-transform duration-[1200ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.02] md:p-6"
                />
                <span className="absolute left-3 top-3 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-canvas/70">
                  Le plan
                </span>
              </div>
              <figcaption className="mt-3 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted">
                02 — Plan T2 · chambre · bain · séjour-cuisine · terrasse
              </figcaption>
            </figure>
          </Reveal>
        </div>

        {/* Table détaillée — resserrée sur 2 colonnes */}
        <Stagger className="mt-12 font-mono text-sm md:mt-16 md:grid md:grid-cols-2 md:gap-x-16">
          {SPECS.map((s) => (
            <StaggerItem key={s.k}>
              <div className="flex items-baseline justify-between gap-6 border-b border-line py-3.5">
                <span className="text-muted">{s.k}</span>
                <span className="text-right text-ink">{s.v}</span>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
