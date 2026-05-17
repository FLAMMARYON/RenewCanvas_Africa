import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/backend/auth";
import { authErrorResponse, readJsonBody, readSessionCookie } from "@/lib/backend/auth-route";
import { getDatabaseClient } from "@/lib/backend/db";
import { createShipmentForPaidOrder, listShipments, type FulfillmentDatabase } from "@/lib/backend/fulfillment";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const db = getDatabaseClient();
    const user = await requireRole(db, readSessionCookie(request), ["buyer", "artist", "admin"]);
    return NextResponse.json({ ok: true, shipments: await listShipments(db as unknown as FulfillmentDatabase, user) });
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDatabaseClient();
    const admin = await requireRole(db, readSessionCookie(request), ["admin"]);
    const body = (await readJsonBody(request)) as Partial<{ orderId: string }>;
    const shipment = await createShipmentForPaidOrder(db as unknown as FulfillmentDatabase, admin, body.orderId ?? "");
    return NextResponse.json({ ok: true, shipment }, { status: 201 });
  } catch (error) {
    return authErrorResponse(error);
  }
}
