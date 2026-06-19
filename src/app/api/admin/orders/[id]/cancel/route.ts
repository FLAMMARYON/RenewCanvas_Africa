import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/backend/auth";
import { authErrorResponse, readSessionCookie } from "@/lib/backend/auth-route";
import { getDatabaseClient } from "@/lib/backend/db";
import { cancelOrder } from "@/lib/backend/admin-orders";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const db = getDatabaseClient();
    const admin = await requireRole(db, readSessionCookie(request), ["admin"]);
    const { id } = await context.params;
    const result = await cancelOrder(db, admin.id, id);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return authErrorResponse(error);
  }
}
