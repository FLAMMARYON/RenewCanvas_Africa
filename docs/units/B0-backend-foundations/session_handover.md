# B0 Backend Foundations Handover

## Current Task

Start backend Phase B0 only. Do not start B1 or later phases, do not commit, and do not push.

## Agent Boundary

Codex is the only intended agent for this repository state. Claude or mixed-agent terminal artifacts should be treated as suspect unless they are clearly intentional project files.

## Files Created Or Changed

- `package.json`: added Prisma scripts, Prisma seed config, backend lint coverage, `@prisma/client`, `@prisma/adapter-pg`, `pg`, and `dotenv`.
- `package-lock.json`: updated dependency lockfile for Prisma packages.
- `prisma.config.ts`: added Prisma 7 config with schema path, migrations path, seed command, and datasource URL.
- `prisma/schema.prisma`: added PostgreSQL schema for backend foundations.
- `prisma/migrations/20260505152456_init/migration.sql`: added initial baseline migration for the B0 schema.
- `prisma/seed.ts`: added idempotent baseline seed data.
- `src/lib/backend/config.ts`: added backend environment validation.
- `src/lib/backend/db.ts`: added shared Prisma client with the Prisma 7 PostgreSQL adapter and health check helper.
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
- Installed PostgreSQL 17 locally; service `postgresql-x64-17` is running.
- Created local database `renewcanvas` and app role `renewcanvas`.
- Added ignored local `.env` with `DATABASE_URL`.
- Installed `@prisma/adapter-pg` and `pg`.
- Updated Prisma runtime client creation to use the PostgreSQL driver adapter required by Prisma 7.
- Ran `npm.cmd run db:push`: PASS.
- Ran `npm.cmd run db:seed`: PASS.
- Generated initial migration from the schema and marked it applied in the existing local database.
- Ran `npm.cmd audit fix`: no safe fixes available; force mode would downgrade Prisma and Next.
- Checked `npm.cmd outdated`: no newer Next or Prisma versions were available.
- Reinstalled `next@latest`, `prisma@latest`, `@prisma/client@latest`, and `@prisma/adapter-pg@latest`; packages were already up to date.

## Verification Results

- `npm.cmd run db:generate`: PASS.
- `npx.cmd prisma validate`: PASS.
- `npm.cmd test`: PASS, 82/82 tests.
- `npm.cmd run typecheck`: PASS.
- `npm.cmd run lint`: PASS.
- `$env:NEXT_TELEMETRY_DISABLED='1'; npm.cmd run build`: PASS, 45 routes including dynamic `/api/health`.
- `npm.cmd run db:push`: PASS against local PostgreSQL.
- `npm.cmd run db:seed`: PASS.
- Direct Prisma database check: PASS with `select 1` and seed counts of 3 users, 1 artist profile, 1 artwork, and 1 audit log.
- Direct `/api/health` route check: PASS with HTTP 200 and `database.status: "ok"`.
- `npx.cmd prisma migrate status`: PASS, 1 migration found and database schema is up to date.
- `npm.cmd audit fix`: no safe changes available; remaining fixes require breaking `--force` downgrades.
- `npm.cmd audit --omit=dev`: still reports the same 5 moderate transitive findings.

## Current Risks

- Prisma 7 datasource configuration depends on `prisma.config.ts` and runtime code depends on `@prisma/adapter-pg`; deployment setup must include `DATABASE_URL`.
- `npm audit` reports 5 moderate vulnerabilities after dependency installation; current audit remediation requires breaking downgrades to Prisma 6.19.3 and Next 9.3.3, and latest available Next/Prisma packages do not yet clear them.
- The backend foundation is present, but no frontend flows are wired to database-backed APIs yet.

## Recommended Next Steps

1. Start B1 auth and sessions from the B0 `User` table.
2. Add session, password reset, and email verification token models.
3. Monitor Prisma and Next releases for patched transitive dependencies that resolve the remaining moderate audit findings without major downgrades.
4. Before serious production launch, follow the dependency-audit exception process in `docs/foundations/security.md` if any transitive advisories remain unresolved.
5. Keep frontend mock/local data replacement scoped to the later backend phases listed in `docs/plan/backend_journey.md`.

## Do Not Commit Until

- `npm.cmd test` passes.
- `npm.cmd run lint` passes.
- `npm.cmd run typecheck` passes.
- `$env:NEXT_TELEMETRY_DISABLED='1'; npm.cmd run build` passes.
- The staged file list is reviewed and contains only intentional frontend-ready work plus B0 backend foundation files.
- A real local or hosted `DATABASE_URL` has been used to run db push/migrate and seed successfully.
