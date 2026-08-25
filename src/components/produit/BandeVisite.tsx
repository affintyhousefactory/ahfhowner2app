"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { VueVisite } from "@/lib/produits/heure-bleue";
import { IconButton, Arrow } from "@/components/ui/Button";

/**
 * Bande de visite — ADR-040.
 *
 * Défilement horizontal avec accrochage, parcouru au doigt sur mobile et au
 * trackpad sur bureau. **Pas de rotation automatique** : rien ne bouge tant que
 * le visiteur ne le décide pas — un défilement qui avance seul fait rater la
 * vue qu'on était en train de regarder.
 *
 * Deux ajouts propres au bureau, où le mobile n'a besoin de rien :
 *
 * 1. **Des commandes.** Une souris ordinaire n'a pas de molette horizontale :
 *    sans flèches, la bande n'est atteignable qu'en saisissant la barre. Elles
 *    sont masquées sous `md` — au doigt elles ne serviraient à rien et
 *    mangeraient de la place.
 *
 * 2. **Une barre à la teinte de la page** (`.rail-sombre`, `globals.css`). Elle
 *    n'est pas masquée : sur bureau elle indique la position et reste
 *    saisissable. Masquer une barre de défilement sur une zone qui défile,
 *    c'est retirer le seul repère de position pour gagner six pixels.
 *
 * Le rail reste focusable au clavier (`tabIndex={0}`) : les flèches ← → y
 * défilent nativement, ce qu'un `div` non focusable interdit.
 */
export function BandeVisite({ titre, vues }: { titre: string; vues: VueVisite[] }) {
  const rail = useRef<HTMLUListElement>(null);
  const [peutReculer, setPeutReculer] = useState(false);
  const [peutAvancer, setPeutAvancer] = useState(true);

  const majEtat = useCallback(() => {
    const el = rail.current;
    if (!el) return;
    /* La marge d'un pixel absorbe les arrondis de zoom, qui laisseraient sinon
       une flèche « suivant » active sur une bande arrivée au bout. */
    setPeutReculer(el.scrollLeft > 1);
    setPeutAvancer(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }, []);

  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    majEtat();
    el.addEventListener("scroll", majEtat, { passive: true });
    window.addEventListener("resize", majEtat);
    return () => {
      el.removeEventListener("scroll", majEtat);
      window.removeEventListener("resize", majEtat);
    };
  }, [majEtat]);

  /* Un volet à la fois : la largeur du premier enfant, gouttière comprise. */
  const glisser = (sens: 1 | -1) => {
    const el = rail.current;
    if (!el) return;
    const premier = el.firstElementChild as HTMLElement | null;
    const pas = premier ? premier.getBoundingClientRect().width + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: sens * pas, behavior: "smooth" });
  };

  return (
    <>
      <div className="container-page flex flex-wrap items-end justify-between gap-6 pb-9">
        <div className="flex flex-col gap-3">
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.24em] text-[#e8c9a0]">
            La visite
          </p>
          <h2 className="font-display text-[clamp(1.6rem,3vw,2.35rem)] font-normal tracking-[-0.02em] text-[#f4f6f8]">
            {titre}
          </h2>
        </div>

        {/* Commandes : bureau seulement. Sur mobile, le doigt suffit. */}
        <div className="hidden items-center gap-2.5 pb-1 md:flex">
          <IconButton
            ariaLabel="Vue précédente"
            disabled={!peutReculer}
            onClick={() => glisser(-1)}
          >
            <Arrow className="rotate-180 group-hover:-translate-x-0.5 group-hover:translate-x-0" />
          </IconButton>
          <IconButton ariaLabel="Vue suivante" disabled={!peutAvancer} onClick={() => glisser(1)}>
            <Arrow />
          </IconButton>
        </div>
      </div>

      <ul
        ref={rail}
        tabIndex={0}
        aria-label="Vues du studio"
        className="rail-sombre container-page flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[#e8c9a0] md:gap-6"
      >
        {vues.map((v) => (
          <li key={v.src} className="flex w-[78vw] shrink-0 snap-start flex-col gap-3.5 md:w-[29rem]">
            <Image
              src={v.src}
              alt={v.alt}
              width={2000}
              height={1116}
              sizes="(max-width: 768px) 78vw, 29rem"
              className="h-56 w-full object-cover md:h-80"
            />
            <div className="flex flex-col gap-1.5">
              <span className="font-display text-[1.05rem] text-[#f4f6f8]">{v.titre}</span>
              <span className="text-[0.82rem] leading-snug text-[#8d9ba5]">{v.legende}</span>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
