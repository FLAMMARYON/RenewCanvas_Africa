import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/backend/auth";
import { authErrorResponse, readJsonBody, readSessionCookie } from "@/lib/backend/auth-route";
import { getDatabaseClient } from "@/lib/backend/db";
import { createOrder, listOrders, normalizeOrder, type OrderDatabase } from "@/lib/backend/orders";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const db = getDatabaseClient();
    const user = await requireRole(db, readSessionCookie(request), ["buyer", "artist", "admin"]);
    const orders = await listOrders(db as unknown as OrderDatabase, user);
    return NextResponse.json({ ok: true, orders: orders.map((order) => normalizeOrder(order, user.role)) });
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDatabaseClient();
    const buyer = await requireRole(db, readSessionCookie(request), ["buyer"]);
    const body = (await readJsonBody(request)) as Partial<{
      artworkId: string;
      paymentMethod: string;
      deliveryAddress: Record<string, unknown>;
      notes: string;
    }>;
    const order = await createOrder(db as unknown as OrderDatabase, buyer, body);
    return NextResponse.json({ ok: true, order: normalizeOrder(order, buyer.role) }, { status: 201 });
  } catch (error) {
    return authErrorResponse(error);
  }
}
