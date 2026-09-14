import type { NextConfig } from "next";
const config: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.gamebanana.com", pathname: "/**" },
    ],
    unoptimized: true,
  },
  devIndicators: false,
};
export default config;
