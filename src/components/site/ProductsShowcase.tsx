"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PRODUCT_LIST, type Product } from "@/lib/site";
import { Reveal } from "@/components/ui/Reveal";
import { useTilt } from "@/components/effects/useTilt";

/* Accueil — entrée vers les deux modèles (parcours Découvrir / Réserver).
   Tilt 3D suivi-souris sur chaque carte (perf-safe, framer spring). */
export function ProductsShowcase() {
  return (
    <section id="produits" className="bg-surface py-24 md:py-36">
      <div className="container-page">
        <Reveal>
          <div className="rule flex items-baseline justify-between pt-5">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
              Nos modèles
            </span>
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
              Deux formats
            </span>
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="editorial mt-12 text-[2.4rem] leading-[1.02] text-ink md:mt-16 md:whitespace-nowrap md:text-[4.6rem]">
            Deux maisons, un même soin.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {PRODUCT_LIST.map((p, i) => (
            <Reveal key={p.key} delay={0.05 + i * 0.05}>
              <ProductCard p={p} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCard({ p }: { p: Product }) {
  const tilt = useTilt(5);
  return (
    <motion.div
      onMouseMove={tilt.onMove}
      onMouseLeave={tilt.onLeave}
      style={{
        rotateX: tilt.rotateX,
        rotateY: tilt.rotateY,
        transformPerspective: 1000,
      }}
      className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-canvas"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-surface">
        <video
          className="h-full w-full object-cover"
          muted
          loop
          autoPlay
          playsInline
          preload="none"
          poster={p.poster}
        >
          <source src={p.video} type="video/mp4" />
        </video>
      </div>
      <div className="flex flex-1 flex-col p-6 md:p-8">
        <div className="flex items-baseline justify-between">
          <h3 className="editorial text-3xl text-ink">{p.name}</h3>
          <span className="font-mono text-xs text-muted">
            {p.area} · {p.total} ex.
          </span>
        </div>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
          {p.tagline}
        </p>
        <p className="mt-4 font-mono text-sm text-ink">
          dès {p.pricing.base.toLocaleString("fr-FR")} €
        </p>
        <div className="mt-auto flex flex-wrap gap-3 pt-6">
          <Link
            href={p.slug}
            className="rounded-full border border-line px-5 py-2.5 text-sm text-ink transition-colors hover:border-ink"
          >
            Découvrir
          </Link>
          <Link
            href={`/configurer?produit=${p.key}`}
            className="btn-rl btn-rl-accent px-5 py-2.5 text-sm"
          >
            Réserver
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
