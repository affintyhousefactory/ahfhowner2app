import { Hero } from "@/components/site/Hero";
import { Promesse } from "@/components/site/Promise";
import { ProductsShowcase } from "@/components/site/ProductsShowcase";
import { Reassurance } from "@/components/site/Reassurance";
import { Faq } from "@/components/site/Faq";
import { StickyCta } from "@/components/site/StickyCta";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqSchema } from "@/lib/jsonld";

export default function Home() {
  return (
    <>
      <JsonLd data={faqSchema()} />
      <main>
        <Hero />
        <Promesse />
        <ProductsShowcase />
        <Reassurance />
        <Faq />
      </main>
      <StickyCta />
    </>
  );
}
