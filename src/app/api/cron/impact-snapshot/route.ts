/**
 * Daily impact snapshot job.
 *
 * Recomputes the platform impact figures and stores them as the day's snapshot
 * (AnalyticsDailyAggregate, metric "impact_snapshot"). The home page then shows
 * the most recent snapshot via /api/metrics.
 *
 * Scheduled by Vercel Cron (see vercel.json) at 22:00 UTC = 00:00 Africa/Kigali.
 * Vercel Cron invokes this with a GET and, when CRON_SECRET is set, an
 * `Authorization: Bearer <CRON_SECRET>` header. To change the schedule, edit the
 * cron entry in vercel.json.
 */

import { NextRequest, NextResponse } from "next/server";
import { getDatabaseClient } from "@/lib/backend/db";
import { snapshotImpactMetrics } from "@/lib/backend/metrics";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get("authorization");
    const isDevelopment = process.env.NODE_ENV === "development";
    const hasValidSecret = cronSecret && authHeader === `Bearer ${cronSecret}`;

    if (!hasValidSecret && !isDevelopment) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDatabaseClient();
    const metrics = await snapshotImpactMetrics(db);

    return NextResponse.json({
      success: true,
      snapshotAt: new Date().toISOString(),
      metrics,
    });
  } catch (error) {
    console.error("Error creating impact snapshot:", error);
    return NextResponse.json({ error: "Failed to create impact snapshot" }, { status: 500 });
  }
}
