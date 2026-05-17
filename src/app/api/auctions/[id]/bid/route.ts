import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/backend/auth";
import { authErrorResponse, readJsonBody, readSessionCookie } from "@/lib/backend/auth-route";
import { getDatabaseClient } from "@/lib/backend/db";
import { placeBid, type AuctionDatabase } from "@/lib/backend/auctions";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const db = getDatabaseClient();
    const buyer = await requireRole(db, readSessionCookie(request), ["buyer"]);
    const body = (await readJsonBody(request)) as Partial<{ amountCents: number }>;
    const { id } = await context.params;
    const bid = await placeBid(db as unknown as AuctionDatabase, buyer, id, body.amountCents ?? 0);
    return NextResponse.json({ ok: true, bid }, { status: 201 });
  } catch (error) {
    return authErrorResponse(error);
  }
}
