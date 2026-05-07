import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/backend/auth";
import { authErrorResponse, readSessionCookie } from "@/lib/backend/auth-route";
import { getDatabaseClient } from "@/lib/backend/db";
import { removeWishlistItem, type WishlistDatabase } from "@/lib/backend/wishlist";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ artworkId: string }>;
};

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const db = getDatabaseClient();
    const user = await requireRole(db, readSessionCookie(request), ["buyer"]);
    const wishlistDb = db as unknown as WishlistDatabase;
    const { artworkId } = await context.params;
    await removeWishlistItem(wishlistDb, user, artworkId);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return authErrorResponse(error);
  }
}
