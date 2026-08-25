import type { Metadata } from "next";
import { PRODUCTS, SERIE_TOTAL } from "@/lib/site";
import { JsonLd } from "@/components/seo/JsonLd";
import { productSchema } from "@/lib/jsonld";
import { HeroHeureBleue } from "@/components/produit/HeroHeureBleue";
import { ChiffresHeureBleue } from "@/components/produit/ChiffresHeureBleue";
import { BarreActionMobile } from "@/components/produit/BarreActionMobile";
import {
  BandeauSerie,
  SectionAtelier,
  SectionCloture,
  SectionDurable,
  SectionEtapes,
  SectionTension,
  SectionVisite,
} from "@/components/produit/SectionsHeureBleue";
import { contenuProduit } from "@/lib/produits/heure-bleue";

export const metadata: Metadata = {
  title: "Studio de jardin 40 m² — Arko Max | HOWNER",
  description: `Arko Max : studio de jardin d'architecte de 40 m² (T2), livré prêt à vivre. Édition Arko — ${SERIE_TOTAL} exemplaires numérotés. Fabriqué au Pays-Basque.`,
  alternates: { canonical: "/studio-jardin-arko-max" },
};

/**
 * Page produit Arko Max — direction « Heure bleue » (ADR-040).
 *
 * Même structure que l'Arko One, à dessein : c'est ce qui fait qu'on reconnaît
 * une page produit Howner d'une gamme à l'autre. Ce qui diffère est le contenu
 * (`src/lib/produits/heure-bleue.ts`), pas la mise en page.
 */
export default function ArkoMaxPage() {
  const c = contenuProduit("max");

  return (
    <main className="bg-[#0f1519] text-[#e8ebee]">
      <JsonLd data={productSchema(PRODUCTS.max)} />
      <HeroHeureBleue produit="max" />
      <BandeauSerie produit="max" />
      <SectionTension produit="max" />
      <SectionEtapes produit="max" />
      <ChiffresHeureBleue chiffres={c.chiffres} />
      <SectionVisite produit="max" />
      <SectionAtelier produit="max" />
      <SectionDurable produit="max" />
      <SectionCloture produit="max" />
      <BarreActionMobile produit="max" />
    </main>
  );
}
