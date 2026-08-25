"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { PRODUCT_LIST, reserverHref, type Product } from "@/lib/site";
import { Reveal } from "@/components/ui/Reveal";
import { useTilt } from "@/components/effects/useTilt";
import { Button, Arrow } from "@/components/ui/Button";
import { contenuProduit } from "@/lib/produits/heure-bleue";

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
          <h2 className="titre-xl mt-12 text-ink md:mt-16 md:whitespace-nowrap">
            Deux studios, un même soin.
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
      {/* Le visuel vient de `contenuProduit(...)`, la source qu'utilise la page
          de détail : les deux ne peuvent pas diverger. Il remplace une vidéo en
          lecture automatique — deux vidéos qui tournent en fond sur l'accueil
          coûtaient plus qu'elles ne montraient. */}
      <div className="relative aspect-video w-full overflow-hidden bg-nuit">
        <Image
          src={contenuProduit(p.key).hero.src}
          alt={contenuProduit(p.key).hero.alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col p-6 md:p-8">
        <div className="flex items-baseline justify-between">
          <h3 className="titre-m text-ink">{p.name}</h3>
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
          <Button href={p.slug} variant="outline" size="sm" magnetic={false}>
            Découvrir
          </Button>
          <Button href={reserverHref(p.key)} size="sm" magnetic={false}>
            Réserver
            <Arrow />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
