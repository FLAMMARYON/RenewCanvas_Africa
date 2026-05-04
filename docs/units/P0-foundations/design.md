# P0-foundations Design

## Chosen Approach

Establish a lightweight but enforceable foundation inside the existing Next.js repository without introducing a database, Python service, or CI provider before the project is ready for those heavier integrations. This unit creates reproducible local quality gates, shared operational utilities, environment validation, request observability primitives, rate-limit scaffolding, and security/accessibility documentation that later units must reuse.

The current app is a Next.js prototype with mock data and no test harness. The safest first step is to add scripts and small framework-agnostic modules that can be tested locally and used by future API routes:

- `npm run typecheck` for strict TypeScript validation.
- `npm test` for Node's built-in test runner.
- Shared `src/lib/foundation/*` utilities for environment access, structured logging, request metadata, and in-memory rate limiting.
- `docs/foundations/*` for secrets, observability, accessibility, and security conventions.
- `open/README.md` to define where open-source artifacts will live.

## Alternatives Considered

- **Add Jest/Vitest now:** Better developer ergonomics, but adds more dependencies before the foundation is stable. Rejected for this unit; Node's built-in test runner is enough for foundation utilities.
- **Add full CI provider config now:** Useful, but the environment for deployment is not yet known. Rejected until deployment target is selected.
- **Add database/Prisma now:** Required later for real persistence, but premature for P0. The data model unit should own migrations.
- **Add Python ML service now:** Required later for deep-learning units, but premature before API contracts and schemas exist.

## Data Schema Changes

No database schema changes in P0. This unit only establishes repository and runtime foundations.

## API Surface

No public API endpoints are added. Foundation modules expose internal helpers:

- environment variable lookup with clear error messages.
- structured JSON log payload construction.
- request ID creation.
- in-memory rate-limit checks for development/prototype endpoints.

## Model Card

No ML model is introduced in P0.

## Failure Modes

- Local tests fail because Node cannot load TypeScript directly. Mitigation: tests target compiled-independent JavaScript or simple deterministic utilities where possible.
- In-memory rate limiting is mistaken for production distributed rate limiting. Mitigation: documentation explicitly marks it as prototype/local only.
- Logging accidentally captures raw sensitive input. Mitigation: logging utility only accepts explicit metadata and docs prohibit raw payload logging.

## Rollback Plan

Revert the P0 commit. No database migrations or external services are introduced, so rollback is limited to package scripts, docs, and foundation utility files.

## TODOs Filed For Later Units

- Add database migrations in the data model unit.
- Add real distributed rate limiting before public production endpoints.
- Add CI provider configuration once hosting target is chosen.
- Add Python service scaffolding in the first unit that requires model inference.
