import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "primerides.in",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: "primerides",
  project: "primerides-web",
});
