import "server-only";
import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { securityEvents, tickets, users } from "@/db/schema";
import { canViewInternalNotes, isStaff } from "@/lib/rbac";
import type { CurrentUser } from "@/lib/dal";

/**
 * Centralized read queries with row-level access control. Employees only ever
 * see their own tickets and never internal notes; staff/admin see everything.
 */

export async function listTicketsForUser(user: CurrentUser) {
  return db.query.tickets.findMany({
    where: isStaff(user.role) ? undefined : eq(tickets.createdById, user.id),
    orderBy: [desc(tickets.createdAt)],
    with: {
      createdBy: { columns: { id: true, name: true, email: true } },
      assignedTo: { columns: { id: true, name: true } },
    },
  });
}

export type TicketListItem = Awaited<ReturnType<typeof listTicketsForUser>>[number];

export async function getTicketDetail(id: string, user: CurrentUser) {
  const ticket = await db.query.tickets.findFirst({
    where: eq(tickets.id, id),
    with: {
      createdBy: { columns: { id: true, name: true, email: true } },
      assignedTo: { columns: { id: true, name: true } },
      notes: {
        orderBy: (n, { asc }) => [asc(n.createdAt)],
        with: { author: { columns: { id: true, name: true, role: true } } },
      },
    },
  });

  if (!ticket) return null;

  // Row-level access control: employees may only open their own tickets.
  if (!isStaff(user.role) && ticket.createdById !== user.id) return null;

  // Internal notes are hidden from employees.
  const notes = canViewInternalNotes(user.role)
    ? ticket.notes
    : ticket.notes.filter((note) => !note.isInternal);

  return { ...ticket, notes };
}

export type TicketDetail = NonNullable<Awaited<ReturnType<typeof getTicketDetail>>>;

/** IT staff and admins available as ticket assignees. */
export async function listStaffUsers() {
  return db.query.users.findMany({
    where: inArray(users.role, ["it_staff", "admin"]),
    columns: { id: true, name: true, role: true },
    orderBy: (u, { asc }) => [asc(u.name)],
  });
}

export async function getRecentSecurityEvents(limit = 100) {
  return db.query.securityEvents.findMany({
    orderBy: [desc(securityEvents.createdAt)],
    limit,
    with: { actor: { columns: { id: true, name: true, email: true } } },
  });
}

export type SecurityEventRow = Awaited<
  ReturnType<typeof getRecentSecurityEvents>
>[number];

/** All users (admin user-management view). */
export async function listAllUsers() {
  return db.query.users.findMany({
    columns: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: (u, { asc }) => [asc(u.name)],
  });
}

export type UserRow = Awaited<ReturnType<typeof listAllUsers>>[number];
