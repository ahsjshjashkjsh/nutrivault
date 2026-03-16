import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static.openfoodfacts.org",
      },
    ],
  },
  serverExternalPackages: ["@prisma/client"],
};

export default nextConfig;
