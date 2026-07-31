import { guardMandataire } from "@/shared/lib/feature-guard";

// ADR-028 — Leads en attente d'affectation à un mandataire : domaine suspendu.
// Layout de segment : couvre cette page et toutes ses sous-routes.
export default function AffectationsLayout({ children }: { children: React.ReactNode }) {
  guardMandataire();

  return <>{children}</>;
}
