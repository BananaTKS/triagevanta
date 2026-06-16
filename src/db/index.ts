import { createRequire } from "node:module";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

// Single exported database type. Both drivers expose the same query API for the
// operations this app uses, so the embedded PGlite handle is presented under the
// node-postgres type for clean, uniform typing in app code.
export type DB = NodePgDatabase<typeof schema>;

const require = createRequire(import.meta.url);

const globalForDb = globalThis as unknown as { __tvDb?: DB };

function createDb(): DB {
  const url = process.env.DATABASE_URL;

  if (url) {
    // Production / Docker / Neon: real PostgreSQL over TCP.
    const { drizzle } = require("drizzle-orm/node-postgres");
    const { Pool } = require("pg");
    const pool = new Pool({
      connectionString: url,
      max: 5,
      // Neon and most managed Postgres require TLS; local Docker does not.
      ssl: url.includes("sslmode=require") ? { rejectUnauthorized: false } : undefined,
    });
    return drizzle(pool, { schema });
  }

  // Local development: embedded Postgres (PGlite) — no Docker required.
  // Persists to ./.pglite so data survives dev-server restarts.
  const { drizzle } = require("drizzle-orm/pglite");
  const { PGlite } = require("@electric-sql/pglite");
  const client = new PGlite(process.env.PGLITE_PATH ?? ".pglite");
  return drizzle(client, { schema }) as unknown as DB;
}

// Reuse a single connection across HMR reloads in development.
function getDb(): DB {
  return (globalForDb.__tvDb ??= createDb());
}

// Lazily connect on first use. This keeps `import { db }` cheap so that build-time
// prerendering of pages that never query (e.g. /login) does not open a database
// connection — important for the embedded PGlite driver, which cannot be opened
// by several build workers on the same data directory at once.
export const db: DB = new Proxy({} as DB, {
  get(_target, prop) {
    const real = getDb() as unknown as Record<PropertyKey, unknown>;
    const value = real[prop];
    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(real)
      : value;
  },
});

export { schema };
