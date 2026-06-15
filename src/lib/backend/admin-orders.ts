/**
 * Admin order settlement — the two-step manual workflow.
 *
 *   1. confirmOrderPayment     buyer paid RenewCanvas → order `paid`, artwork `sold`
 *   2. disburseOrderToArtists  RenewCanvas paid artist → order `artist_paid`,
 *                              one Disbursement row recorded per artist
 *
 * Step 2 is only allowed once step 1 has run (order must be `paid`/sold first).
 * Each step is wrapped in a Prisma interactive transaction so the status change
 * and the table writes commit or roll back together.
 */
import type { PrismaClient } from "@prisma/client";
import { AuthError } from "./auth";
import { artistShareCents, recordConfirmedOrderEarnings } from "./earnings";

type OrderWithItems = {
  id: string;
  status: string;
  currency: string;
  items: Array<{ artistId: string; ownerType: string; unitCents: number; quantity: number }>;
};

async function loadOrder(db: PrismaClient, orderId: string): Promise<OrderWithItems> {
  const order = (await db.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      status: true,
      currency: true,
      items: { select: { artistId: true, ownerType: true, unitCents: true, quantity: true } },
    },
  })) as OrderWithItems | null;
  if (!order) throw new AuthError("order_not_found", "Order was not found.", 404);
  return order;
}

/**
 * Step 1 — confirm the buyer's payment was received by RenewCanvas.
 * pending_payment → paid; the order's reserved artwork(s) → sold.
 */
export async function confirmOrderPayment(db: PrismaClient, adminId: string, orderId: string) {
  const order = await loadOrder(db, orderId);
  if (order.status !== "pending_payment") {
    throw new AuthError("order_not_pending", "Only pending-payment orders can be confirmed.", 409);
  }

  await db.$transaction(async (tx) => {
    await tx.order.update({ where: { id: order.id }, data: { status: "paid" } });
    await tx.artwork.updateMany({
      where: { orderItems: { some: { orderId: order.id } }, status: { in: ["reserved", "listed", "approved"] } },
      data: { status: "sold" },
    });
    await tx.auditLog.create({
      data: { actorId: adminId, action: "admin.order.confirm_payment", entity: "Order", entityId: order.id },
    });
  });

  // Idempotently fold the now-confirmed sale into artist running totals.
  await recordConfirmedOrderEarnings(db, order.id);

  return { id: order.id, status: "paid" as const };
}

/**
 * Step 2 — record the artist disbursement(s) and mark the order settled.
 * paid → artist_paid; one Disbursement row per artist-owned line's artist.
 */
export async function disburseOrderToArtists(db: PrismaClient, adminId: string, orderId: string) {
  const order = await loadOrder(db, orderId);
  if (order.status === "artist_paid") {
    throw new AuthError("already_disbursed", "This order has already been disbursed.", 409);
  }
  if (order.status !== "paid") {
    throw new AuthError("payment_not_confirmed", "Confirm the buyer payment before disbursing the artist.", 409);
  }

  // Sum the artist's 80% share per artist (RenewCanvas-owned lines have no payout).
  const byArtist = new Map<string, number>();
  for (const item of order.items) {
    if (item.ownerType !== "artist") continue;
    byArtist.set(item.artistId, (byArtist.get(item.artistId) ?? 0) + artistShareCents(item.unitCents, item.quantity));
  }

  await db.$transaction(async (tx) => {
    for (const [artistId, amountCents] of byArtist) {
      await tx.disbursement.create({
        data: { orderId: order.id, artistId, amountCents, currency: order.currency, disbursedByAdminId: adminId },
      });
    }
    await tx.order.update({ where: { id: order.id }, data: { status: "artist_paid" } });
    await tx.auditLog.create({
      data: {
        actorId: adminId,
        action: "admin.order.disburse",
        entity: "Order",
        entityId: order.id,
        metadata: { artists: Array.from(byArtist.entries()).map(([artistId, amountCents]) => ({ artistId, amountCents })) },
      },
    });
  });

  return { id: order.id, status: "artist_paid" as const };
}
