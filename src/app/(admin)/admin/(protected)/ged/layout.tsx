import { guardMandataire } from "@/shared/lib/feature-guard";

// ADR-028 — GED des dossiers mandataire : domaine suspendu.
// Layout de segment : couvre cette page et toutes ses sous-routes.
export default function GedLayout({ children }: { children: React.ReactNode }) {
  guardMandataire();

  return <>{children}</>;
}
