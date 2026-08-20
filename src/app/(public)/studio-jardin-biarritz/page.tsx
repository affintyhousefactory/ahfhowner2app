import type { Metadata } from "next";
import { PAGES_LOCALES } from "@/lib/pages/contenu/locales";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqPageSchema } from "@/lib/jsonld";
import { PageLocaleView } from "@/components/editorial/PageLocaleView";

/* Page locale — ADR-038, lot 4. Contenu dans
   `src/lib/pages/contenu/locales.ts` ; gabarit et socle commun dans
   `PageLocaleView`. Quatre routes distinctes plutôt qu'un segment dynamique :
   ces slugs vivent à la racine, un `[ville]` y capterait tout le reste. */

const ROUTE = "/studio-jardin-biarritz";
const contenu = PAGES_LOCALES.find((p) => p.route === ROUTE)!;

export const metadata: Metadata = {
  title: contenu.metaTitle,
  description: contenu.metaDescription,
  alternates: { canonical: ROUTE },
};

export default function StudioJardinBiarritzPage() {
  return (
    <>
      {contenu.faq ? <JsonLd data={faqPageSchema(contenu.faq)} /> : null}
      <PageLocaleView page={contenu} />
    </>
  );
}
