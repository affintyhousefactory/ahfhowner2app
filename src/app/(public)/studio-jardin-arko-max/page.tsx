import type { Metadata } from "next";
import { PRODUCTS, SERIE_TOTAL } from "@/lib/site";
import { JsonLd } from "@/components/seo/JsonLd";
import { productSchema } from "@/lib/jsonld";
import { ProductHero } from "@/components/site/ProductHero";
import { RevealScrub } from "@/components/site/RevealScrub";
import { Discover } from "@/components/site/Discover";
import { Process } from "@/components/site/Process";
import { Specs } from "@/components/site/Specs";
import { Price } from "@/components/site/Price";
import { Included } from "@/components/site/Included";

export const metadata: Metadata = {
  title: "Studio de jardin 40 m² — Arko Max | HOWNER",
  description: `Arko Max : studio de jardin d'architecte de 40 m² (T2), livré prêt à vivre. Série 01 — ${SERIE_TOTAL} exemplaires numérotés. Fabriqué au Pays-Basque.`,
  alternates: { canonical: "/studio-jardin-arko-max" },
};

export default function ArkoMaxPage() {
  return (
    <main>
      <JsonLd data={productSchema(PRODUCTS.max)} />
      <ProductHero product={PRODUCTS.max} backdrop="grid" />
      <RevealScrub scrub={PRODUCTS.max.scrub} poster={PRODUCTS.max.scrubPoster} />
      <Discover />
      <Process />
      <Specs />
      <Price />
      <Included />
    </main>
  );
}
