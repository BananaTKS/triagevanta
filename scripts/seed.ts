import { createRequire } from "node:module";
import bcrypt from "bcryptjs";
import * as schema from "../src/db/schema.ts";

// Seeds demo data. Driver mirrors the app: node-postgres when DATABASE_URL is
// set, otherwise the embedded PGlite database at ./.pglite.
const require = createRequire(import.meta.url);

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const SLA_HOURS: Record<string, number> = { low: 72, medium: 24, high: 8, urgent: 4 };
const DEMO_PASSWORD = "Password123!";

function sla(createdMs: number, priority: string): Date {
  return new Date(createdMs + SLA_HOURS[priority] * HOUR);
}

function makeDb() {
  const url = process.env.DATABASE_URL;
  if (url) {
    const { drizzle } = require("drizzle-orm/node-postgres");
    const { Pool } = require("pg");
    const pool = new Pool({
      connectionString: url,
      ssl: url.includes("sslmode=require") ? { rejectUnauthorized: false } : undefined,
    });
    return { db: drizzle(pool, { schema }), close: () => pool.end() };
  }
  const { drizzle } = require("drizzle-orm/pglite");
  const { PGlite } = require("@electric-sql/pglite");
  const client = new PGlite(process.env.PGLITE_PATH ?? ".pglite");
  return { db: drizzle(client, { schema }), close: () => client.close() };
}

async function main() {
  const { db, close } = makeDb();
  const now = Date.now();
  const passwordHash = bcrypt.hashSync(DEMO_PASSWORD, 10);

  // Clear existing data (FK-safe order).
  await db.delete(schema.kbArticleVotes);
  await db.delete(schema.kbArticles);
  await db.delete(schema.securityEvents);
  await db.delete(schema.ticketNotes);
  await db.delete(schema.tickets);
  await db.delete(schema.users);

  const insertedUsers = await db
    .insert(schema.users)
    .values([
      { name: "Alex Morgan", email: "admin@triagevanta.dev", passwordHash, role: "admin" },
      { name: "Jordan Lee", email: "it@triagevanta.dev", passwordHash, role: "it_staff" },
      { name: "Riley Chen", email: "riley@triagevanta.dev", passwordHash, role: "it_staff" },
      { name: "Sam Patel", email: "employee@triagevanta.dev", passwordHash, role: "employee" },
      { name: "Dana Kim", email: "dana@triagevanta.dev", passwordHash, role: "employee" },
    ])
    .returning({ id: schema.users.id, email: schema.users.email });

  const byEmail = (email: string): string => {
    const u = insertedUsers.find((x: { email: string }) => x.email === email);
    if (!u) throw new Error(`Seed user not found: ${email}`);
    return u.id;
  };

  const admin = byEmail("admin@triagevanta.dev");
  const it = byEmail("it@triagevanta.dev");
  const riley = byEmail("riley@triagevanta.dev");
  const sam = byEmail("employee@triagevanta.dev");
  const dana = byEmail("dana@triagevanta.dev");

  type SeedTicket = {
    title: string;
    description: string;
    status: string;
    priority: string;
    category: string;
    createdById: string;
    assignedToId: string | null;
    createdMs: number;
  };

  const ticketSeeds: SeedTicket[] = [
    {
      title: "Cannot connect to office WiFi",
      description:
        "WiFi keeps dropping in meeting room B. Other rooms seem fine. Started this morning.",
      status: "open",
      priority: "high",
      category: "network",
      createdById: sam,
      assignedToId: null,
      createdMs: now - 1 * DAY,
    },
    {
      title: "Laptop extremely slow after update",
      description:
        "Since the latest Windows update my laptop takes 10+ minutes to boot and apps hang.",
      status: "in_progress",
      priority: "medium",
      category: "hardware",
      createdById: dana,
      assignedToId: it,
      createdMs: now - 2 * DAY,
    },
    {
      title: "Please install Adobe Acrobat Pro",
      description: "Need Acrobat Pro for the finance team to edit PDF contracts.",
      status: "open",
      priority: "low",
      category: "software",
      createdById: sam,
      assignedToId: null,
      createdMs: now - 3 * HOUR,
    },
    {
      title: "VPN access not working from home",
      description: "Getting 'authentication failed' on the VPN client since yesterday.",
      status: "in_progress",
      priority: "urgent",
      category: "access",
      createdById: dana,
      assignedToId: admin,
      createdMs: now - 1 * HOUR,
    },
    {
      title: "External monitor flickering",
      description: "The second monitor flickers every few minutes. Tried a new cable.",
      status: "resolved",
      priority: "medium",
      category: "hardware",
      createdById: sam,
      assignedToId: it,
      createdMs: now - 5 * DAY,
    },
    {
      title: "Need password reset for HR portal",
      description: "Locked out of the HR portal after too many attempts.",
      status: "pending_user",
      priority: "high",
      category: "access",
      createdById: dana,
      assignedToId: riley,
      createdMs: now - 6 * HOUR,
    },
    {
      title: "Outlook not syncing email",
      description: "New emails only show up after restarting Outlook several times.",
      status: "open",
      priority: "medium",
      category: "software",
      createdById: sam,
      assignedToId: null,
      createdMs: now - 10 * HOUR,
    },
    {
      title: "Printer on 3rd floor offline",
      description: "Shared printer shows offline for everyone on the floor.",
      status: "closed",
      priority: "low",
      category: "hardware",
      createdById: dana,
      assignedToId: it,
      createdMs: now - 7 * DAY,
    },
    {
      title: "Request: second monitor for new desk",
      description: "Moved desks and would like a second monitor set up.",
      status: "open",
      priority: "low",
      category: "hardware",
      createdById: sam,
      assignedToId: null,
      createdMs: now - 30 * HOUR,
    },
    {
      title: "Possible phishing email reported",
      description:
        "Received an email asking to verify my password via an external link. Did not click.",
      status: "open",
      priority: "urgent",
      category: "access",
      createdById: dana,
      assignedToId: null,
      createdMs: now - 20 * MIN,
    },
  ];

  const insertedTickets = await db
    .insert(schema.tickets)
    .values(
      ticketSeeds.map((t) => ({
        title: t.title,
        description: t.description,
        status: t.status as schema.TicketStatus,
        priority: t.priority as schema.TicketPriority,
        category: t.category as schema.TicketCategory,
        createdById: t.createdById,
        assignedToId: t.assignedToId,
        slaDueAt: sla(t.createdMs, t.priority),
        createdAt: new Date(t.createdMs),
        updatedAt: new Date(t.createdMs),
      })),
    )
    .returning({ id: schema.tickets.id, title: schema.tickets.title });

  const ticketId = (title: string): string => {
    const t = insertedTickets.find((x: { title: string }) => x.title === title);
    if (!t) throw new Error(`Seed ticket not found: ${title}`);
    return t.id;
  };

  await db.insert(schema.ticketNotes).values([
    {
      ticketId: ticketId("Cannot connect to office WiFi"),
      authorId: sam,
      body: "Still happening in meeting room B during the 10am standup.",
      isInternal: false,
      createdAt: new Date(now - 20 * HOUR),
    },
    {
      ticketId: ticketId("Laptop extremely slow after update"),
      authorId: it,
      body: "Could you tell me the exact laptop model and how much RAM it has?",
      isInternal: false,
      createdAt: new Date(now - 1 * DAY),
    },
    {
      ticketId: ticketId("Laptop extremely slow after update"),
      authorId: it,
      body: "Likely needs a RAM upgrade. Ordering an 8GB module from stock.",
      isInternal: true,
      createdAt: new Date(now - 20 * HOUR),
    },
    {
      ticketId: ticketId("VPN access not working from home"),
      authorId: admin,
      body: "Investigating — checking the identity provider logs for this account.",
      isInternal: true,
      createdAt: new Date(now - 40 * MIN),
    },
  ]);

  type SeedEvent = {
    type: string;
    actorId: string | null;
    targetEmail?: string | null;
    targetId?: string | null;
    ip: string | null;
    userAgent?: string | null;
    metadata?: Record<string, unknown>;
    createdMs: number;
  };

  const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";
  const events: SeedEvent[] = [
    // Normal logins across the day.
    { type: "login_success", actorId: admin, targetEmail: "admin@triagevanta.dev", ip: "10.0.0.12", userAgent: UA, createdMs: now - 8 * HOUR },
    { type: "login_success", actorId: it, targetEmail: "it@triagevanta.dev", ip: "10.0.0.20", userAgent: UA, createdMs: now - 7 * HOUR },
    { type: "login_success", actorId: sam, targetEmail: "employee@triagevanta.dev", ip: "10.0.0.55", userAgent: UA, createdMs: now - 6 * HOUR },
    { type: "login_success", actorId: dana, targetEmail: "dana@triagevanta.dev", ip: "10.0.0.56", userAgent: UA, createdMs: now - 90 * MIN },
    { type: "logout", actorId: sam, ip: "10.0.0.55", userAgent: UA, createdMs: now - 5 * HOUR },
    // A couple of isolated failures (below alert threshold).
    { type: "login_failure", actorId: dana, targetEmail: "dana@triagevanta.dev", ip: "10.0.0.56", userAgent: UA, metadata: { reason: "bad_password" }, createdMs: now - 95 * MIN },
    { type: "login_failure", actorId: null, targetEmail: "unknown@example.com", ip: "198.51.100.7", userAgent: UA, metadata: { reason: "unknown_email" }, createdMs: now - 3 * HOUR },
    // Audit events.
    { type: "role_change", actorId: admin, targetId: riley, targetEmail: "riley@triagevanta.dev", ip: "10.0.0.12", userAgent: UA, metadata: { from: "employee", to: "it_staff" }, createdMs: now - 4 * DAY },
    { type: "ticket_assigned", actorId: admin, targetId: ticketId("VPN access not working from home"), ip: "10.0.0.12", userAgent: UA, createdMs: now - 55 * MIN },
    { type: "ticket_assigned", actorId: it, targetId: ticketId("Laptop extremely slow after update"), ip: "10.0.0.20", userAgent: UA, createdMs: now - 2 * DAY + HOUR },
  ];

  // Failed-login spike: 6 failures for one account/IP within ~12 minutes.
  for (let i = 0; i < 6; i++) {
    events.push({
      type: "login_failure",
      actorId: admin,
      targetEmail: "admin@triagevanta.dev",
      ip: "203.0.113.45",
      userAgent: "curl/8.4.0",
      metadata: { reason: "bad_password" },
      createdMs: now - (2 + i * 2) * MIN,
    });
  }

  await db.insert(schema.securityEvents).values(
    events.map((e) => ({
      type: e.type as schema.SecurityEventType,
      actorId: e.actorId,
      targetEmail: e.targetEmail ?? null,
      targetId: e.targetId ?? null,
      ip: e.ip,
      userAgent: e.userAgent ?? null,
      metadata: e.metadata,
      createdAt: new Date(e.createdMs),
    })),
  );

  type SeedArticle = {
    title: string;
    body: string;
    category: schema.TicketCategory;
    authorId: string;
    createdMs: number;
    updatedMs: number;
  };

  const articleSeeds: SeedArticle[] = [
    {
      title: "Connecting to the office WiFi",
      body: "1. Select the 'Corp-Secure' network.\n2. Enter your email and network password.\n3. Accept the certificate prompt.\n\nIf it keeps dropping, forget the network and reconnect, or move closer to an access point. Still stuck? Open a ticket under the Network category.",
      category: "network",
      authorId: it,
      createdMs: now - 30 * DAY,
      updatedMs: now - 3 * DAY,
    },
    {
      title: "Setting up the VPN from home",
      body: "Install the VPN client from the Software Center, then sign in with your work account. You must approve the MFA prompt within 30 seconds.\n\n'Authentication failed' usually means your password recently changed — update it in the client settings and try again.",
      category: "access",
      authorId: admin,
      createdMs: now - 21 * DAY,
      updatedMs: now - 1 * DAY,
    },
    {
      title: "Speeding up a slow laptop",
      body: "1. Restart (don't just close the lid) at least once a week.\n2. Check Task Manager for apps using high memory.\n3. Make sure pending Windows updates are installed.\n\nIf boot still takes several minutes, you may need a RAM upgrade — raise a Hardware ticket.",
      category: "hardware",
      authorId: it,
      createdMs: now - 14 * DAY,
      updatedMs: now - 5 * DAY,
    },
    {
      title: "Requesting new software",
      body: "Check the Software Center first — most approved apps can be installed without a ticket. For anything not listed, open a ticket under the Software category and include the business justification so we can fast-track licensing.",
      category: "software",
      authorId: riley,
      createdMs: now - 10 * DAY,
      updatedMs: now - 10 * DAY,
    },
    {
      title: "Resetting your account password",
      body: "Use the self-service portal at reset.triagevanta.dev. You'll need access to your registered MFA device.\n\nLocked out completely? Open an Access ticket and IT will verify your identity before issuing a temporary password.",
      category: "access",
      authorId: it,
      createdMs: now - 7 * DAY,
      updatedMs: now - 2 * DAY,
    },
  ];

  const insertedArticles = await db
    .insert(schema.kbArticles)
    .values(
      articleSeeds.map((a) => ({
        title: a.title,
        body: a.body,
        category: a.category,
        authorId: a.authorId,
        createdAt: new Date(a.createdMs),
        updatedAt: new Date(a.updatedMs),
      })),
    )
    .returning({ id: schema.kbArticles.id, title: schema.kbArticles.title });

  const articleId = (title: string): string => {
    const a = insertedArticles.find((x: { title: string }) => x.title === title);
    if (!a) throw new Error(`Seed article not found: ${title}`);
    return a.id;
  };

  await db.insert(schema.kbArticleVotes).values([
    { articleId: articleId("Connecting to the office WiFi"), userId: sam, helpful: true },
    { articleId: articleId("Connecting to the office WiFi"), userId: dana, helpful: true },
    { articleId: articleId("Setting up the VPN from home"), userId: dana, helpful: true },
    { articleId: articleId("Speeding up a slow laptop"), userId: sam, helpful: false },
  ]);

  await close();
  console.log(
    `Seeded ${insertedUsers.length} users, ${insertedTickets.length} tickets, ${insertedArticles.length} KB articles, ${events.length} security events.`,
  );
  console.log(`Demo login: admin@triagevanta.dev / ${DEMO_PASSWORD}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
