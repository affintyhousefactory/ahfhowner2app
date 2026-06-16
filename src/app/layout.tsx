import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, Space_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/providers/SmoothScroll";

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
  metadataBase: new URL("https://howner.fr"),
  title: "HOWNER · ARKO — Une maison. Réduite. Pas diminuée.",
  description:
    "ARKO : une maison compacte d'architecte de 40 m², livrée prête à vivre. Série 01 — 12 exemplaires numérotés. Découvrir, configurer, réserver.",
  keywords: ["ARKO", "HOWNER", "maison compacte", "maison d'architecte", "40 m²"],
  openGraph: {
    title: "HOWNER · ARKO — Une maison. Réduite. Pas diminuée.",
    description:
      "Une maison compacte d'architecte de 40 m², livrée prête à vivre. Série 01 — 12 exemplaires numérotés.",
    type: "website",
    locale: "fr_FR",
    siteName: "HOWNER",
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
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
