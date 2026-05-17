import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/backend/auth";
import { authErrorResponse, readJsonBody, readSessionCookie } from "@/lib/backend/auth-route";
import { getDatabaseClient } from "@/lib/backend/db";
import { createPayoutsForDeliveredOrder, listPayouts, type PayoutDatabase } from "@/lib/backend/payouts";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const db = getDatabaseClient();
    const user = await requireRole(db, readSessionCookie(request), ["artist", "admin"]);
    return NextResponse.json({ ok: true, payouts: await listPayouts(db as unknown as PayoutDatabase, user) });
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDatabaseClient();
    const admin = await requireRole(db, readSessionCookie(request), ["admin"]);
    const body = (await readJsonBody(request)) as Partial<{ orderId: string }>;
    const payouts = await createPayoutsForDeliveredOrder(db as unknown as PayoutDatabase, admin, body.orderId ?? "");
    return NextResponse.json({ ok: true, payouts }, { status: 201 });
  } catch (error) {
    return authErrorResponse(error);
  }
}
