import { guardMandataire } from "@/shared/lib/feature-guard";

// ADR-028 — Fiches terrain remontées par les mandataires : domaine suspendu.
// Layout de segment : couvre cette page et toutes ses sous-routes.
export default function TerrainsLayout({ children }: { children: React.ReactNode }) {
  guardMandataire();

  return <>{children}</>;
}
