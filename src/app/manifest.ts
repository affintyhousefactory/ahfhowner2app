import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HOWNER — Studio de jardin d'architecte",
    short_name: "HOWNER",
    description:
      "Découvrir, configurer et réserver Arko One ou Arko Max. Studios de jardin d'exception fabriqués au Pays-Basque.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f1ea",
    theme_color: "#f4f1ea",
    lang: "fr",
    /* Icônes d'installation — écran d'accueil Android, fenêtre d'application.
       Elles ne sont PAS le favicon : celui-ci vit dans `src/app/favicon.ico` et
       `icon.png`, servis par la convention de fichiers de Next sur une URL
       calculée. Le manifeste, lui, exige des chemins stables — d'où `public/`.
       Le tableau était vide : une installation n'affichait aucune icône. */
    icons: [
      { src: "/icons/howner-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/howner-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
