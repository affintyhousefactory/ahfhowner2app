import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { Promesse } from "@/components/site/Promise";
import { RevealScrub } from "@/components/site/RevealScrub";
import { Discover } from "@/components/site/Discover";
import { Process } from "@/components/site/Process";
import { Specs } from "@/components/site/Specs";
import { Price } from "@/components/site/Price";
import { Included } from "@/components/site/Included";
import { Configurator } from "@/components/site/Configurator";
import { LandTool } from "@/components/site/LandTool";
import { AvantPremiere } from "@/components/site/AvantPremiere";
import { Reassurance } from "@/components/site/Reassurance";
import { Reservation } from "@/components/site/Reservation";
import { Faq } from "@/components/site/Faq";
import { Footer } from "@/components/site/Footer";
import { StickyCta } from "@/components/site/StickyCta";
import { ConfigProvider } from "@/components/site/config-store";

export default function Home() {
  return (
    <ConfigProvider>
      <Nav />
      <main>
        <Hero />
        <Promesse />
        <RevealScrub />
        <Discover />
        <Process />
        <Specs />
        <Price />
        <Included />
        <Configurator />
        <LandTool />
        <AvantPremiere />
        <Reassurance />
        <Reservation />
        <Faq />
      </main>
      <Footer />
      <StickyCta />
    </ConfigProvider>
  );
}
