import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { FEATURES } from "@/lib/features";

// /viewer = outil 3D Phase 2 (contenu mince) → hors index. Les pages légales
// portent déjà leur propre noindex via metadata (ADR-018). /admin, /mandataire
// et /onboarding sont déjà noindex par layout/page (auth-gated) ; on les
// exclut aussi ici en défense de crawl-budget. /api n'a rien à indexer.
// ADR-028 — tant que le domaine mandataire est suspendu, /terrains,
// /rechercheterrain et /terrain répondent 404 : on coupe le crawl en amont.
export default function robots(): MetadataRoute.Robots {
  const suspendu = FEATURES.mandataire
    ? []
    : ["/terrains", "/rechercheterrain", "/terrain", "/cgu-mandataire"];

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/viewer", "/admin", "/mandataire", "/onboarding", "/api", ...suspendu],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
