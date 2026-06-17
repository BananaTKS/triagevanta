import { describe, expect, it } from "vitest";
import { categorizeTicket } from "@/lib/categorize";

describe("categorizeTicket", () => {
  it("detects network issues", () => {
    expect(
      categorizeTicket("Cannot connect to office WiFi", "Drops in the meeting room"),
    ).toBe("network");
  });

  it("detects hardware issues", () => {
    expect(categorizeTicket("Laptop battery not charging", "")).toBe("hardware");
  });

  it("detects software requests", () => {
    expect(
      categorizeTicket("Please install Adobe Acrobat", "We need a license"),
    ).toBe("software");
  });

  it("detects access issues", () => {
    expect(
      categorizeTicket("Password reset for HR portal", "Locked out, MFA failing"),
    ).toBe("access");
  });

  it("returns null when nothing matches", () => {
    expect(categorizeTicket("General question", "Wondering about something")).toBeNull();
  });
});
