import "server-only";
import { headers } from "next/headers";
import { db } from "@/db";
import { securityEvents, type SecurityEventType } from "@/db/schema";

export interface RequestContext {
  ip: string | null;
  userAgent: string | null;
}

/** Best-effort client IP + user-agent from request headers. */
export async function getRequestContext(): Promise<RequestContext> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || h.get("x-real-ip") || null;
  return { ip, userAgent: h.get("user-agent") };
}

export interface LogEventInput {
  type: SecurityEventType;
  actorId?: string | null;
  targetEmail?: string | null;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
}

/** Append an entry to the unified audit / security event log. */
export async function logSecurityEvent(input: LogEventInput): Promise<void> {
  const { ip, userAgent } = await getRequestContext();
  await db.insert(securityEvents).values({
    type: input.type,
    actorId: input.actorId ?? null,
    targetEmail: input.targetEmail ?? null,
    targetId: input.targetId ?? null,
    ip,
    userAgent,
    metadata: input.metadata,
  });
}
