import { Hero } from "@/components/site/Hero";
import { Promesse } from "@/components/site/Promise";
import { ProductsShowcase } from "@/components/site/ProductsShowcase";
import { Reassurance } from "@/components/site/Reassurance";
import { Faq } from "@/components/site/Faq";
import { StickyCta } from "@/components/site/StickyCta";

export default function Home() {
  return (
    <>
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
