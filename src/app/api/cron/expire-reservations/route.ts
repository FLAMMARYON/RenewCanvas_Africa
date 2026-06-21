/**
 * Reservation auto-cancel job.
 *
 * Finds artwork reservations older than the 30-minute window, cancels their
 * pending orders, and returns the artworks to `listed` so they reappear on the
 * marketplace + virtual gallery.
 *
 * Scheduled by Vercel Cron (see vercel.json). Vercel invokes this with a GET and,
 * when CRON_SECRET is set, an `Authorization: Bearer <CRON_SECRET>` header. To
 * change the cadence, edit the cron entry in vercel.json.
 */
import { NextRequest, NextResponse } from "next/server";
import { getDatabaseClient } from "@/lib/backend/db";
import { expireStaleReservations } from "@/lib/backend/reservations";

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
    const result = await expireStaleReservations(db);

    return NextResponse.json({
      success: true,
      ranAt: new Date().toISOString(),
      ...result,
    });
  } catch (error) {
    console.error("Error expiring reservations:", error);
    return NextResponse.json({ error: "Failed to expire reservations" }, { status: 500 });
  }
}
