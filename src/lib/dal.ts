import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { decryptSession, type SessionPayload } from "@/lib/jwt";
import { readSessionToken } from "@/lib/session";
import { hasRole, type Role } from "@/lib/rbac";

/**
 * Data Access Layer — the authoritative place auth/role checks happen, as close
 * to the data as possible. UI hiding is convenience only; these guards are the
 * real boundary (see docs/security-model.md).
 */

/** Read + decrypt the session cookie. Returns null when unauthenticated. */
export const getSession = cache(async (): Promise<SessionPayload | null> => {
  const token = await readSessionToken();
  return decryptSession(token);
});

/** Require a valid session or redirect to /login. */
export const verifySession = cache(async (): Promise<SessionPayload> => {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
});

/** Load the current user (without the password hash) or redirect to /login. */
export const getCurrentUser = cache(async () => {
  const session = await verifySession();
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.userId),
    columns: { passwordHash: false },
  });
  if (!user) {
    // Session references a user that no longer exists. Cookies can't be modified
    // during a render, so clear it via the logout route handler.
    redirect("/logout");
  }
  return user;
});

export type CurrentUser = Awaited<ReturnType<typeof getCurrentUser>>;

/** Require the current user to hold one of `roles`, else redirect to /dashboard. */
export async function requireRole(...roles: Role[]): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!hasRole(user.role, roles)) redirect("/dashboard");
  return user;
}
