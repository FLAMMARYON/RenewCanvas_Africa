import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/backend/auth";
import { authErrorResponse, readSessionCookie } from "@/lib/backend/auth-route";
import { getDatabaseClient } from "@/lib/backend/db";
import { getOrder, normalizeOrder, type OrderDatabase } from "@/lib/backend/orders";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const db = getDatabaseClient();
    const user = await requireRole(db, readSessionCookie(request), ["buyer", "artist", "admin"]);
    const params = await context.params;
    const order = await getOrder(db as unknown as OrderDatabase, user, params.id);
    return NextResponse.json({ ok: true, order: normalizeOrder(order, user.role) });
  } catch (error) {
    return authErrorResponse(error);
  }
}
