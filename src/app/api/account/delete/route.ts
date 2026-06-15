import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/backend/auth";
import { authErrorResponse, clearSessionCookie, readSessionCookie } from "@/lib/backend/auth-route";
import { getDatabaseClient } from "@/lib/backend/db";
import { deleteArtistAccount, deleteBuyerAccount } from "@/lib/backend/account";

export const dynamic = "force-dynamic";

/**
 * POST /api/account/delete — permanently delete the signed-in user's data and
 * deactivate the account (FK-safe soft-delete/anonymise; purchase history is
 * retained). Buyers and artists both supported. Clears the session cookie so the
 * deleted credentials can no longer sign in.
 */
export async function POST(request: NextRequest) {
  try {
    const db = getDatabaseClient();
    const user = await requireRole(db, readSessionCookie(request), ["buyer", "artist"]);
    if (user.role === "buyer") {
      await deleteBuyerAccount(db, user);
    } else {
      await deleteArtistAccount(db, user);
    }
    return clearSessionCookie(NextResponse.json({ ok: true }));
  } catch (error) {
    return authErrorResponse(error);
  }
}
