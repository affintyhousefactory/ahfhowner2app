"use client";

import { useState } from "react";
import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { Button, Arrow } from "@/components/ui/Button";

export function AvantPremiere() {
  const [playing, setPlaying] = useState(false);

  return (
    <section id="avant-premiere" className="bg-canvas py-24 md:py-36">
      <div className="container-page">
        <Reveal>
          <div className="rule flex items-baseline justify-between pt-5">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
              009 — Avant-première
            </span>
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
              Le film · 40 s
            </span>
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="editorial mt-12 max-w-3xl text-balance text-[2.4rem] leading-[1.02] text-ink md:mt-16 md:text-[5rem]">
            Quarante secondes.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-muted">
            La Série 01, en un seul plan continu. Le son monte.
          </p>
        </Reveal>

        {/* Lecteur — poster, lecture au clic (avec son) */}
        <Reveal delay={0.1}>
          <div className="mt-12 overflow-hidden rounded-2xl border border-line bg-ink md:mt-16">
            <div className="relative aspect-video w-full">
              {playing ? (
                <video
                  className="absolute inset-0 h-full w-full"
                  src="/assets/arko/video/spot-16x9.mp4"
                  poster="/assets/arko/video/film-poster.jpg"
                  controls
                  autoPlay
                  playsInline
                />
              ) : (
                <button
                  onClick={() => setPlaying(true)}
                  aria-label="Lire le film ARKO (avec le son)"
                  className="group absolute inset-0 h-full w-full"
                >
                  <Image
                    src="/assets/arko/video/film-poster.jpg"
                    alt="ARKO — le film de la Série 01"
                    fill
                    sizes="(max-width: 1024px) 92vw, 84rem"
                    className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.03]"
                  />
                  <span className="absolute inset-0 bg-ink/10 transition-colors duration-500 group-hover:bg-ink/0" />
                  {/* bouton lecture */}
                  <span className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-canvas/90 backdrop-blur transition-transform duration-300 group-hover:scale-105 md:h-24 md:w-24">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden className="ml-1">
                      <path d="M6 4.5l13 7.5-13 7.5z" fill="#1a1714" />
                    </svg>
                  </span>
                  <span className="absolute bottom-4 left-5 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-white/85">
                    Lecture avec le son
                  </span>
                </button>
              )}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-8 flex items-center gap-4">
            <Button href="#reserver" variant="accent">
              Réserver — 1 500 €
              <Arrow />
            </Button>
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted">
              Série 01 · 12 exemplaires
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
