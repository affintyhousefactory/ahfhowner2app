"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { BRAND, SERIE_TOTAL, reserverHref } from "@/lib/site";
import { Button, Arrow } from "@/components/ui/Button";
import { Ikurrina } from "@/components/ui/Ikurrina";
import { contenuProduit } from "@/lib/produits/heure-bleue";

/**
 * Hero de l'accueil — charte « Heure bleue » (ADR-041).
 *
 * Il servait une vidéo dans un cadre posé sur fond clair ; il reprend désormais
 * la grammaire des pages produit, à la demande de Richard : image plein cadre,
 * registre nuit, titre en superposition.
 *
 * ⚠ **L'image n'est jamais rognée par le cadre.**
 *
 * Sur mobile, un hero plein écran fait 390 × 844 px, soit un rapport de 0,46,
 * quand le visuel est en 16/9 (1,78). Un `object-cover` y perdrait les deux
 * tiers de la largeur — donc le studio lui-même. L'image garde donc son
 * rapport (`aspect-video`) et le texte passe **en dessous** ; la superposition
 * ne commence qu'à partir de `md`, où la hauteur disponible le permet.
 *
 * C'est la même règle que pour la maquette mobile : sur 390 px, un titre par
 * dessus une image coupée ne laisse respirer ni l'un ni l'autre.
 *
 * ⚠ Le `<h1>` n'est pas animé en JS et aucun bloc ne part en `opacity: 0`
 * sérialisé : l'entrée passe par les classes CSS `hero-*`, conditionnées à
 * `.js-motion`. Sans JS, tout reste visible — leçon du 2026-08-25, où
 * l'accroche et le bouton d'une page produit partaient invisibles.
 */
export function Hero() {
  const reduce = useReducedMotion();
  /* Le visuel d'accueil est celui de la page Arko Max : même fichier, même
     source de vérité. Le recopier ici aurait laissé les deux diverger. */
  const visuel = contenuProduit("max").hero;

  return (
    <section id="top" className="relative isolate overflow-hidden bg-nuit text-nuit-texte">
      {/* Bandeau de contexte, au-dessus de l'image sur mobile comme sur bureau. */}
      <div className="container-page flex items-baseline justify-between gap-4 pt-24 md:absolute md:inset-x-0 md:top-0 md:z-20 md:pt-28">
        <span className="hero-fade font-mono text-[0.68rem] uppercase tracking-[0.2em] text-nuit-faible">
          {SERIE_TOTAL} exemplaires numérotés
        </span>
        <span className="hero-fade inline-flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-nuit-faible">
          <Ikurrina width={16} height={11} className="rounded-[1px]" />
          {BRAND.madeIn}
        </span>
      </div>

      {/* Le rapport de l'image est tenu jusqu'à `md` : rien n'est rogné. */}
      <div className="relative mt-6 aspect-video w-full md:mt-0 md:aspect-auto md:h-[min(92svh,54rem)]">
        <motion.div
          className="absolute inset-0"
          initial={reduce ? false : { scale: 1.06 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image
            src={visuel.src}
            alt={visuel.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>

        {/* Voile : il ne sert qu'au texte, donc il n'apparaît qu'avec lui. */}
        <div
          aria-hidden
          className="absolute inset-0 hidden bg-[linear-gradient(180deg,rgba(15,21,25,.55)_0%,rgba(15,21,25,.10)_38%,rgba(15,21,25,.96)_100%)] md:block"
        />

      </div>

      {/* ⚠ UN SEUL bloc de texte, donc un seul `<h1>` dans le HTML — deux blocs
          alternés par media query en auraient servi deux au crawler. Sur mobile
          il suit l'image dans le flux ; à partir de `md` il se pose dessus. */}
      <div className="container-page relative z-10 flex flex-col gap-6 py-10 md:absolute md:inset-x-0 md:bottom-0 md:gap-0 md:pb-14">
        <h1 className="titre-hero text-balance text-nuit-titre md:max-w-[19ch]">
          {BRAND.h1}
        </h1>
        <p className="hero-rise text-[0.95rem] leading-relaxed text-nuit-muted md:mt-6 md:max-w-md md:text-base">
          {BRAND.subline}
        </p>
        <div className="hero-rise flex flex-col gap-3 md:mt-8 md:flex-row md:flex-wrap md:items-center md:gap-4">
          <Button href={reserverHref()} variant="lumiere" className="w-full md:w-auto">
            Réserver
            <Arrow />
          </Button>
          <Button href="/studio-jardin-arko-one" variant="contour-clair" className="w-full md:w-auto">
            Voir les studios
          </Button>
        </div>
      </div>

    </section>
  );
}
