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
};

export default nextConfig;
