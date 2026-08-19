"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { BRAND, reserverHref, type Product } from "@/lib/site";
import { Button, Arrow } from "@/components/ui/Button";
import { Gauge } from "@/components/ui/Gauge";
import { HeroBackdrop, type HeroBackdropVariant } from "@/components/effects/HeroBackdrop";
import { useTilt } from "@/components/effects/useTilt";
import { Reveal } from "@/components/ui/Reveal";

const EASE = [0.16, 1, 0.3, 1] as const;

/* Hero de page produit : reprend le scroll-zoom de l'accueil (la vidéo
   zoome en entrant dans le modèle) paramétré par produit. Fond ambiant
   blueprint (HeroBackdrop) + tilt 3D sur la figure (useTilt). */
export function ProductHero({
  product,
  backdrop = "blueprint-cube",
}: {
  product: Product;
  backdrop?: HeroBackdropVariant | "none";
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const mediaY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 90]);
  const mediaScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.08]);
  const tilt = useTilt(6);

  return (
    <section
      id="top"
      ref={ref}
      className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden pt-20 md:pt-24"
    >
      {backdrop !== "none" && <HeroBackdrop variant={backdrop} />}
      <div className="container-page relative z-10 flex items-baseline justify-between pt-4">
        <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
          {product.area} · {product.total} exemplaires
        </span>
        <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
          {BRAND.madeIn}
        </span>
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-center">
        <div className="container-page relative z-20">
          {/* Le nom du produit reste l'élément visuel dominant, mais ce n'est
              plus le `<h1>` : depuis le 2026-08-19 le titre de page porte la
              catégorie (« Studio de jardin de 20 m² … »), qui est ce qu'un
              visiteur cherche — « Arko One » ne se tape pas dans un moteur.
              Rendu en `<p>` comme la baseline du pied de page et les libellés
              du méga-menu : dominant à l'œil, décoratif dans le plan. */}
          <p
            className="editorial select-none text-ink"
            style={{ fontSize: "var(--text-display)" }}
          >
            {product.name}
          </p>
        </div>

        <div className="relative z-10 -mt-[clamp(2rem,6vw,6rem)] flex justify-center">
          <motion.figure
            style={{
              y: mediaY,
              scale: mediaScale,
              rotateX: tilt.rotateX,
              rotateY: tilt.rotateY,
              transformPerspective: 900,
            }}
            onMouseMove={tilt.onMove}
            onMouseLeave={tilt.onLeave}
            className="relative aspect-video w-[min(94vw,1120px,96svh)] overflow-hidden rounded-xl bg-surface shadow-[0_50px_80px_rgba(26,23,20,0.16)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.4, ease: EASE, delay: 0.2 }}
          >
            <video
              className="h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={product.poster}
            >
              <source src={product.video} type="video/mp4" />
            </video>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-2/5 bg-gradient-to-b from-canvas via-canvas/60 to-transparent" />
            <figcaption className="pointer-events-none absolute bottom-3 left-4 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-white/80">
              {product.name} — {product.area}
              {product.placeholderMedia ? " · visuel provisoire" : ""}
            </figcaption>
          </motion.figure>
        </div>
      </div>

      {/* `Reveal` et NON `motion.div` : ce bloc contient désormais le `<h1>`
          de la page, et framer-motion sérialise `opacity:0` dans le HTML du
          serveur — le titre partait donc invisible pour un visiteur sans JS
          comme pour un crawler. C'est exactement le défaut corrigé sur
          l'accueil le 2026-07-20, réintroduit ici le 2026-08-19 en déplaçant
          le `<h1>` dans ce bloc animé. `Reveal` porte son état masqué en CSS
          sous `.js-motion`, posée seulement si JS s'exécute : pas de JS, pas
          de classe, contenu visible.

          Règle : aucun `<h1>` ne doit jamais naître sous un bloc animé par
          framer-motion. */}
      <Reveal
        className="container-page relative z-10 pb-8"
        delay={0.4}
      >
        <div className="rule grid grid-cols-1 gap-8 pt-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            {/* `md:whitespace-nowrap` retiré : il tenait pour une tagline
                courte, il ferait déborder un titre de 55 caractères. */}
            <h1 className="editorial text-balance text-[2rem] leading-[1.05] text-ink md:text-[2.9rem]">
              {product.h1}
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
              À partir de {product.pricing.base.toLocaleString("fr-FR")} € —
              livré prêt à vivre.
            </p>
          </div>

          <div className="flex flex-col gap-5 md:col-span-5 md:items-end">
            {/* Un seul CTA, comme sur l'accueil. « Tester mon terrain » retiré
                le 2026-08-02 : `/terrain` est suspendue (ADR-028) et son repli
                menait au configurateur v1, que plus aucun autre bouton ne
                dessert. La vérification de parcelle vit dans le parcours, en
                section 05. */}
            <div className="flex flex-wrap items-center gap-3 md:justify-end">
              <Button href={reserverHref(product.key)} variant="accent">
                Réserver — {BRAND.deposit.toLocaleString("fr-FR")} €
                <Arrow />
              </Button>
            </div>
            <Gauge
              reserved={product.reserved}
              total={product.total}
              variant="mini"
              className="md:justify-end"
            />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
