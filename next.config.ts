import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove standalone for Vercel compatibility
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
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [
        ...(config.externals || []),
        "@react-pdf/renderer",
      ];
    }
    return config;
  },
};

export default nextConfig;
