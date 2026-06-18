import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
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

export const assetTypeEnum = pgEnum("asset_type", [
  "laptop",
  "desktop",
  "monitor",
  "phone",
  "peripheral",
  "other",
]);

export const assetStatusEnum = pgEnum("asset_status", [
  "in_use",
  "spare",
  "repair",
  "retired",
]);

export const assetConditionEnum = pgEnum("asset_condition", [
  "new",
  "good",
  "fair",
  "poor",
]);

export const assetEventTypeEnum = pgEnum("asset_event_type", [
  "created",
  "assigned",
  "unassigned",
  "status_change",
  "updated",
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

// Knowledge base articles (reuse the ticket category taxonomy).
export const kbArticles = pgTable(
  "kb_articles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    category: ticketCategoryEnum("category").notNull().default("other"),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("kb_articles_category_idx").on(t.category)],
);

// One "was this helpful?" vote per user per article.
export const kbArticleVotes = pgTable(
  "kb_article_votes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    articleId: uuid("article_id")
      .notNull()
      .references(() => kbArticles.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    helpful: boolean("helpful").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("kb_votes_article_user_idx").on(t.articleId, t.userId)],
);

// Mock email notifications — what the system "would" email, per recipient.
export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    recipientId: uuid("recipient_id")
      .notNull()
      .references(() => users.id),
    recipientEmail: text("recipient_email").notNull(),
    subject: text("subject").notNull(),
    body: text("body").notNull(),
    ticketId: uuid("ticket_id").references(() => tickets.id, {
      onDelete: "cascade",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("notifications_recipient_idx").on(t.recipientId)],
);

// IT asset inventory.
export const assets = pgTable(
  "assets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    assetTag: text("asset_tag").notNull().unique(),
    name: text("name").notNull(),
    type: assetTypeEnum("type").notNull().default("laptop"),
    serialNumber: text("serial_number"),
    status: assetStatusEnum("status").notNull().default("spare"),
    condition: assetConditionEnum("condition").notNull().default("good"),
    assignedToId: uuid("assigned_to_id").references(() => users.id),
    warrantyExpiresAt: timestamp("warranty_expires_at", { withTimezone: true }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("assets_status_idx").on(t.status),
    index("assets_assigned_to_idx").on(t.assignedToId),
  ],
);

// Asset lifecycle history (assignments, status changes, edits).
export const assetEvents = pgTable(
  "asset_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    assetId: uuid("asset_id")
      .notNull()
      .references(() => assets.id, { onDelete: "cascade" }),
    type: assetEventTypeEnum("type").notNull(),
    actorId: uuid("actor_id").references(() => users.id),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("asset_events_asset_idx").on(t.assetId)],
);

// New-joiner onboarding records + their checklist tasks.
export const onboardings = pgTable("onboardings", {
  id: uuid("id").defaultRandom().primaryKey(),
  employeeName: text("employee_name").notNull(),
  title: text("title"),
  startDate: timestamp("start_date", { withTimezone: true }),
  createdById: uuid("created_by_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const onboardingTasks = pgTable(
  "onboarding_tasks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    onboardingId: uuid("onboarding_id")
      .notNull()
      .references(() => onboardings.id, { onDelete: "cascade" }),
    category: text("category").notNull().default("General"),
    label: text("label").notNull(),
    done: boolean("done").notNull().default(false),
    doneAt: timestamp("done_at", { withTimezone: true }),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("onboarding_tasks_onboarding_idx").on(t.onboardingId)],
);

// Saved ticket-list filter presets ("queues"), per user.
export const savedViews = pgTable(
  "saved_views",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    params: text("params").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("saved_views_user_idx").on(t.userId)],
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

export const kbArticlesRelations = relations(kbArticles, ({ one, many }) => ({
  author: one(users, {
    fields: [kbArticles.authorId],
    references: [users.id],
  }),
  votes: many(kbArticleVotes),
}));

export const kbArticleVotesRelations = relations(kbArticleVotes, ({ one }) => ({
  article: one(kbArticles, {
    fields: [kbArticleVotes.articleId],
    references: [kbArticles.id],
  }),
  user: one(users, {
    fields: [kbArticleVotes.userId],
    references: [users.id],
  }),
}));

export const assetsRelations = relations(assets, ({ one, many }) => ({
  assignedTo: one(users, {
    fields: [assets.assignedToId],
    references: [users.id],
  }),
  events: many(assetEvents),
}));

export const assetEventsRelations = relations(assetEvents, ({ one }) => ({
  asset: one(assets, {
    fields: [assetEvents.assetId],
    references: [assets.id],
  }),
  actor: one(users, {
    fields: [assetEvents.actorId],
    references: [users.id],
  }),
}));

export const onboardingsRelations = relations(onboardings, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [onboardings.createdById],
    references: [users.id],
  }),
  tasks: many(onboardingTasks),
}));

export const onboardingTasksRelations = relations(onboardingTasks, ({ one }) => ({
  onboarding: one(onboardings, {
    fields: [onboardingTasks.onboardingId],
    references: [onboardings.id],
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
export type KbArticle = typeof kbArticles.$inferSelect;
export type KbArticleVote = typeof kbArticleVotes.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type Asset = typeof assets.$inferSelect;
export type AssetEvent = typeof assetEvents.$inferSelect;
export type AssetType = (typeof assetTypeEnum.enumValues)[number];
export type AssetStatus = (typeof assetStatusEnum.enumValues)[number];
export type AssetCondition = (typeof assetConditionEnum.enumValues)[number];
export type AssetEventType = (typeof assetEventTypeEnum.enumValues)[number];
export type Onboarding = typeof onboardings.$inferSelect;
export type OnboardingTask = typeof onboardingTasks.$inferSelect;
export type SavedView = typeof savedViews.$inferSelect;

export type Role = (typeof roleEnum.enumValues)[number];
export type TicketStatus = (typeof ticketStatusEnum.enumValues)[number];
export type TicketPriority = (typeof ticketPriorityEnum.enumValues)[number];
export type TicketCategory = (typeof ticketCategoryEnum.enumValues)[number];
export type SecurityEventType = (typeof securityEventTypeEnum.enumValues)[number];
