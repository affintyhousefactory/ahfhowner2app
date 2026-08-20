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
          {/* Barre d'en-tête — seul élément fixé. Le bandeau de série et le
              menu y sont empilés : si le bandeau s'efface (série échue), le
              menu remonte au bord haut sans qu'aucune valeur ne soit à
              corriger. */}
          <div className="fixed inset-x-0 top-0 z-50">
            <CountdownBanner />
            <Nav />
          </div>
          <main id="main-content">{children}</main>
          <Footer />
          <CookieBanner />
        </ConfigProvider>
      </SmoothScroll>
    </>
  );
}
