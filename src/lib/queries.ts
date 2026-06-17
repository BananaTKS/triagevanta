import "server-only";
import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  isNull,
  or,
  type SQL,
} from "drizzle-orm";
import { db } from "@/db";
import {
  assets,
  kbArticles,
  notifications,
  onboardings,
  securityEvents,
  tickets,
  users,
  type AssetStatus,
  type AssetType,
  type TicketCategory,
  type TicketPriority,
  type TicketStatus,
} from "@/db/schema";
import { canViewInternalNotes, isStaff } from "@/lib/rbac";
import { isOverdue } from "@/lib/sla";
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

export const TICKETS_PAGE_SIZE = 8;

export interface TicketFilter {
  q?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: TicketCategory;
  /** A user id, or the literal "unassigned". */
  assignee?: string;
  page?: number;
}

/** Role-scoped ticket search with filters and pagination. */
export async function searchTickets(user: CurrentUser, filter: TicketFilter) {
  const conditions: (SQL | undefined)[] = [];

  // Row-level scope: employees only ever see their own tickets.
  if (!isStaff(user.role)) conditions.push(eq(tickets.createdById, user.id));

  if (filter.status) conditions.push(eq(tickets.status, filter.status));
  if (filter.priority) conditions.push(eq(tickets.priority, filter.priority));
  if (filter.category) conditions.push(eq(tickets.category, filter.category));
  if (filter.assignee === "unassigned") {
    conditions.push(isNull(tickets.assignedToId));
  } else if (filter.assignee) {
    conditions.push(eq(tickets.assignedToId, filter.assignee));
  }
  if (filter.q) {
    const term = `%${filter.q}%`;
    conditions.push(
      or(ilike(tickets.title, term), ilike(tickets.description, term)),
    );
  }

  const where = and(...conditions);
  const page = Math.max(1, filter.page ?? 1);
  const offset = (page - 1) * TICKETS_PAGE_SIZE;

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(tickets)
    .where(where);

  const items = await db.query.tickets.findMany({
    where,
    orderBy: [desc(tickets.createdAt)],
    limit: TICKETS_PAGE_SIZE,
    offset,
    with: {
      createdBy: { columns: { id: true, name: true, email: true } },
      assignedTo: { columns: { id: true, name: true } },
    },
  });

  const totalPages = Math.max(1, Math.ceil(total / TICKETS_PAGE_SIZE));
  return { items, total, page, totalPages };
}

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

// --- Reporting ---------------------------------------------------------------

export async function getTicketReport(now: Date = new Date()) {
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const rows = await db.query.tickets.findMany({
    columns: {
      status: true,
      category: true,
      createdAt: true,
      updatedAt: true,
      slaDueAt: true,
    },
  });

  const isClosed = (s: TicketStatus) => s === "resolved" || s === "closed";
  const byStatus: Partial<Record<TicketStatus, number>> = {};
  const byCategory: Partial<Record<TicketCategory, number>> = {};
  let openedThisMonth = 0;
  let resolvedThisMonth = 0;
  let openNow = 0;
  let overdue = 0;

  for (const t of rows) {
    byStatus[t.status] = (byStatus[t.status] ?? 0) + 1;
    byCategory[t.category] = (byCategory[t.category] ?? 0) + 1;
    if (t.createdAt >= monthStart) openedThisMonth += 1;
    if (isClosed(t.status) && t.updatedAt >= monthStart) resolvedThisMonth += 1;
    if (!isClosed(t.status)) openNow += 1;
    if (isOverdue(t.slaDueAt, t.status, now)) overdue += 1;
  }

  return {
    total: rows.length,
    monthStart,
    openedThisMonth,
    resolvedThisMonth,
    openNow,
    overdue,
    byStatus,
    byCategory,
  };
}

// --- Onboarding --------------------------------------------------------------

export async function listOnboardings() {
  const rows = await db.query.onboardings.findMany({
    orderBy: [desc(onboardings.createdAt)],
    with: { tasks: { columns: { done: true } } },
  });
  return rows.map((o) => ({
    id: o.id,
    employeeName: o.employeeName,
    title: o.title,
    startDate: o.startDate,
    total: o.tasks.length,
    done: o.tasks.filter((t) => t.done).length,
  }));
}

export type OnboardingListItem = Awaited<
  ReturnType<typeof listOnboardings>
>[number];

export async function getOnboarding(id: string) {
  return db.query.onboardings.findFirst({
    where: eq(onboardings.id, id),
    with: {
      createdBy: { columns: { id: true, name: true } },
      tasks: { orderBy: (t, { asc }) => [asc(t.sortOrder)] },
    },
  });
}

export type OnboardingDetail = NonNullable<
  Awaited<ReturnType<typeof getOnboarding>>
>;

// --- Assets ------------------------------------------------------------------

export async function listAssets(filter: {
  q?: string;
  status?: AssetStatus;
  type?: AssetType;
}) {
  const conditions: (SQL | undefined)[] = [];
  if (filter.status) conditions.push(eq(assets.status, filter.status));
  if (filter.type) conditions.push(eq(assets.type, filter.type));
  if (filter.q) {
    const term = `%${filter.q}%`;
    conditions.push(
      or(
        ilike(assets.assetTag, term),
        ilike(assets.name, term),
        ilike(assets.serialNumber, term),
      ),
    );
  }
  return db.query.assets.findMany({
    where: and(...conditions),
    orderBy: [asc(assets.assetTag)],
    with: { assignedTo: { columns: { id: true, name: true } } },
  });
}

export type AssetListItem = Awaited<ReturnType<typeof listAssets>>[number];

export async function getAsset(id: string) {
  return db.query.assets.findFirst({
    where: eq(assets.id, id),
    with: {
      assignedTo: { columns: { id: true, name: true, email: true } },
      events: {
        orderBy: (e, { desc }) => [desc(e.createdAt)],
        with: { actor: { columns: { id: true, name: true } } },
      },
    },
  });
}

export type AssetDetail = NonNullable<Awaited<ReturnType<typeof getAsset>>>;

/** Any user can be assigned an asset (e.g. an employee's laptop). */
export async function listAssignableUsers() {
  return db.query.users.findMany({
    columns: { id: true, name: true },
    orderBy: (u, { asc }) => [asc(u.name)],
  });
}

// --- Knowledge base ----------------------------------------------------------

export async function listArticles(q?: string) {
  const where = q
    ? or(ilike(kbArticles.title, `%${q}%`), ilike(kbArticles.body, `%${q}%`))
    : undefined;
  return db.query.kbArticles.findMany({
    where,
    orderBy: [desc(kbArticles.updatedAt)],
    with: { author: { columns: { id: true, name: true } } },
  });
}

export type ArticleListItem = Awaited<ReturnType<typeof listArticles>>[number];

export async function getArticle(id: string, userId: string) {
  const article = await db.query.kbArticles.findFirst({
    where: eq(kbArticles.id, id),
    with: {
      author: { columns: { id: true, name: true } },
      votes: { columns: { userId: true, helpful: true } },
    },
  });
  if (!article) return null;

  const helpful = article.votes.filter((v) => v.helpful).length;
  const notHelpful = article.votes.length - helpful;
  const myVote = article.votes.find((v) => v.userId === userId)?.helpful ?? null;

  return { ...article, helpful, notHelpful, myVote };
}

export type ArticleDetail = NonNullable<Awaited<ReturnType<typeof getArticle>>>;

// --- Notifications -----------------------------------------------------------

export async function listNotificationsForUser(userId: string, limit = 50) {
  return db.query.notifications.findMany({
    where: eq(notifications.recipientId, userId),
    orderBy: [desc(notifications.createdAt)],
    limit,
  });
}

export type NotificationRow = Awaited<
  ReturnType<typeof listNotificationsForUser>
>[number];

/** Knowledge base articles in the same category as a ticket. */
export async function relatedArticlesForTicket(
  category: TicketCategory,
  limit = 3,
) {
  return db.query.kbArticles.findMany({
    where: eq(kbArticles.category, category),
    orderBy: [desc(kbArticles.updatedAt)],
    limit,
    columns: { id: true, title: true, category: true },
  });
}
