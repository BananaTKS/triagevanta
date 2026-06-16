# Security model

Security is the differentiating concern of this project, so the design choices
are deliberate and documented here.

## Authentication

- Passwords are hashed with **bcrypt** (`bcryptjs`); plaintext is never stored
  or returned.
- Login uses a **fixed-cost dummy comparison** when the email is unknown, so the
  response time does not reveal whether an account exists (mitigates user
  enumeration).
- Sessions are **stateless JWTs** signed with `HS256` (`jose`) and stored in an
  **httpOnly, SameSite=Lax** cookie (`Secure` in production). The token carries
  only the user id and role — no PII.

## Authorization (defense in depth)

Authorization is enforced in three layers, with the **server** layers being
authoritative:

1. **Proxy (optimistic only)** — `src/proxy.ts` redirects unauthenticated users
   but never makes trust decisions on data.
2. **Data Access Layer** — every page/action calls `getCurrentUser()` /
   `requireRole()` from `src/lib/dal.ts`. Admin-only pages (`/security`) and
   staff-only actions (assign, change status) are gated here.
3. **Query-level scoping** — `src/lib/queries.ts` filters rows by role:
   employees only ever receive their own tickets, and internal notes are stripped
   for non-staff before leaving the server.

UI hiding (e.g. not rendering the Security nav link for employees) is treated as
convenience, **not** a security control.

## Auditing & monitoring

- Sensitive events are written to `security_events`: `login_success`,
  `login_failure`, `logout`, `user_created`, `role_change`, `ticket_assigned`,
  `admin_action`.
- The admin **security dashboard** surfaces failed-login counts and a
  **spike-detection rule**: 5+ failures for the same account/IP within a 15-minute
  window raise an alert (`src/lib/security-alerts.ts`, unit-tested).

## OWASP Top 10 mapping

| OWASP category                         | How TriageVanta addresses it                                                                 |
| -------------------------------------- | -------------------------------------------------------------------------------------------- |
| A01 Broken Access Control              | Server-side `requireRole` + row-level query scoping; proxy is optimistic only                |
| A02 Cryptographic Failures             | bcrypt password hashing; signed JWT sessions; httpOnly/Secure/SameSite cookies               |
| A03 Injection                          | Parameterized queries via Drizzle ORM; all input validated with Zod                          |
| A04 Insecure Design                    | Auth/role checks centralized in a Data Access Layer; minimal session payload                 |
| A05 Security Misconfiguration          | Secrets via env vars (never committed); `.env.example` documents required config             |
| A07 Identification & Auth Failures     | Password policy, anti-enumeration timing, session expiry, failed-login alerting              |
| A09 Security Logging & Monitoring      | Unified audit log + security dashboard with alert rule                                        |

## Known limitations (tracked in ROADMAP)

- No rate limiting yet (planned, Phase 5).
- No CSRF token beyond SameSite cookies (Server Actions + SameSite=Lax mitigate
  common cases; explicit CSRF hardening is planned).
- No email verification / password reset flow in v1.
