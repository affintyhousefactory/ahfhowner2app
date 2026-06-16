"use client";

import Image from "next/image";
import { PROCESS, PROCESS_CONCLUSION, LAND_PREP } from "@/lib/site";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";

/* Parcours sobre : frise typographique des étapes + une seule image,
   la maison sur son terrain. Aucune imagerie de transport ni de levage —
   on installe une maison d'architecte, on ne largue pas une boîte. */

export function Process() {
  return (
    <section id="process" className="bg-canvas py-24 md:py-36">
      <div className="container-page">
        <Reveal>
          <div className="rule flex items-baseline justify-between pt-5">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
              003 — Le parcours
            </span>
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
              En une pose
            </span>
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="editorial mt-12 max-w-4xl text-balance text-[2.4rem] leading-[1.02] text-ink md:mt-16 md:text-[4.4rem]">
            De l'atelier à votre terrain, en une pose.
          </h2>
        </Reveal>

        {/* Frise typographique — les trois temps */}
        <Stagger className="mt-16 grid gap-x-8 gap-y-10 sm:grid-cols-2 md:mt-24 lg:grid-cols-5">
          {PROCESS.map((p) => (
            <StaggerItem key={p.step}>
              <div className="flex h-full flex-col border-t border-line pt-5">
                <span className="editorial text-[2.5rem] leading-none text-ink/20 md:text-[3rem]">
                  {p.step}
                </span>
                <h3 className="editorial mt-4 text-xl text-ink">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{p.text}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        {/* La seule image : la maison sur son terrain */}
        <div className="mt-20 grid items-center gap-10 md:mt-28 md:grid-cols-[1fr_1fr] md:gap-16">
          <Reveal>
            <figure className="group">
              <div className="relative aspect-[4/5] w-full overflow-hidden border border-line bg-surface">
                <Image
                  src="/assets/arko/exterior/arko-forest.jpg"
                  alt="L'ARKO installée sur son terrain, dans une clairière boisée"
                  fill
                  sizes="(max-width: 1024px) 92vw, 46vw"
                  className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.03]"
                />
                <span className="absolute left-3 top-3 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-canvas/85 [text-shadow:0_1px_12px_rgba(10,9,7,0.5)]">
                  Sur votre terrain
                </span>
              </div>
              <figcaption className="mt-3 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted">
                Pays Basque — la maison posée, terrasse installée
              </figcaption>
            </figure>
          </Reveal>

          <div>
            <Reveal delay={0.1}>
              <p className="editorial text-balance text-2xl leading-snug text-ink md:text-4xl">
                {PROCESS_CONCLUSION}
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="mt-6 max-w-md font-mono text-[0.7rem] leading-relaxed text-muted">
                La terrasse voyage à part et n'est posée qu'une fois la maison
                installée sur ses fondations.
              </p>
            </Reveal>
          </div>
        </div>

        {/* Préparer votre terrain — relié à l'outil terrain */}
        <div className="mt-20 border-t border-line pt-10 md:mt-28 md:pt-14">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h3 className="editorial text-2xl text-ink md:text-3xl">
                Préparer votre terrain
              </h3>
              <a
                href="#terrain"
                className="group font-mono text-[0.7rem] uppercase tracking-[0.16em] text-accent"
              >
                Tester mon terrain{" "}
                <span className="inline-block transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </a>
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
              Quelques préparatifs côté parcelle, qu'on évalue avec vous — rien
              d'imprévu, rien de caché.
            </p>
          </Reveal>
          <Stagger className="mt-10 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {LAND_PREP.map((it) => (
              <StaggerItem key={it.k}>
                <div className="flex h-full flex-col border-t border-line pt-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="font-medium text-ink">{it.k}</p>
                    <span className="shrink-0 font-mono text-[0.7rem] text-accent">
                      {it.v}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{it.d}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}
