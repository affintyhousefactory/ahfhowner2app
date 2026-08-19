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

/**
 * Plan d'une séquence d'images scrubée (alternative à la vidéo).
 *
 * Un plan = une image + le mouvement de caméra qu'elle joue pendant sa
 * tranche de progression. Deux plans consécutifs se **chevauchent** : le
 * chevauchement est exactement la durée du fondu enchaîné. Deux plans peuvent
 * partager la même `src` — c'est ainsi qu'on enchaîne deux mouvements
 * différents sur une même image sans qu'aucune coupure ne se voie (la pose,
 * puis le zoom d'entrée), à condition que le `to` du premier égale le `from`
 * du second.
 */
export type RevealFrame = {
  src: string;
  alt: string;
  /** libellé affiché en haut à droite pendant que le plan domine */
  tag: string;
  /** [début, fin] sur la progression 0→1 ; chevaucher le plan suivant = fondu */
  at: [number, number];
  /** transform au début du plan — échelle, et décalage en % de la largeur/hauteur */
  from: { scale: number; x?: number; y?: number };
  /** transform à la fin du plan */
  to: { scale: number; x?: number; y?: number };
};

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
/* Accélération/décélération douce : le scroll donne déjà la dynamique, on ne
   fait qu'adoucir les extrémités de chaque plan. */
const smooth = (t: number) => t * t * (3 - 2 * t);

export function RevealScrub({
  scrub: SCRUB = DEFAULT_SCRUB,
  poster: POSTER = DEFAULT_POSTER,
  frames,
}: {
  scrub?: string;
  poster?: string;
  /** Si fourni, la section joue cette séquence d'images au lieu de la vidéo. */
  frames?: readonly RevealFrame[];
} = {}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRefs = useRef<(HTMLDivElement | null)[]>([]);
  const { ref: nearRef, visible: near } = useVisible<HTMLDivElement>("120%");
  const [scrub, setScrub] = useState(false);
  const [progress, setProgress] = useState(0);

  const sequence = frames && frames.length > 1 ? frames : null;

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
    if (!section || (!video && !sequence)) return;
    video?.pause();
    let raf = 0;
    let cur = 0;
    let smoothed = 0;
    let first = true;
    const tick = () => {
      const total = section.offsetHeight - window.innerHeight;
      const top = section.getBoundingClientRect().top;
      const scrolled = Math.min(Math.max(-top, 0), Math.max(total, 1));
      const p = total > 0 ? scrolled / total : 0;
      /* L'état n'est quantisé qu'ici : la barre et le libellé n'ont pas besoin
         de 60 rendus React par seconde, les transforms passent par le DOM. */
      setProgress((prev) =>
        Math.abs(p - prev) > 0.004 || p === 0 || p === 1 ? p : prev,
      );
      if (video) {
        const dur = video.duration;
        if (dur && !Number.isNaN(dur) && video.readyState >= 2) {
          const target = p * dur;
          cur += (target - cur) * 0.15;
          if (Math.abs(target - cur) < 0.02) cur = target;
          try {
            video.currentTime = cur;
          } catch {}
        }
      }
      if (sequence) {
        /* Même lissage que la vidéo : le scroll par crans (molette, trackpad
           inertiel) sinon se voit directement dans le mouvement. */
        smoothed = first ? p : smoothed + (p - smoothed) * 0.15;
        first = false;
        applyFrames(sequence, frameRefs.current, smoothed);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [scrub, near, sequence]);

  const beat = sequence
    ? (activeFrame(sequence, progress)?.tag ?? "")
    : (BEATS.find(([, a, b]) => progress >= a && progress < b)?.[0] ?? "");

  return (
    <section
      id="revelation"
      ref={sectionRef}
      className="relative h-[100svh] bg-ink md:h-[440vh]"
    >
      <div ref={nearRef} className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="relative h-full w-full">
          {scrub && near ? (
            sequence ? (
              sequence.map((f, i) => (
                <div
                  key={`${f.src}-${i}`}
                  ref={(el) => {
                    frameRefs.current[i] = el;
                  }}
                  className="absolute inset-0 will-change-transform"
                  style={{ opacity: i === 0 ? 1 : 0, zIndex: i }}
                >
                  {/* `sizes` suit l'échelle maximale du plan : un plan qui
                      zoome à 1,85 doit recevoir une image 1,85 fois plus large
                      que la fenêtre, sinon Next en sert une au format écran et
                      le zoom la rend molle. */}
                  <Image
                    src={f.src}
                    alt={f.alt}
                    fill
                    sizes={`${Math.round(Math.max(f.from.scale, f.to.scale) * 100)}vw`}
                    priority={i === 0}
                    className="object-cover"
                  />
                </div>
              ))
            ) : (
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
            )
          ) : (
            <Image
              src={sequence ? sequence[0].src : POSTER}
              alt={sequence ? sequence[0].alt : "ARKO — le studio qui se révèle"}
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
              {scrub ? "Faites défiler — vous entrez dans le studio." : "ARKO — le studio qui se révèle."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Plan dominant à cette progression — sert au libellé du haut. */
function activeFrame(frames: readonly RevealFrame[], p: number) {
  let best: RevealFrame | undefined;
  let bestOpacity = -1;
  frames.forEach((f, i) => {
    const o = frameOpacity(frames, i, p);
    if (o >= bestOpacity) {
      bestOpacity = o;
      best = f;
    }
  });
  return best;
}

/**
 * Opacité d'un plan : il monte sur son chevauchement avec le plan précédent et
 * redescend sur celui avec le suivant. Le premier plan naît opaque, le dernier
 * meurt opaque — sinon la section s'ouvrirait ou se fermerait sur du noir.
 */
function frameOpacity(frames: readonly RevealFrame[], i: number, p: number) {
  const f = frames[i];
  const prev = frames[i - 1];
  const next = frames[i + 1];
  let o = 1;
  if (prev && prev.at[1] > f.at[0]) {
    o *= clamp01((p - f.at[0]) / (prev.at[1] - f.at[0]));
  } else if (p < f.at[0]) {
    o = 0;
  }
  if (next && f.at[1] > next.at[0]) {
    o *= 1 - clamp01((p - next.at[0]) / (f.at[1] - next.at[0]));
  } else if (next && p > f.at[1]) {
    o = 0;
  }
  return o;
}

/** Écrit opacité et transform directement dans le DOM — zéro rendu React. */
function applyFrames(
  frames: readonly RevealFrame[],
  nodes: (HTMLDivElement | null)[],
  p: number,
) {
  frames.forEach((f, i) => {
    const node = nodes[i];
    if (!node) return;
    const o = frameOpacity(frames, i, p);
    node.style.opacity = String(o);
    if (o === 0) return; // plan hors champ : rien à transformer
    const t = smooth(clamp01((p - f.at[0]) / (f.at[1] - f.at[0])));
    const scale = f.from.scale + (f.to.scale - f.from.scale) * t;
    const x = (f.from.x ?? 0) + ((f.to.x ?? 0) - (f.from.x ?? 0)) * t;
    const y = (f.from.y ?? 0) + ((f.to.y ?? 0) - (f.from.y ?? 0)) * t;
    node.style.transform = `translate3d(${x}%, ${y}%, 0) scale(${scale})`;
  });
}
