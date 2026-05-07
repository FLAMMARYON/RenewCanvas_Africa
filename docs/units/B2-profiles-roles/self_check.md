# B2 Profiles And Roles Self Check

## Implementation

- Prisma schema includes buyer, artist, admin profile persistence and address records.
- Seed data creates idempotent buyer, artist, admin profile records and a default buyer address.
- `/api/profile` enforces an active authenticated session and updates only the signed-in user's role profile.
- Buyer, artist, and admin profile pages call the backend profile API for load/save.
- Artist profile no longer writes profile drafts to localStorage.

## Verification

Completed gates:

- `npm.cmd run db:generate`
- `npx.cmd prisma validate`
- `npm.cmd test` - 98 tests passed.
- `npm.cmd run typecheck`
- `npm.cmd run lint`
- `npm.cmd run db:migrate -- --name b2_profiles_roles`
- `npm.cmd run db:seed`
- `npx.cmd prisma migrate status`
- `npm.cmd run build` - 49 app routes built.
- `npm.cmd run test:e2e` - 4 browser tests passed.
