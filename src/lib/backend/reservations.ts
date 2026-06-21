import type { PrismaClient } from "@prisma/client";

/**
 * Reservation lifecycle.
 *
 * When a buyer places an order the artwork is set to `reserved` with a
 * `reservedAt` timestamp and hidden from the marketplace + gallery. The
 * reservation holds for RESERVATION_WINDOW_MS (30 minutes):
 *   - admin confirms payment within the window → artwork becomes `sold`;
 *   - otherwise the reservation auto-cancels → order `cancelled`, artwork back
 *     to `listed` (and reappears on the marketplace + gallery).
 *
 * Auto-cancel runs two ways, BOTH through the same `expireStaleReservations`
 * entry point (which fully resolves each expired reservation via the shared
 * `expireReservation`), so the cron and the lazy check can never diverge:
 *   1. A Vercel cron (`/api/cron/expire-reservations`).
 *   2. A lazy safety check run on every marketplace / gallery / artwork read, so
 *      stale reservations never display even before the cron fires.
 */
export const RESERVATION_WINDOW_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Fully resolve ONE expired reservation in a single transaction:
 *   (a) set the order to `cancelled`, and
 *   (b) return its reserved artwork(s) to `listed`, clearing `reservedAt`.
 *
 * This is the single shared cancellation path used by both the cron and the
 * lazy check (via `expireStaleReservations`).
 */
export async function expireReservation(db: PrismaClient, orderId: string): Promise<void> {
  await db.$transaction(async (tx) => {
    await tx.order.update({ where: { id: orderId }, data: { status: "cancelled" } });
    await tx.artwork.updateMany({
      where: { orderItems: { some: { orderId } }, status: "reserved" },
      data: { status: "listed", reservedAt: null },
    });
    await tx.auditLog.create({
      // System action (no actor): records the auto-cancellation on expiry.
      data: { action: "order.reservation_expired", entity: "Order", entityId: orderId },
    });
  });
}

/**
 * Find reservations older than the 30-minute window and fully resolve each one
 * (cancel the order + release the artwork) via `expireReservation`.
 *
 * GUARD: an order with a recorded payment receipt (a PaymentTransaction with
 * status "paid") is NEVER cancelled — the buyer paid and is awaiting admin
 * confirmation, so its artwork stays reserved. This applies to both the cron and
 * the lazy check, since both run through here.
 *
 * Write-only-when-stale: the candidate lookup is a single read; it returns early
 * with zero writes when nothing is expired.
 */
export async function expireStaleReservations(
  db: PrismaClient,
  now: Date = new Date()
): Promise<{ expired: number; orderIds: string[] }> {
  const cutoff = new Date(now.getTime() - RESERVATION_WINDOW_MS);

  const expiredOrders = await db.order.findMany({
    where: {
      status: "pending_payment",
      items: { some: { artwork: { status: "reserved", reservedAt: { lt: cutoff } } } },
      // GUARD: skip orders that have a paid payment receipt (keep them reserved).
      payments: { none: { status: "paid" } },
    },
    select: { id: true },
  });
  if (expiredOrders.length === 0) return { expired: 0, orderIds: [] };

  const orderIds = expiredOrders.map((order) => order.id);
  // One transaction per expired reservation, via the shared cancel path.
  for (const orderId of orderIds) {
    await expireReservation(db, orderId);
  }

  return { expired: orderIds.length, orderIds };
}
