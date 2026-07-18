import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  // Left external so OpenNext's Workers bundling step (which applies the
  // "workerd" export condition) resolves Prisma's wasm client, instead of
  // Next's own webpack build baking in the Node.js binary-engine entry point.
  serverExternalPackages: ["@prisma/client", ".prisma/client"],
};

export default nextConfig;

initOpenNextCloudflareForDev();
