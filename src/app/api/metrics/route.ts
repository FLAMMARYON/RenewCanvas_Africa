/**
 * Platform Metrics API
 * Returns real-time calculated metrics from the database
 *
 * GET /api/metrics - Public endpoint for basic platform metrics
 * GET /api/metrics?detailed=true - Admin endpoint for full metrics (requires auth)
 */

import { NextRequest, NextResponse } from "next/server";
import { getDatabaseClient } from "@/lib/backend/db";
import { readSessionUser } from "@/lib/backend/auth";
import { readSessionCookie } from "@/lib/backend/auth-route";
import {
  getPlatformMetrics,
  getDetailedMetrics,
} from "@/lib/backend/metrics";

export async function GET(request: NextRequest) {
  try {
    const db = getDatabaseClient();
    const url = new URL(request.url);
    const detailed = url.searchParams.get("detailed") === "true";

    if (detailed) {
      // Detailed metrics require admin authentication
      const session = await readSessionUser(db, readSessionCookie(request));
      if (!session || session.role !== "admin") {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }

      const metrics = await getDetailedMetrics(db);
      return NextResponse.json(metrics);
    }

    // Public metrics
    const metrics = await getPlatformMetrics(db);
    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}
