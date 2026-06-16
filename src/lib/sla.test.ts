import { describe, expect, it } from "vitest";
import { computeSlaDueAt, formatSla, isOverdue, SLA_HOURS } from "@/lib/sla";

const HOUR = 60 * 60 * 1000;

describe("computeSlaDueAt", () => {
  it("adds the priority's SLA hours to the start time", () => {
    const from = new Date("2026-01-01T00:00:00.000Z");
    expect(computeSlaDueAt("urgent", from).toISOString()).toBe(
      "2026-01-01T04:00:00.000Z",
    );
    expect(computeSlaDueAt("low", from).getTime() - from.getTime()).toBe(
      SLA_HOURS.low * HOUR,
    );
  });
});

describe("isOverdue", () => {
  const due = new Date("2026-01-01T00:00:00.000Z");

  it("is overdue when the SLA has passed and the ticket is open", () => {
    expect(isOverdue(due, "open", new Date("2026-01-01T01:00:00.000Z"))).toBe(true);
  });

  it("is not overdue before the SLA passes", () => {
    expect(isOverdue(due, "open", new Date("2025-12-31T23:00:00.000Z"))).toBe(
      false,
    );
  });

  it("is never overdue once resolved or closed", () => {
    const later = new Date("2027-01-01T00:00:00.000Z");
    expect(isOverdue(due, "resolved", later)).toBe(false);
    expect(isOverdue(due, "closed", later)).toBe(false);
  });
});

describe("formatSla", () => {
  it("reports resolved tickets", () => {
    expect(formatSla(new Date(), "resolved")).toBe("Resolved");
  });

  it("reports remaining and overdue time", () => {
    const now = new Date("2026-01-01T00:00:00.000Z");
    expect(formatSla(new Date(now.getTime() + 5 * HOUR), "open", now)).toBe(
      "5h left",
    );
    expect(formatSla(new Date(now.getTime() - 2 * HOUR), "open", now)).toBe(
      "Overdue by 2h",
    );
  });
});
