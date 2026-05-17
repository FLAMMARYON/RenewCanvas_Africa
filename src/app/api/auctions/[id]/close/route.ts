import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/backend/auth";
import { authErrorResponse, readSessionCookie } from "@/lib/backend/auth-route";
import { getDatabaseClient } from "@/lib/backend/db";
import { closeAuction, type AuctionDatabase } from "@/lib/backend/auctions";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const db = getDatabaseClient();
    const admin = await requireRole(db, readSessionCookie(request), ["admin"]);
    const { id } = await context.params;
    const auction = await closeAuction(db as unknown as AuctionDatabase, admin, id);
    return NextResponse.json({ ok: true, auction });
  } catch (error) {
    return authErrorResponse(error);
  }
}
