import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@electric-sql/pglite", "pg"],
  async rewrites() {
    // Serve the self-contained hub tutorial at /demo (public/demo/index.html)
    return [
      { source: "/demo", destination: "/demo/index.html" },
      { source: "/demo/", destination: "/demo/index.html" },
    ];
  },
};

export default nextConfig;
