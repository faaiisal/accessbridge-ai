import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Keep the scan engine unbundled: @axe-core/playwright injects axe-core
  // source into the browser via page.evaluate, which breaks when minified
  // into the route bundle (ReferenceError at runtime).
  serverExternalPackages: ["playwright", "playwright-core", "@axe-core/playwright", "axe-core"],
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
