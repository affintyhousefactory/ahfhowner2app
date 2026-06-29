import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portail Mandataire — HOWNER",
  description: "Espace réservé aux mandataires partenaires Affinity House Factory.",
  robots: "noindex, nofollow",
};

export default function MandataireRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
