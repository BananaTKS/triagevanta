# Roadmap

TriageVanta v1 ships a deliberately small, finished core: authentication + RBAC,
a ticketing workflow with SLAs, and a security/audit dashboard. The items below
are intentionally **out of scope for v1** and tracked as the next phases.

## v1 (shipped)

- [x] Email/password auth with hashed passwords (bcrypt) and JWT sessions
- [x] Role-based access control: employee / IT staff / admin
- [x] Tickets: create, list (role-scoped), detail, status, assignment, SLA due dates
- [x] Internal vs. public notes (internal hidden from employees)
- [x] Audit + security event log
- [x] Admin security dashboard with failed-login spike alerting
- [x] Docker Compose Postgres + embedded PGlite for zero-setup local dev
- [x] Unit tests (SLA, RBAC, alerting) + CI-ready build

## Phase 2 — service desk depth

- [x] Ticket search, filtering, and pagination
- [x] Knowledge base articles, linked to tickets, with "did this help?" tracking
- [x] Mock email-notification log (per-user inbox)
- [ ] Saved views / queues per IT staff member

## Phase 3 — IT operations

- [x] Asset inventory (laptops/monitors, assignment, warranty, lifecycle log)
- [x] Employee onboarding tracker (checklist template, completion progress)
- [ ] Onboarding PDF / report export

## Phase 4 — automation

- [x] Auto-categorize tickets by keyword
- [ ] Auto-suggest knowledge base articles
- [ ] Auto-close stale resolved tickets
- [ ] Scheduled monthly IT report + CSV export

## Phase 5 — observability & hardening

- [ ] OpenTelemetry traces/metrics/logs; Prometheus + Grafana
- [ ] Rate limiting on auth endpoints
- [ ] CSP and additional secure headers
- [ ] CodeQL + Dependabot in CI
