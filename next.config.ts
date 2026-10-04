import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  outputFileTracingRoot: process.cwd(),
  env: {
    NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.SANITY_PROJECT_ID || "",
    NEXT_PUBLIC_SANITY_DATASET: process.env.SANITY_DATASET || "production",
  },
};

export default nextConfig;
