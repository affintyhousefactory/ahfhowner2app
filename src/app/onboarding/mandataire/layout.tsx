import type { Metadata } from "next";
import { guardMandataire } from "@/shared/lib/feature-guard";

export const metadata: Metadata = {
  title: "Onboarding Mandataire — HOWNER",
  robots: "noindex, nofollow",
};

// ADR-028 — domaine suspendu. Layout serveur dédié : la page d'onboarding est
// un composant client, la garde est donc posée ici pour couper avant tout
// rendu (et avant la validation du token d'invitation).
export default function OnboardingMandataireLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  guardMandataire();

  return <>{children}</>;
}
