"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { BRAND, SERIE_TOTAL } from "@/lib/site";
import { Button, Arrow } from "@/components/ui/Button";
import { Ikurrina } from "@/components/ui/Ikurrina";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const mediaY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 90]);
  const mediaScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.06]);

  return (
    <section
      id="top"
      ref={ref}
      className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden pt-20 md:pt-24"
    >
      {/* Rail haut — marque + provenance (mono) */}
      <div className="container-page flex items-baseline justify-between pt-4">
        <span
          className="hero-fade font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted"
          style={{ "--reveal-delay": "0.1s" } as React.CSSProperties}
        >
          {BRAND.maker}
        </span>
        <span
          className="hero-fade inline-flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted"
          style={{ "--reveal-delay": "0.15s" } as React.CSSProperties}
        >
          <Ikurrina width={16} height={11} className="rounded-[1px]" />
          {BRAND.madeIn}
        </span>
      </div>

      {/* Média hero — la maison comme focal éditorial (sans wordmark, ADR-022). */}
      <div className="relative flex min-h-0 flex-1 flex-col justify-center">
        <div className="relative z-0 mt-8 flex justify-center">
          {/* Parallaxe au scroll : reste en framer-motion (motion values sur le
              transform). L'entrée en opacité, elle, passe par `hero-fade` —
              sinon framer sérialise `opacity:0` dans le HTML du serveur. */}
          <motion.figure
            style={
              {
                y: mediaY,
                scale: mediaScale,
                "--reveal-delay": "0.35s",
              } as React.ComponentProps<typeof motion.figure>["style"]
            }
            className="hero-fade relative aspect-video w-[min(94vw,1120px,96svh)] overflow-hidden rounded-xl bg-surface shadow-[0_50px_80px_rgba(26,23,20,0.16)]"
          >
            <video
              className="h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster="/assets/arko/video/turntable-poster.jpg"
            >
              <source src="/assets/arko/video/turntable.mp4" type="video/mp4" />
            </video>
            {/* Voile clair en haut : garde "ARKO" (encre) lisible là où il
                mord sur l'image, et fait « émerger » l'image du canvas. */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-2/5 bg-gradient-to-b from-canvas via-canvas/60 to-transparent" />
            <figcaption className="pointer-events-none absolute bottom-3 left-4 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-white/80">
              Vue 360° — modèle Série 01
            </figcaption>
          </motion.figure>
        </div>
      </div>

      {/* Rail bas — baseline (h1) + CTA + jauge. Animé en CSS et non en
          framer-motion : le h1 ne doit jamais être servi sous `opacity:0`. */}
      <div
        className="hero-rise container-page pb-8"
        style={{ "--reveal-delay": "0.6s" } as React.CSSProperties}
      >
        <div className="rule grid grid-cols-1 gap-8 pt-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <h1 className="editorial max-w-xl text-balance text-[2rem] leading-[1.05] text-ink md:text-[2.9rem]">
              {BRAND.baseline}
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
              {BRAND.subline}
            </p>
          </div>

          <div className="flex flex-col gap-5 md:col-span-5 md:items-end">
            <div className="flex flex-wrap items-center gap-3 md:justify-end">
              <Button href="/configurer" variant="accent">
                Réserver
                <Arrow />
              </Button>
              <Button href="/terrain" variant="outline">
                Tester mon terrain
              </Button>
            </div>
            <p className="font-mono text-xs text-muted md:text-right">
              {SERIE_TOTAL} exemplaires numérotés
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
