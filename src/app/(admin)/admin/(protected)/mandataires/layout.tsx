import { guardMandataire } from "@/shared/lib/feature-guard";

// ADR-028 — Gestion du réseau de mandataires : domaine suspendu.
// Layout de segment : couvre cette page et toutes ses sous-routes.
export default function MandatairesLayout({ children }: { children: React.ReactNode }) {
  guardMandataire();

  return <>{children}</>;
}
