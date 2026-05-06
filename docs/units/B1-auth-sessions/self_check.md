# B1 Auth And Sessions Self Check

Date: 2026-05-06

## Acceptance Mapping

| Requirement | Status |
| --- | --- |
| Use B0 `User` table for real account records | Implemented |
| Add sessions, password reset tokens, and email verification tokens | Implemented in Prisma schema |
| Password hashing | Implemented with salted `scrypt` |
| Register, login, and logout APIs | Implemented |
| Secure session cookie | Implemented as HTTP-only `SameSite=Lax` cookie |
| Server-side role checks | Implemented through `requireRole` |
| Dashboard route protection backed by real session state | Implemented in dashboard shell via `/api/auth/session` |
| Password reset flow stores and validates real tokens | Implemented |

## Verification

- `npm.cmd run db:generate`: PASS.
- `npm.cmd test`: PASS, 88/88 tests.
- `npm.cmd run typecheck`: PASS.
- `npm.cmd run lint`: PASS, zero warnings.
- `npm.cmd run db:migrate -- --name b1_auth_sessions`: PASS outside the sandbox after sandboxed Prisma hit Windows home-directory `EPERM`.
- `npm.cmd run db:seed`: PASS.
- `$env:NEXT_TELEMETRY_DISABLED='1'; npm.cmd run build`: PASS, 51 routes including six auth API routes.
- `npm.cmd run test:e2e`: PASS, 4/4 browser tests.
- `npx.cmd prisma migrate status`: PASS, 2 migrations found and database schema is up to date.

## Known Follow-Up

- Email sending is deferred to B11 notifications. In development and test, reset and verification tokens may be returned by API responses for manual testing.
- CSRF and rate limiting remain B15 hardening work.
- Later backend phases should use `requireRole` for protected API endpoints as they are added.
