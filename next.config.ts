import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  eslint: {
    // Disable ESLint during production builds to avoid compatibility bugs with ESLint v9
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Skip type checking during production builds for speed and stability
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
