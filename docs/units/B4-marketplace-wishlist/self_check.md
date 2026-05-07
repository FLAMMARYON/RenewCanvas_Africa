# B4 Marketplace Search And Wishlist Self Check

## Implementation

- Marketplace query API supports search, category, material, price bounds, sorting, and pagination.
- Buyer wishlist is persisted in PostgreSQL.
- Wishlist add/remove updates artwork favourite counters.
- Artwork detail pages record view counts.
- Buyer wishlist page no longer uses local wishlist removal state.

## Verification

Completed gates:

- `npm.cmd run db:generate`
- `npx.cmd prisma validate`
- `npm.cmd test` - 107 tests passed.
- `npm.cmd run typecheck`
- `npm.cmd run lint`
- `npm.cmd run db:migrate -- --name b4_marketplace_wishlist`
- `npm.cmd run db:seed`
- `npx.cmd prisma migrate status`
- `npm.cmd run build` - 49 app routes built.
- `npm.cmd run test:e2e` - 4 browser tests passed.
