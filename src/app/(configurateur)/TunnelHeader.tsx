"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/shared/lib/cn";
import { PhoneLink } from "@/components/ui/PhoneLink";
import { BRAND } from "@/lib/site";

/**
 * En-tête du tunnel — s'efface en descente, revient en montée (mobile).
 *
 * Sur 390 px, la scène collante et l'en-tête se disputent la même bande de
 * 64 px : la scène se cale à `top-0`, donc sous un en-tête fixe. Plutôt que
 * d'empiler deux barres et de ne rien laisser aux options, l'en-tête sort du
 * champ quand on descend dans le parcours et rentre dès qu'on remonte — la
 * porte de sortie est toujours à un geste, jamais à un aller-retour.
 *
 * Sur ≥ 1024 px le comportement ne s'applique pas : la place ne manque pas,
 * et un en-tête qui bouge au défilement y serait du bruit.
 */

/** Hauteur de l'en-tête mobile — doit suivre `h-16` ci-dessous. */
const HAUTEUR = "4rem";

/**
 * Espace que l'en-tête occupe au-dessus de la scène, publié sur la racine.
 *
 * La scène vit dans un autre arbre (la page, pas la mise en page) : une
 * variable CSS est la seule couture qui les relie sans remonter un état
 * partagé jusqu'au groupe de routes.
 */
const VAR = "--cfg-nav";

export function TunnelHeader() {
  const [visible, setVisible] = useState(true);
  const dernier = useRef(0);

  useEffect(() => {
    let tick = false;

    /* La variable est écrite ici et non dans un effet indexé sur `visible` :
       elle dépend aussi de la largeur, et un simple redimensionnement
       desktop → mobile ne change pas `visible`. Sur desktop on ne réserve
       rien, la scène y garde son calage propre (`lg:top-3`). */
    const appliquer = (v: boolean) => {
      setVisible(v);
      document.documentElement.style.setProperty(
        VAR,
        v && window.innerWidth < 1024 ? HAUTEUR : "0px",
      );
    };

    const mesurer = () => {
      tick = false;
      const y = window.scrollY;
      const delta = y - dernier.current;
      dernier.current = y;

      if (window.innerWidth >= 1024 || y <= 8) {
        appliquer(true);
        return;
      }
      /* Seuil de 6 px : l'inertie de Lenis produit des micro-variations de
         sens, et sans seuil l'en-tête clignote au moindre soubresaut. */
      if (delta > 6) appliquer(false);
      else if (delta < -6) appliquer(true);
    };

    const onScroll = () => {
      if (tick) return;
      tick = true;
      requestAnimationFrame(mesurer);
    };

    dernier.current = window.scrollY;
    mesurer();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      document.documentElement.style.removeProperty(VAR);
    };
  }, []);

  return (
    <header
      /* Le clavier ne défile pas : sans cela, tabuler jusqu'au logo depuis le
         bas du parcours donnerait le focus à un élément hors du champ. */
      onFocus={() => setVisible(true)}
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b border-line bg-canvas/80 backdrop-blur-md",
        "transition-transform duration-300 ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none",
        visible ? "translate-y-0" : "-translate-y-full",
        "lg:translate-y-0",
      )}
    >
      <div className="container-page flex h-16 items-center md:h-[4.5rem]">
        <Link
          href="/"
          aria-label="Howner — revenir à l'accueil"
          className="flex items-center gap-2 transition-opacity hover:opacity-70"
        >
          <Image
            src="/images/howner-logo.png"
            alt=""
            width={28}
            height={28}
            className="h-7 w-auto"
            priority
          />
          <span className="text-lg font-semibold tracking-tight">
            {BRAND.maker}
          </span>
        </Link>

        {/* Ligne d'appel — seule autre affordance de la barre du tunnel : au
            moment de choisir, la question qui bloque se règle plus vite au
            téléphone qu'en sortant du parcours. */}
        <PhoneLink className="ml-auto" />
      </div>
    </header>
  );
}
