import { redirect } from "next/navigation";
import { guardMandataire } from "@/shared/lib/feature-guard";

// Stub historique : `/terrain` renvoyait vers `/rechercheterrain`. Les deux
// sont suspendues (ADR-028) — 404 tant que le flag est off. Les CTA « Tester
// mon terrain » pointent désormais sur `/configurer`, où vit l'analyse PLU.
export default function TerrainRedirect() {
  guardMandataire();

  redirect("/rechercheterrain");
}
