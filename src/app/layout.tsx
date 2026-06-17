import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, Space_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/providers/SmoothScroll";
import { ConfigProvider } from "@/components/site/config-store";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { CountdownBanner } from "@/components/site/CountdownBanner";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/site";
import { organizationSchema } from "@/lib/jsonld";

// Display « suisse » (titres magistraux) — pairing B (ui-ux-pro-max)
const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
// Texte courant net
const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});
// Légendes / labels
const mono = Space_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "HOWNER — Une maison compacte faite pour vous",
  description:
    "HOWNER : deux maisons compactes d'architecte, Arko One (20 m²) et Arko Max (40 m²), livrées prêtes à vivre. Fabriquées au Pays-Basque. Découvrir, configurer, réserver.",
  keywords: ["HOWNER", "Arko One", "Arko Max", "maison compacte", "maison d'architecte", "Pays-Basque"],
  alternates: { canonical: "/" },
  openGraph: {
    title: "HOWNER — Une maison compacte faite pour vous",
    description:
      "Deux maisons compactes d'architecte, Arko One (20 m²) et Arko Max (40 m²), livrées prêtes à vivre. Fabriquées au Pays-Basque.",
    type: "website",
    locale: "fr_FR",
    siteName: "HOWNER",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "HOWNER — Une maison compacte faite pour vous",
    description:
      "Deux maisons compactes d'architecte, Arko One (20 m²) et Arko Max (40 m²), livrées prêtes à vivre. Fabriquées au Pays-Basque.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#f4f1ea",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      className={`${display.variable} ${sans.variable} ${mono.variable} antialiased`}
    >
      <body>
        <JsonLd data={organizationSchema()} />
        <SmoothScroll>
          <ConfigProvider>
            <CountdownBanner />
            <Nav />
            {children}
            <Footer />
          </ConfigProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
