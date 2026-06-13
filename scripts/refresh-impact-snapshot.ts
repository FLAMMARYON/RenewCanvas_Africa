/**
 * Recompute and store today's impact snapshot from the corrected
 * getPlatformMetrics (confirmed-orders source of truth). The public /impact page
 * (/api/metrics) prefers the latest stored snapshot, so this makes the fix
 * visible immediately instead of waiting for the nightly cron.
 *
 * Run: npx tsx scripts/refresh-impact-snapshot.ts
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env" });
loadEnv({ path: ".env.local", override: true });

import { getDatabaseClient } from "@/lib/backend/db";
import { snapshotImpactMetrics, getPlatformMetrics } from "@/lib/backend/metrics";

async function main() {
  const db = getDatabaseClient();
  const live = await getPlatformMetrics(db);
  console.log("Live (confirmed-orders) platform metrics:");
  console.log(JSON.stringify(live, null, 2));
  const stored = await snapshotImpactMetrics(db);
  console.log("\nStored today's snapshot:");
  console.log(`  kgDiverted=${stored.kgDiverted}  artistIncomeRwf=${stored.artistIncomeRwf}  artists=${stored.artistCount}  artworks=${stored.artworkCount}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Snapshot refresh failed:", error);
    process.exit(1);
  });
