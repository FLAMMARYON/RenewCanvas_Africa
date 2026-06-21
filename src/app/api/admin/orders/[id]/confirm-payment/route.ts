import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/backend/auth";
import { authErrorResponse, readSessionCookie } from "@/lib/backend/auth-route";
import { getDatabaseClient } from "@/lib/backend/db";
import { confirmOrderPayment } from "@/lib/backend/admin-orders";
import {
  sendPaymentReceivedBuyerEmail,
  sendPaymentConfirmedArtistEmail,
  type NotificationServiceDatabase,
} from "@/lib/backend/notification-service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const db = getDatabaseClient();
    const admin = await requireRole(db, readSessionCookie(request), ["admin"]);
    const { id } = await context.params;
    const result = await confirmOrderPayment(db, admin.id, id);

    // Notify the buyer (payment received) AND the artist(s) (payment confirmed).
    // Email failures must NOT block the confirmation — log and continue.
    try {
      await sendPaymentConfirmationEmails(db, id);
    } catch (emailError) {
      console.error("Payment-confirmation emails failed (order still confirmed):", emailError);
    }

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return authErrorResponse(error);
  }
}

async function sendPaymentConfirmationEmails(db: ReturnType<typeof getDatabaseClient>, orderId: string) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      currency: true,
      totalCents: true,
      buyerId: true,
      buyer: { select: { name: true } },
      items: { select: { artistId: true, artistName: true, title: true, unitCents: true, quantity: true } },
    },
  });
  if (!order) return;

  const notifyDb = db as unknown as NotificationServiceDatabase;
  const buyerName = order.buyer?.name ?? "Customer";
  const firstItem = order.items[0];

  // Buyer: "Your order payment has been received."
  await sendPaymentReceivedBuyerEmail(notifyDb, order.buyerId, {
    buyerName,
    orderId: order.id,
    artworkTitle: firstItem?.title ?? "your order",
    totalAmount: order.totalCents,
    currency: order.currency,
  });

  // Artist(s): one email per distinct artist on the order.
  const byArtist = new Map<string, { artistName: string; title: string; amountCents: number }>();
  for (const item of order.items) {
    const acc = byArtist.get(item.artistId) ?? { artistName: item.artistName, title: item.title, amountCents: 0 };
    acc.amountCents += item.unitCents * item.quantity;
    byArtist.set(item.artistId, acc);
  }
  for (const [artistId, info] of byArtist) {
    await sendPaymentConfirmedArtistEmail(notifyDb, artistId, {
      artistName: info.artistName,
      buyerName,
      orderId: order.id,
      artworkTitle: info.title,
      amount: info.amountCents,
      currency: order.currency,
    });
  }
}
