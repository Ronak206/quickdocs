import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Empty turbopack config to acknowledge it
  turbopack: {},
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Properly externalize @react-pdf/renderer for SSR
      // This prevents the server from trying to bundle browser-only code
      const existingExternals = Array.isArray(config.externals) 
        ? config.externals 
        : typeof config.externals === 'string' 
          ? [config.externals] 
          : [];
      
      config.externals = [
        ...existingExternals,
        {
          '@react-pdf/renderer': 'commonjs @react-pdf/renderer',
        },
      ];
    }
    return config;
  },
  // Increase the experimental worker memory for build
  experimental: {
    // Enable larger memory for build workers
    workerMemoryLimit: '2048m',
  },
};

export default nextConfig;
