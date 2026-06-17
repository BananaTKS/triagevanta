import { createRequire } from "node:module";
import * as schema from "../src/db/schema.ts";
import { staleResolvedTicketIds } from "../src/lib/stale.ts";

// Closes tickets that have sat in "resolved" longer than AUTO_CLOSE_DAYS (7 by
// default). Intended to be run on a schedule (cron / GitHub Actions / Task
// Scheduler). Uses the same driver selection as the app.
const require = createRequire(import.meta.url);

function makeDb() {
  const url = process.env.DATABASE_URL;
  if (url) {
    const { drizzle } = require("drizzle-orm/node-postgres");
    const { Pool } = require("pg");
    const pool = new Pool({
      connectionString: url,
      ssl: url.includes("sslmode=require") ? { rejectUnauthorized: false } : undefined,
    });
    return { db: drizzle(pool, { schema }), close: () => pool.end() };
  }
  const { drizzle } = require("drizzle-orm/pglite");
  const { PGlite } = require("@electric-sql/pglite");
  const client = new PGlite(process.env.PGLITE_PATH ?? ".pglite");
  return { db: drizzle(client, { schema }), close: () => client.close() };
}

async function main() {
  const days = Number(process.env.AUTO_CLOSE_DAYS ?? "7");
  const { eq, inArray } = require("drizzle-orm");
  const { db, close } = makeDb();

  const resolved = await db
    .select({
      id: schema.tickets.id,
      status: schema.tickets.status,
      updatedAt: schema.tickets.updatedAt,
    })
    .from(schema.tickets)
    .where(eq(schema.tickets.status, "resolved"));

  const ids = staleResolvedTicketIds(resolved, { days });
  if (ids.length > 0) {
    await db
      .update(schema.tickets)
      .set({ status: "closed", updatedAt: new Date() })
      .where(inArray(schema.tickets.id, ids));
  }

  await close();
  console.log(
    `Auto-closed ${ids.length} resolved ticket(s) idle for more than ${days} day(s).`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
