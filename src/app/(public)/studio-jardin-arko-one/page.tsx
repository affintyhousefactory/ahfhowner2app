import type { Metadata } from "next";
import { PRODUCTS, SERIE_TOTAL } from "@/lib/site";
import { JsonLd } from "@/components/seo/JsonLd";
import { productSchema } from "@/lib/jsonld";
import { ProductHero } from "@/components/site/ProductHero";
import { RevealScrub } from "@/components/site/RevealScrub";
import { Discover } from "@/components/site/Discover";
import { AvantPremiere } from "@/components/site/AvantPremiere";

export const metadata: Metadata = {
  title: "Studio de jardin 20 m² — Arko One | HOWNER",
  description: `Arko One : studio de jardin d'architecte de 20 m², livré prêt à vivre. Série 01 — ${SERIE_TOTAL} exemplaires numérotés. Fabriqué au Pays-Basque.`,
  alternates: { canonical: "/studio-jardin-arko-one" },
};

export default function ArkoOnePage() {
  return (
    <main>
      <JsonLd data={productSchema(PRODUCTS.one)} />
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
