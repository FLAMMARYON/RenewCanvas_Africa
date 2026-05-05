# B0 Backend Foundations Handover

## Current Task

Start backend Phase B0 only. Do not start B1 or later phases, do not commit, and do not push.

## Agent Boundary

Codex is the only intended agent for this repository state. Claude or mixed-agent terminal artifacts should be treated as suspect unless they are clearly intentional project files.

## Files Created Or Changed

- `package.json`: added Prisma scripts, Prisma seed config, backend lint coverage, `@prisma/client`, and `dotenv`.
- `package-lock.json`: updated dependency lockfile for Prisma packages.
- `prisma.config.ts`: added Prisma 7 config with schema path, migrations path, seed command, and datasource URL.
- `prisma/schema.prisma`: added PostgreSQL schema for backend foundations.
- `prisma/seed.ts`: added idempotent baseline seed data.
- `src/lib/backend/config.ts`: added backend environment validation.
- `src/lib/backend/db.ts`: added shared Prisma client and health check helper.
- `src/app/api/health/route.ts`: added dynamic backend health endpoint.
- `tests/backend/config.test.ts`: added backend config tests.
- `tests/api/health-route.test.ts`: added health route tests.
- `docs/units/B0-backend-foundations/design.md`: added B0 design.
- `docs/units/B0-backend-foundations/self_check.md`: added B0 verification notes.
- `docs/units/B0-backend-foundations/session_handover.md`: this handover.

## Staging Intent

Stage only B0 backend foundation files after verification passes. Existing staged frontend/P1 files should not be unstaged or modified as part of B0.

## Unstaged Intent

Leave unrelated frontend UI changes alone. Do not stage broad UI edits while stabilising B0 unless a backend verification blocker directly requires it.

## Last Completed Actions

- Installed `@prisma/client` and `prisma`.
- Regenerated Prisma Client after adding `Artwork.slug`.
- Fixed TypeScript-safe environment mutation in `tests/api/health-route.test.ts`.
- Made the seed artwork idempotent with a stable slug.
- Fixed B0 review blockers by adding explicit `.env` loading, removing the Prisma fallback database URL, and making artist profile/audit log seed operations idempotent.
- Ran `npm.cmd test`: PASS, 82/82 tests.
- Ran `npm.cmd run typecheck`: PASS.
- Ran `npm.cmd run db:push`: FAIL because Prisma config requires `datasource.url` and no `DATABASE_URL` is set.

## Verification Results

- `npm.cmd run db:generate`: PASS.
- `npx.cmd prisma validate`: PASS.
- `npm.cmd test`: PASS, 82/82 tests.
- `npm.cmd run typecheck`: PASS.
- `npm.cmd run lint`: PASS.
- `$env:NEXT_TELEMETRY_DISABLED='1'; npm.cmd run build`: PASS, 45 routes including dynamic `/api/health`.
- `npm.cmd run db:push`: FAIL, no `DATABASE_URL` is configured for Prisma datasource URL.
- `npm.cmd run db:migrate`: not run because `DATABASE_URL` is not configured.
- `npm.cmd run db:seed`: not run because `DATABASE_URL` is not configured and the schema has not been applied.

## Current Risks

- No real database URL has been confirmed, so schema push, migration creation, and seed execution are not yet validated against a live database.
- Prisma 7 datasource configuration depends on `prisma.config.ts`; deployment setup must include `DATABASE_URL`.
- `npm audit` reports 5 moderate vulnerabilities after dependency installation.
- The backend foundation is present, but no frontend flows are wired to database-backed APIs yet.

## Recommended Next Steps

1. Provision or confirm a local PostgreSQL `DATABASE_URL` in `.env`, the shell, or the hosting platform.
2. Start the PostgreSQL server and verify the configured host is reachable.
3. Run `npm.cmd run db:push` or `npm.cmd run db:migrate` against that database.
4. Run `npm.cmd run db:seed`.
5. Start B1 auth only after B0 database execution is confirmed.

## Do Not Commit Until

- `npm.cmd test` passes.
- `npm.cmd run lint` passes.
- `npm.cmd run typecheck` passes.
- `$env:NEXT_TELEMETRY_DISABLED='1'; npm.cmd run build` passes.
- The staged file list is reviewed and contains only intentional frontend-ready work plus B0 backend foundation files.
- A real local or hosted `DATABASE_URL` has been used to run db push/migrate and seed successfully.
