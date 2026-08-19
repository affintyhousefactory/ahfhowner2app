import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Livraison images optimisées (invisible côté rendu)
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
  },
  // WSL2 : inotify non fiable sur /mnt/d (NTFS) — polling toutes les 500 ms
  watchOptions: {
    pollIntervalMs: 500,
  },

  /**
   * Renommage des pages produit — 2026-08-19, repositionnement « studio de
   * jardin » (ADR-029 § Amendement).
   *
   * `/arko-one` et `/arko-max` sont **indexées depuis juin** : elles sont au
   * sitemap, portent un canonical auto-référent et un JSON-LD `Product`, et
   * elles ont accumulé de l'historique côté moteurs. Les renommer sans
   * redirection reviendrait à jeter ce capital et à servir un 404 à tout lien
   * entrant — externe comme interne (un signet, un email, une capture).
   *
   * `permanent: true` émet un **308**, que Google traite comme un 301 : le
   * signal de classement est transféré vers la nouvelle URL. Un 307/302 ne
   * l'aurait pas fait — il dit « revenez ici plus tard », donc les moteurs
   * gardent l'ancienne adresse en index.
   *
   * ⚠ Ces deux règles ne s'enlèvent pas. Les anciennes URL peuvent rester
   * référencées ailleurs pendant des années ; une redirection permanente ne
   * coûte rien à servir.
   */
  async redirects() {
    return [
      {
        source: "/arko-one",
        destination: "/studio-jardin-arko-one",
        permanent: true,
      },
      {
        source: "/arko-max",
        destination: "/studio-jardin-arko-max",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
