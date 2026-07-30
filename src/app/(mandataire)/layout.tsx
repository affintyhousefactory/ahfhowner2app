import type { Metadata } from "next";
import { guardMandataire } from "@/shared/lib/feature-guard";

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
  // ADR-028 — domaine suspendu : ce layout couvre la landing `/mandataire`,
  // l'auth (signin/signup/forgot/reset) et tout le groupe `(protected)`.
  guardMandataire();

  return <>{children}</>;
}
