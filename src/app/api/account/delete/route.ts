import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/backend/auth";
import { authErrorResponse, clearSessionCookie, readSessionCookie } from "@/lib/backend/auth-route";
import { getDatabaseClient } from "@/lib/backend/db";
import { deleteArtistAccount } from "@/lib/backend/account";

export const dynamic = "force-dynamic";

/**
 * POST /api/account/delete — permanently delete the signed-in artist's data
 * (profile, payout info, deletable artworks, wishlist, notifications, analytics)
 * and deactivate the account. Clears the session cookie.
 */
export async function POST(request: NextRequest) {
  try {
    const db = getDatabaseClient();
    const user = await requireRole(db, readSessionCookie(request), ["artist"]);
    await deleteArtistAccount(db, user);
    return clearSessionCookie(NextResponse.json({ ok: true }));
  } catch (error) {
    return authErrorResponse(error);
  }
}
