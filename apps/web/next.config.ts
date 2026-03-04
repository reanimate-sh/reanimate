import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@reanimate/ui", "@reanimate/opencode", "@reanimate/e2b"],
};

export default nextConfig;
