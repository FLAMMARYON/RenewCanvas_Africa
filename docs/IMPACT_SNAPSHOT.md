# Daily impact snapshot

The home page impact figures are read from the database and refreshed once per
day (not recomputed on every page load).

## How it works

1. **Compute** — `getPlatformMetrics()` in
   [`src/lib/backend/metrics.ts`](../src/lib/backend/metrics.ts) aggregates the
   live figures from these DB fields:
   - Waste diverted → `Artwork.kgDiverted` (status `listed`/`sold`)
   - Artist income (`artistIncomeRwf`) → `PayoutLedger.payoutCents` (status `paid`)
   - CO₂ avoided → `ImpactEstimate.co2eAvoidedKg`
   - Artists → `User` count (role `artist`, active); Artworks → `Artwork` count
   - Derived: `treesEquivalent`, `waterSavedLitres`

2. **Snapshot** — `snapshotImpactMetrics()` stores the result as one row per day
   in the existing `AnalyticsDailyAggregate` table
   (`metric = "impact_snapshot"`; `value` = rounded kg diverted; `metadata` = the
   full metrics object). Re-running on the same Kigali day updates that row.

3. **Read** — `GET /api/metrics` (public) returns the most recent snapshot via
   `getLatestImpactSnapshot()`, falling back to a live computation if no snapshot
   exists yet. The home page already fetches `/api/metrics`, so no front-end
   change was needed.

## The scheduled job

- **Endpoint:** [`/api/cron/impact-snapshot`](../src/app/api/cron/impact-snapshot/route.ts) (GET)
- **Schedule:** `vercel.json` → `0 22 * * *` (cron is **UTC**; 22:00 UTC = 00:00
  Africa/Kigali, UTC+2). Edit that entry to change the time.
- **Auth:** requires `Authorization: Bearer $CRON_SECRET`. Vercel Cron adds this
  automatically when `CRON_SECRET` is set in the project env. (Unauthenticated
  calls are allowed only in development.)
- **Manual run (local):** `curl http://localhost:3000/api/cron/impact-snapshot`

## Timezone

"Midnight" is Africa/Kigali (CAT, UTC+2, no DST). The snapshot date key is the
Kigali calendar date normalised to a UTC `Date` for storage.
