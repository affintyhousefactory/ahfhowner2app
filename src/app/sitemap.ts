import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Pages légales (noindex) et /viewer (Phase 2, disallow) volontairement
// exclus du sitemap — on n'y déclare que les routes indexables (ADR-018).
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const routes: Array<{ path: string; priority: number }> = [
    { path: "/", priority: 1 },
    { path: "/arko-one", priority: 0.9 },
    { path: "/arko-max", priority: 0.9 },
    { path: "/configurer", priority: 0.8 },
    { path: "/terrain", priority: 0.7 },
    { path: "/contact", priority: 0.6 },
  ];

  return routes.map(({ path, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: "monthly",
    priority,
  }));
}
