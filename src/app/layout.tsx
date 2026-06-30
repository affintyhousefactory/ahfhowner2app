import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, Space_Mono } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/site";

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});
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
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-lg focus:bg-[#7469F4] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
        >
          Aller au contenu principal
        </a>
        {children}
      </body>
    </html>
  );
}
