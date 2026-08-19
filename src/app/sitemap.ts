import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { FEATURES } from "@/lib/features";

// /viewer (Phase 2, disallow), /terrain (redirect stub → /rechercheterrain)
// et CGV (placeholder noindex, ADR-015) exclus. cgu-mandataire exclue
// (noindex, réservée aux mandataires). Mentions légales + confidentialité
// incluses (contenu réel, indexables).
// ADR-028 — /rechercheterrain et /terrains renvoient 404 tant que le domaine
// mandataire est suspendu : elles sortent du sitemap pour ne pas déclarer des
// URLs mortes aux moteurs.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const routes: Array<{
    path: string;
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  }> = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    { path: "/studio-jardin-arko-one", priority: 0.9, changeFrequency: "weekly" },
    { path: "/studio-jardin-arko-max", priority: 0.9, changeFrequency: "weekly" },
    { path: "/configurer", priority: 0.8, changeFrequency: "weekly" },
    ...(FEATURES.mandataire
      ? ([
          { path: "/rechercheterrain", priority: 0.75, changeFrequency: "monthly" },
          { path: "/terrains", priority: 0.6, changeFrequency: "daily" },
        ] as const)
      : []),
    { path: "/a-propos", priority: 0.7, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.6, changeFrequency: "monthly" },
    { path: "/mentions-legales", priority: 0.3, changeFrequency: "yearly" },
    { path: "/confidentialite", priority: 0.3, changeFrequency: "yearly" },
  ];

  return routes.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
