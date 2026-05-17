import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/backend/auth";
import { authErrorResponse, readJsonBody, readSessionCookie } from "@/lib/backend/auth-route";
import { getDatabaseClient } from "@/lib/backend/db";
import { markPayout, type PayoutDatabase } from "@/lib/backend/payouts";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const db = getDatabaseClient();
    const admin = await requireRole(db, readSessionCookie(request), ["admin"]);
    const body = (await readJsonBody(request)) as Partial<{ status: "approved" | "paid" | "failed" }>;
    const { id } = await context.params;
    const payout = await markPayout(db as unknown as PayoutDatabase, admin, id, body.status ?? "approved");
    return NextResponse.json({ ok: true, payout });
  } catch (error) {
    return authErrorResponse(error);
  }
}
