import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Reduce memory usage in dev
  experimental: {
    // Limit parallel compilation workers
    workerThreads: false,
  },
  // Optimize image handling
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
