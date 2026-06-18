import { describe, expect, it } from "vitest";
import { createRateLimiter } from "@/lib/rate-limit";

describe("createRateLimiter", () => {
  it("allows up to the limit then blocks within the window", () => {
    const check = createRateLimiter({ limit: 3, windowMs: 1000 });
    expect(check("ip", 0).allowed).toBe(true);
    expect(check("ip", 100).allowed).toBe(true);
    expect(check("ip", 200).allowed).toBe(true);
    const blocked = check("ip", 300);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterMs).toBe(700);
  });

  it("resets after the window elapses", () => {
    const check = createRateLimiter({ limit: 2, windowMs: 1000 });
    check("ip", 0);
    check("ip", 0);
    expect(check("ip", 0).allowed).toBe(false);
    expect(check("ip", 1000).allowed).toBe(true);
  });

  it("tracks keys independently", () => {
    const check = createRateLimiter({ limit: 1, windowMs: 1000 });
    expect(check("a", 0).allowed).toBe(true);
    expect(check("b", 0).allowed).toBe(true);
    expect(check("a", 0).allowed).toBe(false);
  });
});
