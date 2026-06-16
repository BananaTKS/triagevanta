import { describe, expect, it } from "vitest";
import {
  detectFailedLoginSpikes,
  type LoginEventLike,
} from "@/lib/security-alerts";

const NOW = new Date("2026-06-16T12:00:00.000Z");

function fail(
  email: string,
  ip: string,
  minutesAgo: number,
  type = "login_failure",
): LoginEventLike {
  return {
    type,
    targetEmail: email,
    ip,
    createdAt: new Date(NOW.getTime() - minutesAgo * 60_000),
  };
}

describe("detectFailedLoginSpikes", () => {
  it("flags a group that meets the threshold within the window", () => {
    const events = Array.from({ length: 5 }, (_, i) => fail("a@x.com", "1.1.1.1", i));
    const alerts = detectFailedLoginSpikes(events, { now: NOW });
    expect(alerts).toHaveLength(1);
    expect(alerts[0].count).toBe(5);
    expect(alerts[0].email).toBe("a@x.com");
    expect(alerts[0].ip).toBe("1.1.1.1");
  });

  it("ignores groups below the threshold", () => {
    const events = Array.from({ length: 4 }, (_, i) => fail("a@x.com", "1.1.1.1", i));
    expect(detectFailedLoginSpikes(events, { now: NOW })).toHaveLength(0);
  });

  it("ignores events outside the time window", () => {
    const events = Array.from({ length: 6 }, (_, i) =>
      fail("a@x.com", "1.1.1.1", 20 + i),
    );
    expect(detectFailedLoginSpikes(events, { now: NOW })).toHaveLength(0);
  });

  it("separates groups by email + ip and sorts busiest first", () => {
    const events = [
      ...Array.from({ length: 6 }, (_, i) => fail("a@x.com", "1.1.1.1", i)),
      ...Array.from({ length: 5 }, (_, i) => fail("b@x.com", "2.2.2.2", i)),
    ];
    const alerts = detectFailedLoginSpikes(events, { now: NOW });
    expect(alerts).toHaveLength(2);
    expect(alerts[0].count).toBe(6);
    expect(alerts[1].count).toBe(5);
  });

  it("ignores non-failure events", () => {
    const events = Array.from({ length: 6 }, (_, i) =>
      fail("a@x.com", "1.1.1.1", i, "login_success"),
    );
    expect(detectFailedLoginSpikes(events, { now: NOW })).toHaveLength(0);
  });
});
