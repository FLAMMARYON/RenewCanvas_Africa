import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/backend/auth";
import { authErrorResponse, readSessionCookie } from "@/lib/backend/auth-route";
import { getDatabaseClient } from "@/lib/backend/db";
import { getArtistEarnings } from "@/lib/backend/earnings";

export const dynamic = "force-dynamic";

/**
 * GET /api/artist/earnings
 * Returns the signed-in artist's stored confirmed earnings + kg diverted
 * (read from running totals; not recomputed).
 */
export async function GET(request: NextRequest) {
  try {
    const db = getDatabaseClient();
    const user = await requireRole(db, readSessionCookie(request), ["artist"]);
    const earnings = await getArtistEarnings(db, user.id);
    return NextResponse.json({ ok: true, ...earnings });
  } catch (error) {
    return authErrorResponse(error);
  }
}
