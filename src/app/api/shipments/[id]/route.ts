import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/backend/auth";
import { authErrorResponse, readJsonBody, readSessionCookie } from "@/lib/backend/auth-route";
import { getDatabaseClient } from "@/lib/backend/db";
import { updateShipmentStatus, type FulfillmentDatabase, type ShipmentStatus } from "@/lib/backend/fulfillment";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const db = getDatabaseClient();
    const user = await requireRole(db, readSessionCookie(request), ["artist", "admin"]);
    const body = (await readJsonBody(request)) as Partial<{ status: ShipmentStatus; carrier: string; trackingNumber: string }>;
    const { id } = await context.params;
    const shipment = await updateShipmentStatus(db as unknown as FulfillmentDatabase, user, id, {
      status: body.status ?? "preparing",
      carrier: body.carrier,
      trackingNumber: body.trackingNumber,
    });
    return NextResponse.json({ ok: true, shipment });
  } catch (error) {
    return authErrorResponse(error);
  }
}
