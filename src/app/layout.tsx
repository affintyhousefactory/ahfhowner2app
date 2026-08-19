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

// ADR-029 amendée le 2026-08-19 — « studio de jardin » remplace « maison » (accord au masculin).
// Le <h1> du Hero et l'image OG portent encore `BRAND.baseline` : ils relèvent
// du chantier éditorial (lot 1), pas des métadonnées.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "HOWNER — Deux studios de jardin d'architecte, prêts à vivre",
  description:
    "HOWNER : deux studios de jardin d'exception, Arko One (20 m²) et Arko Max (40 m²), livrés prêts à vivre. Fabriqués au Pays-Basque. Découvrir, configurer, réserver.",
  keywords: ["HOWNER", "Arko One", "Arko Max", "studio de jardin", "studio de jardin premium", "Pays-Basque"],
  alternates: { canonical: "/" },
  openGraph: {
    title: "HOWNER — Deux studios de jardin d'architecte, prêts à vivre",
    description:
      "Deux studios de jardin d'exception, Arko One (20 m²) et Arko Max (40 m²), livrés prêts à vivre. Fabriqués au Pays-Basque.",
    type: "website",
    locale: "fr_FR",
    siteName: "HOWNER",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "HOWNER — Deux studios de jardin d'architecte, prêts à vivre",
    description:
      "Deux studios de jardin d'exception, Arko One (20 m²) et Arko Max (40 m²), livrés prêts à vivre. Fabriqués au Pays-Basque.",
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
        {/* Active l'état masqué des révélations (voir globals.css).
            Script inline brut, et non <Script beforeInteractive> : ce dernier
            est différé au bootstrap du runtime Next, donc APRÈS le premier
            paint — le contenu apparaîtrait puis disparaîtrait. Ici le
            navigateur l'exécute pendant l'analyse du HTML, avant de peindre.
            Sans JS, la classe n'est jamais posée : la page reste visible,
            c'est ce qui garantit un HTML indexable. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add("js-motion")`,
          }}
        />
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
