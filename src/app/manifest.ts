import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HOWNER — Maison compacte d'architecte",
    short_name: "HOWNER",
    description:
      "Découvrir, configurer et réserver Arko One ou Arko Max. Maisons compactes d'architecte fabriquées au Pays-Basque.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f1ea",
    theme_color: "#f4f1ea",
    lang: "fr",
    icons: [],
  };
}
