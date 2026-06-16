import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the database drivers as external node modules instead of bundling them.
  // `pg` is used in production (Docker/Neon Postgres); `@electric-sql/pglite` is
  // the zero-dependency embedded Postgres used for local development.
  serverExternalPackages: ["pg", "@electric-sql/pglite"],
};

export default nextConfig;
