import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@/db/schema";

// Pure JWT helpers (no server-only / next-headers imports) so they can be used
// from the proxy (middleware) runtime for optimistic auth checks.

export const SESSION_COOKIE = "tv_session";
const ALG = "HS256";

export interface SessionPayload {
  userId: string;
  role: Role;
}

function getKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set and at least 32 characters long.");
  }
  return new TextEncoder().encode(secret);
}

export async function encryptSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getKey());
}

export async function decryptSession(
  token?: string,
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getKey(), { algorithms: [ALG] });
    if (typeof payload.userId === "string" && typeof payload.role === "string") {
      return { userId: payload.userId, role: payload.role as Role };
    }
    return null;
  } catch {
    return null;
  }
}
