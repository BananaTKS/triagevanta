import { defineConfig } from "drizzle-kit";

// Used by `drizzle-kit generate` to produce SQL migrations from the schema.
// Migrations are applied programmatically (see src/db/migrate.mts) so they work
// against both the embedded PGlite dev database and a real Postgres server.
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
});
