import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const devOrigin = process.env.ALLOWED_DEV_ORIGIN;

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // Origin preview Cloud hanya dipakai saat pengembangan lokal.
  allowedDevOrigins: devOrigin ? [devOrigin] : [],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

// Binding D1/R2 Cloudflare untuk `next dev` (bukan untuk build produksi).
if (process.env.NODE_ENV !== "production") {
  initOpenNextCloudflareForDev({ configPath: "./freebuff.wrangler.jsonc" });
}
