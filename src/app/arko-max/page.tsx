import type { Metadata } from "next";
import { PRODUCTS } from "@/lib/site";
import { ProductHero } from "@/components/site/ProductHero";
import { RevealScrub } from "@/components/site/RevealScrub";
import { Discover } from "@/components/site/Discover";
import { Process } from "@/components/site/Process";
import { Specs } from "@/components/site/Specs";
import { Price } from "@/components/site/Price";
import { Included } from "@/components/site/Included";

export const metadata: Metadata = {
  title: "Arko Max — 40 m² d'architecte | HOWNER",
  description:
    "Arko Max : maison compacte d'architecte de 40 m², livrée prête à vivre. Série 01 — 5 exemplaires numérotés. Fabriquée au Pays-Basque.",
  alternates: { canonical: "/arko-max" },
};

export default function ArkoMaxPage() {
  return (
    <main>
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
