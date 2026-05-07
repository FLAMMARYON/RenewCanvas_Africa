import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/backend/auth";
import { authErrorResponse, readJsonBody, readSessionCookie } from "@/lib/backend/auth-route";
import { getDatabaseClient } from "@/lib/backend/db";
import { addWishlistItem, listWishlist, type WishlistDatabase } from "@/lib/backend/wishlist";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const db = getDatabaseClient();
    const user = await requireRole(db, readSessionCookie(request), ["buyer"]);
    const wishlistDb = db as unknown as WishlistDatabase;
    const items = await listWishlist(wishlistDb, user);

    return NextResponse.json({ ok: true, items });
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDatabaseClient();
    const user = await requireRole(db, readSessionCookie(request), ["buyer"]);
    const wishlistDb = db as unknown as WishlistDatabase;
    const body = (await readJsonBody(request)) as { artworkId?: string };
    await addWishlistItem(wishlistDb, user, body.artworkId ?? "");
    const items = await listWishlist(wishlistDb, user);

    return NextResponse.json({ ok: true, items }, { status: 201 });
  } catch (error) {
    return authErrorResponse(error);
  }
}
