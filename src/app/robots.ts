import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// /viewer = outil 3D Phase 2 (contenu mince) → hors index. Les pages légales
// portent déjà leur propre noindex via metadata (ADR-018).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/viewer",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
