import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.dicebear.com" },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: "knight-t6",
  project: "knight-dashboard",
});
