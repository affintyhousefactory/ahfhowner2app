import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RSE } from "@/lib/pages/contenu/rse";
import { pageParRoute } from "@/lib/pages/registry";
import { JsonLd } from "@/components/seo/JsonLd";
import { articleSchema, faqPageSchema } from "@/lib/jsonld";
import { DemarcheRse } from "@/components/editorial/DemarcheRse";

/**
 * `/guide/demarche-rse-howner` — route **statique**, sœur de `/guide/[slug]`.
 *
 * Next sert une route statique avant une route dynamique de même niveau : ce
 * fichier prend donc la main sans que `[slug]` ait à connaître son existence.
 * C'est voulu — cette page n'est pas un article du Guide au sens du gabarit
 * (voir `DemarcheRse.tsx`), et l'inscrire dans `GUIDES` l'aurait fait rendre
 * par `ArticleGuide`.
 *
 * Le registre, lui, la connaît : c'est de lui que viennent le `<h1>`, le
 * libellé du fil d'Ariane et le statut qui décide de sa présence au sitemap
 * (ADR-038).
 */

const page = pageParRoute(RSE.route);

/* Date de publication reprise d'une constante et non de `Date.now()` : une
   date qui change à chaque build dit à un moteur que l'article est réécrit en
   permanence. Même règle que les neuf guides. */
const PUBLIE_LE = "2026-09-07";

export const metadata: Metadata = {
  title: RSE.metaTitle,
  description: RSE.metaDescription,
  alternates: { canonical: RSE.route },
};

export default function DemarcheRsePage() {
  /* Le registre est la seule source de routes (ADR-038) : si l'entrée
     disparaît, la page ne se sert pas d'elle-même en silence. */
  if (!page) notFound();

  return (
    <>
      <JsonLd data={articleSchema(page, { publieLe: PUBLIE_LE })} />
      <JsonLd data={faqPageSchema(RSE.faq)} />
      <DemarcheRse />
    </>
  );
}
