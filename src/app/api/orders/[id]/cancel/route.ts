import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/backend/auth";
import { authErrorResponse, readSessionCookie } from "@/lib/backend/auth-route";
import { getDatabaseClient } from "@/lib/backend/db";
import { cancelOwnOrder } from "@/lib/backend/orders";

export const dynamic = "force-dynamic";

/**
 * POST /api/orders/[id]/cancel — buyer cancels their OWN pending order.
 * Sets the order to `cancelled` and releases the reserved artwork. Scoped to the
 * authenticated owning buyer (cancelOwnOrder enforces ownership + status).
 */
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const db = getDatabaseClient();
    const buyer = await requireRole(db, readSessionCookie(request), ["buyer"]);
    const { id } = await context.params;
    const result = await cancelOwnOrder(db, buyer, id);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return authErrorResponse(error);
  }
}
