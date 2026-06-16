# Architecture

TriageVanta is a single Next.js (App Router) application that serves both the UI
and the backend logic via React Server Components and Server Actions. There is no
separate API server in v1.

## Stack

| Layer     | Choice                                                            |
| --------- | ---------------------------------------------------------------- |
| Framework | Next.js 16 (App Router, Server Components, Server Actions)        |
| Language  | TypeScript                                                        |
| UI        | Tailwind CSS v4                                                   |
| DB        | PostgreSQL via Drizzle ORM                                        |
| Dev DB    | Embedded **PGlite** (Postgres in WASM) — no Docker required       |
| Prod DB   | `pg` driver against Docker/Neon Postgres                         |
| Auth      | Hand-rolled sessions: `jose` (JWT) + `bcryptjs`, httpOnly cookie  |
| Tests     | Vitest                                                            |

## Request flow

1. **`src/proxy.ts`** (Next 16's renamed middleware) runs first and does an
   _optimistic_ auth check — it reads the session cookie and redirects
   unauthenticated users to `/login` and authenticated users away from the auth
   pages. It never touches the database.
2. **Server Components** render pages. They call the **Data Access Layer**
   (`src/lib/dal.ts`) to load the current user and enforce roles. This is the
   real authorization boundary.
3. **Server Actions** (`src/lib/actions/*`) handle mutations (login, signup,
   create/assign/update ticket, notes). Each re-verifies the user and role before
   writing, then records audit events and revalidates affected paths.

## Database layer

`src/db/index.ts` picks a driver at runtime:

- If `DATABASE_URL` is set → `drizzle-orm/node-postgres` (real Postgres).
- Otherwise → `drizzle-orm/pglite` with an embedded database at `./.pglite`.

Both use the same schema (`src/db/schema.ts`) and migrations (`drizzle/`), so the
app behaves identically in local dev and production. Migrations are applied with
`scripts/migrate.ts` and demo data is loaded with `scripts/seed.ts`; both honor
the same driver selection.

## Key directories

```
src/
├── app/
│   ├── (auth)/        # login, register (centered layout)
│   └── (app)/         # dashboard, tickets, tickets/[id], security (nav layout)
├── components/        # UI kit, badges, forms, controls, nav
├── db/                # schema + driver-selecting client
├── lib/
│   ├── jwt.ts         # JWT encrypt/decrypt (no server-only — usable in proxy)
│   ├── session.ts     # cookie create/read/delete (server-only)
│   ├── dal.ts         # verifySession / getCurrentUser / requireRole
│   ├── queries.ts     # role-scoped read queries
│   ├── actions/       # server actions (auth, tickets)
│   ├── rbac.ts        # pure role predicates
│   ├── sla.ts         # SLA computation
│   └── security-alerts.ts  # failed-login spike detection
└── proxy.ts           # optimistic auth redirects
scripts/               # migrate + seed (run with Node's native TS support)
drizzle/               # generated SQL migrations
```

## Data model

- **users** — id, email (unique), password_hash, name, role, created_at
- **tickets** — title, description, status, priority, category, created_by,
  assigned_to, sla_due_at, timestamps
- **ticket_notes** — ticket_id, author_id, body, is_internal, created_at
- **security_events** — type, actor_id, target_email/target_id, ip, user_agent,
  metadata (jsonb), created_at — the unified audit + security log
