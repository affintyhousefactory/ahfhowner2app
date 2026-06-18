import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// /viewer (Phase 2, disallow) et CGV (placeholder noindex, ADR-015) exclus.
// Mentions légales + confidentialité incluses (contenu réel, indexables).
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const routes: Array<{ path: string; priority: number }> = [
    { path: "/", priority: 1 },
    { path: "/arko-one", priority: 0.9 },
    { path: "/arko-max", priority: 0.9 },
    { path: "/configurer", priority: 0.8 },
    { path: "/terrain", priority: 0.7 },
    { path: "/rechercheterrain", priority: 0.75 },
    { path: "/contact", priority: 0.6 },
    { path: "/mentions-legales", priority: 0.3 },
    { path: "/confidentialite", priority: 0.3 },
  ];

  return routes.map(({ path, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: "monthly",
    priority,
  }));
}
