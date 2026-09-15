import type { NextConfig } from "next";
const config: NextConfig = {
  poweredByHeader: false,
  logging: {
    // Development access logs must not print verification/recovery URL tokens.
    incomingRequests: {
      ignore: [/^\/api\/auth(?:\/|$)/, /^\/api\/account(?:\/|$)/, /^\/reset-password(?:\?|$)/],
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.gamebanana.com", pathname: "/**" },
    ],
    unoptimized: true,
  },
  devIndicators: false,
};
export default config;
