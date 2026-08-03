"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useVisible } from "@/components/arko3d/useVisible";

const DEFAULT_SCRUB = "/assets/arko/video/film-scrub.mp4";
const DEFAULT_POSTER = "/assets/arko/video/film-scrub-poster.jpg";

const BEATS: [string, number, number][] = [
  ["L'objet", 0, 0.18],
  ["L'écrin", 0.18, 0.45],
  ["Le seuil", 0.45, 0.72],
  ["Le soir", 0.72, 1.01],
];

export function RevealScrub({
  scrub: SCRUB = DEFAULT_SCRUB,
  poster: POSTER = DEFAULT_POSTER,
}: {
  scrub?: string;
  poster?: string;
} = {}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { ref: nearRef, visible: near } = useVisible<HTMLDivElement>("120%");
  const [scrub, setScrub] = useState(false);
  const [progress, setProgress] = useState(0);

  // Scrub seulement sur desktop pointeur fin, hors reduced-motion (matchMedia direct)
  useEffect(() => {
    const fine = window.matchMedia("(min-width: 769px) and (pointer: fine)").matches;
    const red = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setScrub(fine && !red);
  }, []);

  // Boucle rAF : la position de scroll pilote video.currentTime (lerp doux)
  useEffect(() => {
    if (!scrub || !near) return;
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;
    video.pause();
    let raf = 0;
    let cur = 0;
    const tick = () => {
      const total = section.offsetHeight - window.innerHeight;
      const top = section.getBoundingClientRect().top;
      const scrolled = Math.min(Math.max(-top, 0), Math.max(total, 1));
      const p = total > 0 ? scrolled / total : 0;
      setProgress(p);
      const dur = video.duration;
      if (dur && !Number.isNaN(dur) && video.readyState >= 2) {
        const target = p * dur;
        cur += (target - cur) * 0.15;
        if (Math.abs(target - cur) < 0.02) cur = target;
        try {
          video.currentTime = cur;
        } catch {}
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [scrub, near]);

  const beat = BEATS.find(([, a, b]) => progress >= a && progress < b)?.[0] ?? "";

  return (
    <section
      id="revelation"
      ref={sectionRef}
      className="relative h-[100svh] bg-ink md:h-[440vh]"
    >
      <div ref={nearRef} className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="relative h-full w-full">
          {scrub && near ? (
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover"
              muted
              playsInline
              preload="auto"
              poster={POSTER}
            >
              <source src={SCRUB} type="video/mp4" />
            </video>
          ) : (
            <Image
              src={POSTER}
              alt="ARKO — la maison qui se révèle"
              fill
              sizes="100vw"
              className="object-cover"
            />
          )}
        </div>

        {/* léger voile bas pour les légendes */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink/60 to-transparent" />

        {/* habillage */}
        <div className="pointer-events-none absolute inset-0">
          <div className="container-page absolute inset-x-0 top-[8vh] flex items-baseline justify-between">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-canvas/70">
              La Révélation
            </span>
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-canvas/70">
              {beat}
            </span>
          </div>

          <div className="container-page absolute inset-x-0 bottom-[7vh]">
            <div className="h-px w-full bg-canvas/20">
              <div
                className="h-px bg-canvas transition-[width] duration-75"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
            <p className="mt-4 max-w-md font-mono text-[0.7rem] uppercase tracking-[0.18em] text-canvas/60">
              {scrub ? "Faites défiler — vous entrez dans la maison." : "ARKO — la maison qui se révèle."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
