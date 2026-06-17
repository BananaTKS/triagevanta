import { describe, expect, it } from "vitest";
import { isStaleResolved, staleResolvedTicketIds } from "@/lib/stale";

const NOW = new Date("2026-06-17T12:00:00.000Z");
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 24 * 60 * 60 * 1000);

describe("isStaleResolved", () => {
  it("is true for resolved tickets older than the window", () => {
    expect(isStaleResolved("resolved", daysAgo(10), { now: NOW })).toBe(true);
  });

  it("is false for recently resolved tickets", () => {
    expect(isStaleResolved("resolved", daysAgo(3), { now: NOW })).toBe(false);
  });

  it("ignores non-resolved statuses", () => {
    expect(isStaleResolved("open", daysAgo(30), { now: NOW })).toBe(false);
    expect(isStaleResolved("closed", daysAgo(30), { now: NOW })).toBe(false);
  });

  it("honors a custom window", () => {
    expect(isStaleResolved("resolved", daysAgo(4), { now: NOW, days: 3 })).toBe(true);
  });
});

describe("staleResolvedTicketIds", () => {
  it("returns only the stale resolved ids", () => {
    const tickets = [
      { id: "a", status: "resolved", updatedAt: daysAgo(10) },
      { id: "b", status: "resolved", updatedAt: daysAgo(2) },
      { id: "c", status: "open", updatedAt: daysAgo(30) },
      { id: "d", status: "resolved", updatedAt: daysAgo(8) },
    ];
    expect(staleResolvedTicketIds(tickets, { now: NOW })).toEqual(["a", "d"]);
  });
});
