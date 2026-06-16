import { createRequire } from "node:module";

// Applies SQL migrations from ./drizzle to the active database.
// Uses node-postgres when DATABASE_URL is set, otherwise the embedded PGlite.
const require = createRequire(import.meta.url);
const MIGRATIONS_FOLDER = "drizzle";

async function main() {
  const url = process.env.DATABASE_URL;

  if (url) {
    const { drizzle } = require("drizzle-orm/node-postgres");
    const { migrate } = require("drizzle-orm/node-postgres/migrator");
    const { Pool } = require("pg");
    const pool = new Pool({
      connectionString: url,
      ssl: url.includes("sslmode=require")
        ? { rejectUnauthorized: false }
        : undefined,
    });
    await migrate(drizzle(pool), { migrationsFolder: MIGRATIONS_FOLDER });
    await pool.end();
    console.log("Migrations applied to Postgres.");
    return;
  }

  const { drizzle } = require("drizzle-orm/pglite");
  const { migrate } = require("drizzle-orm/pglite/migrator");
  const { PGlite } = require("@electric-sql/pglite");
  const client = new PGlite(process.env.PGLITE_PATH ?? ".pglite");
  await migrate(drizzle(client), { migrationsFolder: MIGRATIONS_FOLDER });
  await client.close();
  console.log("Migrations applied to embedded PGlite (.pglite).");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
