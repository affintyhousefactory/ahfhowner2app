import type { Metadata } from "next";
import { PRODUCTS } from "@/lib/site";
import { ProductHero } from "@/components/site/ProductHero";
import { RevealScrub } from "@/components/site/RevealScrub";
import { Discover } from "@/components/site/Discover";
import { AvantPremiere } from "@/components/site/AvantPremiere";

export const metadata: Metadata = {
  title: "Arko One — 20 m² d'architecte | HOWNER",
  description:
    "Arko One : maison compacte d'architecte de 20 m², livrée prête à vivre. Série 01 — 12 exemplaires numérotés. Fabriquée au Pays-Basque.",
};

export default function ArkoOnePage() {
  return (
    <main>
      <ProductHero product={PRODUCTS.one} />
      {/* Scroll-scrub : on entre dans le modèle Arko One (visuel provisoire). */}
      <RevealScrub scrub={PRODUCTS.one.scrub} poster={PRODUCTS.one.scrubPoster} />
      {/* #decouvrir repris de l'accueil */}
      <Discover />
      {/* Section Avant-première déplacée ici (ex-009) */}
      <AvantPremiere />
    </main>
  );
}
