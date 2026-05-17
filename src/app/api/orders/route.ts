import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/backend/auth";
import { authErrorResponse, readJsonBody, readSessionCookie } from "@/lib/backend/auth-route";
import { getDatabaseClient } from "@/lib/backend/db";
import { createOrder, listOrders, normalizeOrder, type OrderDatabase } from "@/lib/backend/orders";
import {
  sendOrderConfirmationEmail,
  sendNewOrderAlertEmail,
  type NotificationServiceDatabase,
} from "@/lib/backend/notification-service";

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

    // Send order confirmation to buyer
    const firstItem = order.items?.[0];
    if (firstItem) {
      await sendOrderConfirmationEmail(db as unknown as NotificationServiceDatabase, buyer.id, {
        buyerName: buyer.name,
        orderId: order.id,
        artworkTitle: firstItem.title,
        artistName: firstItem.artistName,
        totalAmount: order.totalCents,
        currency: order.currency,
        paymentMethod: order.paymentMethod,
      });

      // Send new order alert to artist
      await sendNewOrderAlertEmail(db as unknown as NotificationServiceDatabase, firstItem.artistId, {
        artistName: firstItem.artistName,
        buyerName: buyer.name,
        orderId: order.id,
        artworkTitle: firstItem.title,
        orderAmount: order.totalCents,
        currency: order.currency,
      });
    }

    return NextResponse.json({ ok: true, order: normalizeOrder(order, buyer.role) }, { status: 201 });
  } catch (error) {
    return authErrorResponse(error);
  }
}
