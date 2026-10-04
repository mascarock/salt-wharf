import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  outputFileTracingRoot: process.cwd(),
  env: {
    NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.SANITY_PROJECT_ID || "",
    NEXT_PUBLIC_SANITY_DATASET: process.env.SANITY_DATASET || "production",
  },
  // Fixture mode imports sanity/seed.ndjson as a string, so the worker
  // carries the seed and never reads the filesystem at runtime.
  webpack(config) {
    config.module.rules.push({ test: /\.ndjson$/, type: "asset/source" });
    return config;
  },
};

export default nextConfig;
