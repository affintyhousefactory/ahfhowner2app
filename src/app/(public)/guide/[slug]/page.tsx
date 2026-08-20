import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GUIDES } from "@/lib/pages/contenu/guides";
import { pageParRoute } from "@/lib/pages/registry";
import { JsonLd } from "@/components/seo/JsonLd";
import { articleSchema, faqPageSchema } from "@/lib/jsonld";
import { ArticleGuide } from "@/components/editorial/ArticleGuide";

/* Les neuf guides partagent une structure identique : une route dynamique et
   un gabarit, plutôt que neuf pages jumelles qui auraient divergé sur la
   hiérarchie des titres — la première chose qu'un moteur lit.

   `generateStaticParams` les prérend tous : ce sont des pages statiques, sans
   donnée ni appel externe. `dynamicParams = false` fait répondre 404 à tout
   slug hors liste, plutôt que de rendre une page vide.

   Date de publication : les guides sont mis en ligne avec ce lot. La reprendre
   d'une constante plutôt que de `Date.now()` — une date de publication qui
   change à chaque build dit à un moteur que l'article est réécrit en
   permanence. */
const PUBLIE_LE = "2026-08-20";

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.route.replace("/guide/", "") }));
}

function guidePourSlug(slug: string) {
  return GUIDES.find((g) => g.route === `/guide/${slug}`);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = guidePourSlug(slug);
  if (!guide) return {};
  return {
    title: guide.metaTitle,
    description: guide.metaDescription,
    alternates: { canonical: guide.route },
  };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = guidePourSlug(slug);
  if (!guide) notFound();

  const page = pageParRoute(guide.route);
  if (!page) notFound();

  return (
    <>
      <JsonLd data={articleSchema(page, { publieLe: PUBLIE_LE })} />
      {/* `FAQPage` seulement là où une FAQ est réellement rendue (ADR-038 §6). */}
      {guide.faq ? <JsonLd data={faqPageSchema(guide.faq)} /> : null}
      <ArticleGuide guide={guide} />
    </>
  );
}
