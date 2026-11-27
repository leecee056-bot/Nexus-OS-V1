import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@electric-sql/pglite", "pg"],
  async rewrites() {
    // Serve the self-contained hub tutorial at /demo (public/demo/index.html)
    return [
      { source: "/demo", destination: "/demo/index.html" },
      { source: "/demo/", destination: "/demo/index.html" },
      { source: "/companion", destination: "/companion/index.html" },
      { source: "/companion/", destination: "/companion/index.html" },
    ];
  },
  // Hosted deploy was attaching Content-Disposition on some image routes,
  // which shows blank / broken icons in browsers. Force inline image types.
  async headers() {
    return [
      {
        source: "/brand/:path*",
        headers: [
          { key: "Content-Disposition", value: "inline" },
          { key: "Cache-Control", value: "public, max-age=86400, immutable" },
        ],
      },
      {
        source: "/images/:path*",
        headers: [
          { key: "Content-Disposition", value: "inline" },
          { key: "Cache-Control", value: "public, max-age=86400, immutable" },
        ],
      },
      {
        source: "/demo/shots/:path*",
        headers: [
          { key: "Content-Disposition", value: "inline" },
          { key: "Cache-Control", value: "public, max-age=86400, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
