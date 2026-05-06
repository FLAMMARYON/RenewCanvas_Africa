# B1 Auth And Sessions Handover

## Current Task

Backend Phase B1: replace frontend-only auth with database-backed accounts, secure sessions, auth APIs, and password reset tokens.

## Files Created Or Changed

- `prisma/schema.prisma`: adds `AuthSession`, `PasswordResetToken`, and `EmailVerificationToken`.
- `prisma/migrations/20260506213319_b1_auth_sessions/migration.sql`: adds auth session and token tables.
- `prisma/migrations/migration_lock.toml`: Prisma migration provider lock.
- `prisma/seed.ts`: seeds demo user password hashes for `Password1!`.
- `src/lib/backend/auth.ts`: auth service, password hashing, session tokens, reset tokens, and role checks.
- `src/lib/backend/auth-route.ts`: Next route cookie and error helpers.
- `src/app/api/auth/**/route.ts`: register, login, logout, session, password reset request, and password reset confirm APIs.
- `src/lib/frontend/auth-api.ts`: browser API client for auth screens.
- `src/app/login/page.tsx`: calls real login API.
- `src/app/register/page.tsx`: calls real register API.
- `src/app/forgot-password/page.tsx`: requests backend reset tokens.
- `src/app/reset-password/page.tsx`: confirms backend reset tokens.
- `src/components/DashboardLayout.tsx`: validates the server session instead of browser-local sessions.
- `tests/backend/auth.test.ts`: auth behavior coverage.
- `docs/units/B1-auth-sessions/*`: design, self-check, and handover.

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

## Next Step

Continue to B2 profiles and roles. Do not start B3 artwork persistence until B2 is complete.
