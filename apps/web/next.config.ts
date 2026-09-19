import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["@novalot/shared"],
  turbopack: {
    root: path.join(__dirname, "../.."), // -> novalot/
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        pathname: "/Bekas/**",
      },
    ],
  },
};

export default nextConfig;