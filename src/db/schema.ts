import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------
export const roleEnum = pgEnum("role", ["employee", "it_staff", "admin"]);

export const ticketStatusEnum = pgEnum("ticket_status", [
  "open",
  "in_progress",
  "pending_user",
  "resolved",
  "closed",
]);

export const ticketPriorityEnum = pgEnum("ticket_priority", [
  "low",
  "medium",
  "high",
  "urgent",
]);

export const ticketCategoryEnum = pgEnum("ticket_category", [
  "hardware",
  "software",
  "network",
  "access",
  "other",
]);

export const securityEventTypeEnum = pgEnum("security_event_type", [
  "login_success",
  "login_failure",
  "logout",
  "user_created",
  "role_change",
  "ticket_assigned",
  "admin_action",
]);

// ---------------------------------------------------------------------------
// Tables
// ---------------------------------------------------------------------------
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: roleEnum("role").notNull().default("employee"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const tickets = pgTable(
  "tickets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    status: ticketStatusEnum("status").notNull().default("open"),
    priority: ticketPriorityEnum("priority").notNull().default("medium"),
    category: ticketCategoryEnum("category").notNull().default("other"),
    createdById: uuid("created_by_id")
      .notNull()
      .references(() => users.id),
    assignedToId: uuid("assigned_to_id").references(() => users.id),
    slaDueAt: timestamp("sla_due_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("tickets_status_idx").on(t.status),
    index("tickets_assigned_to_idx").on(t.assignedToId),
    index("tickets_created_by_idx").on(t.createdById),
  ],
);

export const ticketNotes = pgTable("ticket_notes", {
  id: uuid("id").defaultRandom().primaryKey(),
  ticketId: uuid("ticket_id")
    .notNull()
    .references(() => tickets.id, { onDelete: "cascade" }),
  authorId: uuid("author_id")
    .notNull()
    .references(() => users.id),
  body: text("body").notNull(),
  isInternal: boolean("is_internal").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Unified audit + security event log. Drives the admin security dashboard.
export const securityEvents = pgTable(
  "security_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    type: securityEventTypeEnum("type").notNull(),
    // Nullable: failed logins happen before a session exists.
    actorId: uuid("actor_id").references(() => users.id),
    targetEmail: text("target_email"),
    targetId: uuid("target_id"),
    ip: text("ip"),
    userAgent: text("user_agent"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("security_events_type_idx").on(t.type),
    index("security_events_created_at_idx").on(t.createdAt),
  ],
);

// ---------------------------------------------------------------------------
// Relations (for the relational query API)
// ---------------------------------------------------------------------------
export const usersRelations = relations(users, ({ many }) => ({
  createdTickets: many(tickets, { relationName: "created" }),
  assignedTickets: many(tickets, { relationName: "assigned" }),
  notes: many(ticketNotes),
}));

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [tickets.createdById],
    references: [users.id],
    relationName: "created",
  }),
  assignedTo: one(users, {
    fields: [tickets.assignedToId],
    references: [users.id],
    relationName: "assigned",
  }),
  notes: many(ticketNotes),
}));

export const ticketNotesRelations = relations(ticketNotes, ({ one }) => ({
  ticket: one(tickets, {
    fields: [ticketNotes.ticketId],
    references: [tickets.id],
  }),
  author: one(users, {
    fields: [ticketNotes.authorId],
    references: [users.id],
  }),
}));

export const securityEventsRelations = relations(securityEvents, ({ one }) => ({
  actor: one(users, {
    fields: [securityEvents.actorId],
    references: [users.id],
  }),
}));

// ---------------------------------------------------------------------------
// Inferred types
// ---------------------------------------------------------------------------
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Ticket = typeof tickets.$inferSelect;
export type NewTicket = typeof tickets.$inferInsert;
export type TicketNote = typeof ticketNotes.$inferSelect;
export type SecurityEvent = typeof securityEvents.$inferSelect;

export type Role = (typeof roleEnum.enumValues)[number];
export type TicketStatus = (typeof ticketStatusEnum.enumValues)[number];
export type TicketPriority = (typeof ticketPriorityEnum.enumValues)[number];
export type TicketCategory = (typeof ticketCategoryEnum.enumValues)[number];
export type SecurityEventType = (typeof securityEventTypeEnum.enumValues)[number];
