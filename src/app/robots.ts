import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// /viewer = outil 3D Phase 2 (contenu mince) → hors index. Les pages légales
// portent déjà leur propre noindex via metadata (ADR-018). /admin, /mandataire
// et /onboarding sont déjà noindex par layout/page (auth-gated) ; on les
// exclut aussi ici en défense de crawl-budget. /api n'a rien à indexer.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/viewer", "/admin", "/mandataire", "/onboarding", "/api"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
