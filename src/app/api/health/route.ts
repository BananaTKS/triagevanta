import { sql } from "drizzle-orm";
import { db } from "@/db";

// GET /api/health — liveness + database connectivity check for monitoring.
export async function GET() {
  let database = true;
  try {
    await db.execute(sql`select 1`);
  } catch {
    database = false;
  }

  return Response.json(
    { status: database ? "ok" : "degraded", database, timestamp: new Date().toISOString() },
    { status: database ? 200 : 503 },
  );
}
