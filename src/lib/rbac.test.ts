import { describe, expect, it } from "vitest";
import {
  canManageTickets,
  canViewInternalNotes,
  canViewSecurity,
  hasRole,
  isAdmin,
  isStaff,
} from "@/lib/rbac";

describe("hasRole", () => {
  it("matches allowed roles", () => {
    expect(hasRole("admin", ["admin"])).toBe(true);
    expect(hasRole("it_staff", ["it_staff", "admin"])).toBe(true);
    expect(hasRole("employee", ["it_staff", "admin"])).toBe(false);
  });
});

describe("role predicates", () => {
  it("isStaff covers IT staff and admins only", () => {
    expect(isStaff("it_staff")).toBe(true);
    expect(isStaff("admin")).toBe(true);
    expect(isStaff("employee")).toBe(false);
  });

  it("isAdmin covers admins only", () => {
    expect(isAdmin("admin")).toBe(true);
    expect(isAdmin("it_staff")).toBe(false);
  });

  it("internal notes and ticket management require staff", () => {
    expect(canViewInternalNotes("employee")).toBe(false);
    expect(canViewInternalNotes("it_staff")).toBe(true);
    expect(canManageTickets("employee")).toBe(false);
    expect(canManageTickets("admin")).toBe(true);
  });

  it("security dashboard requires admin", () => {
    expect(canViewSecurity("it_staff")).toBe(false);
    expect(canViewSecurity("admin")).toBe(true);
  });
});
