import type { Role } from "@/db/schema";

export type { Role };

/** Pure role predicates — safe to use anywhere (no server-only deps). */
export function hasRole(role: Role, allowed: readonly Role[]): boolean {
  return allowed.includes(role);
}

export function isStaff(role: Role): boolean {
  return role === "it_staff" || role === "admin";
}

export function isAdmin(role: Role): boolean {
  return role === "admin";
}

/** Only IT staff and admins may read internal notes. */
export function canViewInternalNotes(role: Role): boolean {
  return isStaff(role);
}

/** Only IT staff and admins may assign tickets or change their status. */
export function canManageTickets(role: Role): boolean {
  return isStaff(role);
}

/** Only admins may view the security dashboard. */
export function canViewSecurity(role: Role): boolean {
  return isAdmin(role);
}

/** Only admins may manage users and their roles. */
export function canManageUsers(role: Role): boolean {
  return isAdmin(role);
}

/** IT staff and admins may author/edit knowledge base articles. */
export function canManageKb(role: Role): boolean {
  return isStaff(role);
}

/** IT staff and admins may manage the asset inventory. */
export function canManageAssets(role: Role): boolean {
  return isStaff(role);
}

/** IT staff and admins may manage employee onboarding. */
export function canManageOnboarding(role: Role): boolean {
  return isStaff(role);
}

/** IT staff and admins may view service-desk reports. */
export function canViewReports(role: Role): boolean {
  return isStaff(role);
}
