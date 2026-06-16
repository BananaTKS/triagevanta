# TriageVanta

**An IT service desk and security monitoring platform for modern support teams.**

TriageVanta is a focused, full-stack help-desk app: employees raise tickets, IT
staff triage and resolve them against SLAs, and admins get a security dashboard
with audit logging and failed-login alerting. It is built around real IT
operations and a deliberate, documented security model.

[![CI](https://github.com/BananaTKS/triagevanta/actions/workflows/ci.yml/badge.svg)](https://github.com/BananaTKS/triagevanta/actions/workflows/ci.yml)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Drizzle-336791)
![Tests](https://img.shields.io/badge/tests-vitest-6da55f)

## Screenshots

**Service desk dashboard** — role-aware queue with SLA tracking and overdue flags

![Service desk dashboard](docs/screenshots/dashboard.png)

**Security monitoring** — audit log with failed-login spike alerting

![Security monitoring dashboard](docs/screenshots/security.png)

**User management** — admins assign roles; every change is audit-logged

![User management](docs/screenshots/users.png)

**Sign in**

![Sign in](docs/screenshots/login.png)

## Why I built this

My background is IT desktop support and information security — tickets,
onboarding, access management, and log review. Most portfolio apps are generic
CRUD; this one models work I have actually done, and puts the security side
(RBAC, audit logging, anomaly alerting) front and center rather than bolting it
on at the end.

## Features

- **Authentication & RBAC** — email/password with bcrypt hashing and JWT
  sessions; three roles: employee, IT staff, admin.
- **Admin user management** — admins promote/demote roles from a Users page;
  every change is written to the audit log.
- **Ticketing** — create, triage, assign, and update tickets with categories,
  priorities, and **SLA due dates** (with overdue detection).
- **Internal vs. public notes** — staff can post internal notes that employees
  never see.
- **Role-aware dashboards** — employees see their own tickets; staff/admin see
  the full queue, unassigned counts, and SLA breaches.
- **Search & filtering** — full-text ticket search plus status / priority /
  category / assignee filters, with pagination.
- **Knowledge base** — searchable articles with "was this helpful?" voting;
  related articles surface automatically on matching tickets.
- **Notifications** — ticket activity (created, assigned, status change, replies)
  generates a per-user inbox that simulates outbound email.
- **Security monitoring (admin)** — a unified audit log plus a dashboard that
  flags **failed-login spikes** (5+ failures per account/IP in 15 minutes).
- **Zero-setup local dev** — runs on an embedded PostgreSQL (PGlite) with no
  Docker required; switch to real Postgres with one env var.

## Tech stack

Next.js 16 (App Router, Server Components, Server Actions) · TypeScript ·
Tailwind CSS v4 · PostgreSQL · Drizzle ORM · `jose` + `bcryptjs` auth · Vitest ·
Docker Compose.

See [docs/architecture.md](docs/architecture.md) and
[docs/security-model.md](docs/security-model.md) for the design.

## Running locally

Requires Node 20.9+ (built on Node 24). No database setup needed — the app uses
an embedded PGlite database by default.

```bash
npm install
cp .env.example .env.local      # set SESSION_SECRET (any 32+ char string)
npm run db:setup                # create + seed the local database
npm run dev                     # http://localhost:3000
```

> Generate a session secret with `openssl rand -base64 32`.

### Demo accounts

All demo accounts use the password `Password123!`:

| Role     | Email                     |
| -------- | ------------------------- |
| Admin    | admin@triagevanta.dev     |
| IT staff | it@triagevanta.dev        |
| Employee | employee@triagevanta.dev  |

### Using real PostgreSQL (optional)

```bash
docker compose up -d
# add to .env.local:
# DATABASE_URL="postgres://triagevanta:triagevanta@localhost:5432/triagevanta"
npm run db:setup
npm run dev
```

For production (e.g. Vercel + Neon), set `DATABASE_URL` to your Postgres
connection string (append `?sslmode=require`) and run `npm run db:migrate`.

## Scripts

| Script                | Purpose                                      |
| --------------------- | -------------------------------------------- |
| `npm run dev`         | Start the dev server                         |
| `npm run build`       | Production build                             |
| `npm test`            | Run unit tests (Vitest)                      |
| `npm run lint`        | Lint                                         |
| `npm run db:generate` | Generate SQL migrations from the schema      |
| `npm run db:migrate`  | Apply migrations                             |
| `npm run db:seed`     | Seed demo data                               |
| `npm run db:setup`    | Migrate + seed                               |

## Testing

Unit tests cover the pure business logic: SLA computation, RBAC predicates, and
the failed-login spike detector.

```bash
npm test
```

## Roadmap

v1 is intentionally a small, finished core. Onboarding tracking, asset inventory,
a knowledge base, automation, and full OpenTelemetry observability are planned —
see [ROADMAP.md](ROADMAP.md).

## What I learned

- **Next.js 16 App Router**: async request APIs (`cookies`/`headers`/`params`),
  the `proxy.ts` convention (renamed from middleware), and Server Actions with
  `useActionState`.
- **A real auth/authorization model**: stateless JWT sessions with `jose`, a
  Data Access Layer as the single authorization boundary, and defense-in-depth
  (optimistic proxy → DAL → query-level row scoping).
- **Security engineering**: audit logging, anti-enumeration login timing, and
  mapping concrete code to the OWASP Top 10.
- **Database portability**: one Drizzle schema running on embedded PGlite for
  dev and real Postgres for production.

## License

MIT
