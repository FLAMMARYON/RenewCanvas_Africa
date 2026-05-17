import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/backend/auth";
import { authErrorResponse, readJsonBody, readSessionCookie } from "@/lib/backend/auth-route";
import { getDatabaseClient } from "@/lib/backend/db";
import { listAuctions, scheduleAuction, type AuctionDatabase } from "@/lib/backend/auctions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getDatabaseClient();
    return NextResponse.json({ ok: true, auctions: await listAuctions(db as unknown as AuctionDatabase) });
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDatabaseClient();
    const admin = await requireRole(db, readSessionCookie(request), ["admin"]);
    const body = (await readJsonBody(request)) as Partial<{ artworkId: string; startsAt: string; endsAt: string; startingBidCents: number; reserveCents: number; minIncrementCents: number }>;
    const auction = await scheduleAuction(db as unknown as AuctionDatabase, admin, {
      artworkId: body.artworkId,
      startsAt: body.startsAt ? new Date(body.startsAt) : undefined,
      endsAt: body.endsAt ? new Date(body.endsAt) : undefined,
      startingBidCents: body.startingBidCents,
      reserveCents: body.reserveCents,
      minIncrementCents: body.minIncrementCents,
    });
    return NextResponse.json({ ok: true, auction }, { status: 201 });
  } catch (error) {
    return authErrorResponse(error);
  }
}
