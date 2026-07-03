/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    // Client-side router cache: navigating back to recent pages is instant
    staleTimes: {
      dynamic: 60,   // dynamic pages cached for 60 seconds
      static: 300,   // static pages cached for 5 minutes
    },
    // Tree-shake barrel exports for faster builds & smaller bundles
    optimizePackageImports: [
      "@untitledui/icons",
      "lucide-react",
      "recharts",
      "date-fns",
      "react-aria-components",
      "react-aria",
    ],
    turbopack: {
      root: ".",
    },
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;

