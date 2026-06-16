import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Livraison images optimisées (invisible côté rendu)
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
  },
};

export default nextConfig;
