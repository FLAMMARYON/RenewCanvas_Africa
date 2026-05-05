# B0 Backend Foundations Design

## Goal

Establish the backend base for RenewCanvas without changing the completed frontend surface or starting later backend phases.

## Scope

- PostgreSQL as the production database target.
- Prisma ORM and generated client.
- Backend environment validation that allows frontend build/test without a configured database, but requires `DATABASE_URL` for database-backed operations.
- A dynamic `/api/health` route that reports app health and database readiness.
- Initial relational schema for users, artist profiles, artworks, artwork images, materials, orders, order items, and audit logs.
- Idempotent seed data for baseline admin, artist, buyer, and sample listed artwork records.
- Backend unit tests for configuration and health route behavior.

## Database Model

The first schema is intentionally broad enough to support the next backend phases without implementing those phases now:

- `User`: shared account record for buyers, artists, and admins.
- `ArtistProfile`: artist-specific profile and verification metadata.
- `Artwork`: owned artwork inventory with lifecycle status, stable `slug`, price, and impact summary.
- `ArtworkImage`: ordered artwork media references.
- `ArtworkMaterial`: verified material and weight records for impact persistence.
- `Order` and `OrderItem`: order skeleton for later checkout and payment phases.
- `AuditLog`: admin and backend action trace.

## Runtime Behavior

`readBackendConfig` validates `NODE_ENV` and optional `DATABASE_URL`. Missing `DATABASE_URL` is allowed by default so frontend builds and tests can continue before a local or hosted database is provisioned. Database operations can opt into `requireDatabase`.

Prisma config and seed scripts load `.env` explicitly with `dotenv/config`. There is no fallback database URL; local and deployed environments must provide `DATABASE_URL` through the shell, `.env`, or platform environment variables before running database push, migration, or seed commands.

`/api/health` returns:

- `200` with `database.status: "not_configured"` when no database URL is present.
- `503` with `database.status: "invalid_config"` when the environment is invalid.
- `503` with `database.status: "unavailable"` when a configured database cannot be reached.
- `200` with `database.status: "ok"` when the database responds.

## Commands

- `npm.cmd run db:generate`: regenerate Prisma Client.
- `npm.cmd run db:push`: push schema to a development database after `DATABASE_URL` is configured.
- `npm.cmd run db:migrate`: create and apply development migrations after `DATABASE_URL` is configured.
- `npm.cmd run db:seed`: load baseline seed records after schema application.
- `npm.cmd run db:studio`: inspect local database state.

## Out Of Scope

- Real auth/session implementation.
- Payment provider integration.
- File upload storage.
- Replacing frontend mock/local data flows.
- Production migration deployment.
- Hosted database provisioning.
