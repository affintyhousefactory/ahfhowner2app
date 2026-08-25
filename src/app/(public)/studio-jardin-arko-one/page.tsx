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
  title: "Studio de jardin 20 m² — Arko One | HOWNER",
  /* « Série 01 » → « Édition Arko » (2026-08-25) : le libellé a changé dans le
     configurateur, et une métadonnée qui dit autre chose que la page est une
     seconde vérité de plus. */
  description: `Arko One : studio de jardin d'architecte de 20 m², livré prêt à vivre. Édition Arko — ${SERIE_TOTAL} exemplaires numérotés. Fabriqué au Pays-Basque.`,
  alternates: { canonical: "/studio-jardin-arko-one" },
};

/**
 * Page produit Arko One — direction « Heure bleue » (ADR-040).
 *
 * Fond sombre de bout en bout. **Ni l'en-tête ni le pied de page ne sont
 * repris** : la barre porte un fond clair permanent depuis le 2026-08-20 et le
 * pied de page est déjà en `bg-ink`. Vérifié en production sur `/guide`, qui
 * ouvre déjà sur un hero sombre sous cette même barre.
 */
export default function ArkoOnePage() {
  const c = contenuProduit("one");

  return (
    <main className="bg-nuit text-nuit-texte">
      <JsonLd data={productSchema(PRODUCTS.one)} />
      <HeroHeureBleue produit="one" />
      <BandeauSerie produit="one" />
      <SectionTension produit="one" />
      <SectionEtapes produit="one" />
      <ChiffresHeureBleue chiffres={c.chiffres} />
      <SectionVisite produit="one" />
      <SectionAtelier produit="one" />
      <SectionDurable produit="one" />
      <SectionCloture produit="one" />
      <BarreActionMobile produit="one" />
    </main>
  );
}
