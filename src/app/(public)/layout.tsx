import SmoothScroll from "@/components/providers/SmoothScroll";
import { ConfigProvider } from "@/components/site/config-store";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { CountdownBanner } from "@/components/site/CountdownBanner";
import { JsonLd } from "@/components/seo/JsonLd";
import { CookieBanner } from "@/components/site/CookieBanner";
import { Analytics } from "@/components/site/Analytics";
import { organizationSchema } from "@/lib/jsonld";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={organizationSchema()} />
      <Analytics />
      <SmoothScroll>
        <ConfigProvider>
          <CountdownBanner />
          <Nav />
          {children}
          <Footer />
          <CookieBanner />
        </ConfigProvider>
      </SmoothScroll>
    </>
  );
}
