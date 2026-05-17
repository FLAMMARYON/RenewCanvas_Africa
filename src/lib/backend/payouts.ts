import { AuthError, type AuthPublicUser } from "./auth";

export type PayoutStatus = "pending" | "eligible" | "approved" | "paid" | "failed" | "cancelled";

export type PayoutOrderItemRecord = {
  id: string;
  orderId: string;
  artistId: string;
  ownerType: "artist" | "renewcanvas";
  unitCents: number;
  quantity: number;
};

export type PayoutLedgerRecord = {
  id: string;
  orderId: string;
  orderItemId: string | null;
  artistId: string;
  status: PayoutStatus;
  grossCents: number;
  platformFeeCents: number;
  deliveryCostCents: number;
  payoutCents: number;
  currency: string;
  eligibleAt: Date;
  approvedAt: Date | null;
  paidAt: Date | null;
  failedAt: Date | null;
  failureReason: string | null;
  providerReference: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type PayoutDatabase = {
  order: {
    findFirst(args: { where: Record<string, unknown>; include?: unknown }): Promise<{ id: string; status: string; currency: string; deliveredAt?: Date; items?: PayoutOrderItemRecord[] } | null>;
  };
  payoutLedger: {
    findFirst(args: { where: Record<string, unknown> }): Promise<PayoutLedgerRecord | null>;
    create(args: { data: Record<string, unknown> }): Promise<PayoutLedgerRecord>;
    update(args: { where: { id: string }; data: Record<string, unknown> }): Promise<PayoutLedgerRecord>;
    findMany(args: { where: Record<string, unknown>; orderBy: { createdAt: "desc" } }): Promise<PayoutLedgerRecord[]>;
  };
  returnRequest: {
    findFirst(args: { where: Record<string, unknown> }): Promise<{ id: string } | null>;
  };
  auditLog: {
    create(args: { data: { actorId?: string; action: string; entity: string; entityId: string; metadata?: unknown } }): Promise<unknown>;
  };
};

export async function createPayoutsForDeliveredOrder(db: PayoutDatabase, admin: AuthPublicUser, orderId: string, now = new Date()) {
  if (admin.role !== "admin") throw new AuthError("forbidden", "Only admins can create payout records.", 403);
  const order = await db.order.findFirst({ where: { id: orderId }, include: { items: true } });
  if (!order) throw new AuthError("order_not_found", "Order was not found.", 404);
  if (order.status !== "delivered") throw new AuthError("order_not_delivered", "Payouts require delivered orders.", 409);
  const openReturn = await db.returnRequest.findFirst({ where: { orderId, status: "open" } });
  if (openReturn) throw new AuthError("return_window_blocked", "Open returns block payout creation.", 409);

  const created: PayoutLedgerRecord[] = [];
  for (const item of order.items ?? []) {
    if (item.ownerType === "renewcanvas") continue;
    const existing = await db.payoutLedger.findFirst({ where: { orderItemId: item.id } });
    if (existing) {
      created.push(existing);
      continue;
    }
    const grossCents = item.unitCents * item.quantity;
    const platformFeeCents = Math.round(grossCents * 0.2);
    const payout = await db.payoutLedger.create({
      data: {
        orderId: order.id,
        orderItemId: item.id,
        artistId: item.artistId,
        status: "pending",
        grossCents,
        platformFeeCents,
        deliveryCostCents: 0,
        payoutCents: Math.max(0, grossCents - platformFeeCents),
        currency: order.currency,
        eligibleAt: new Date(now.getTime() + 1000 * 60 * 60 * 48),
      },
    });
    created.push(payout);
    await db.auditLog.create({ data: { actorId: admin.id, action: "payout.create", entity: "PayoutLedger", entityId: payout.id } });
  }
  return created.map(normalizePayout);
}

export async function markPayout(db: PayoutDatabase, admin: AuthPublicUser, payoutId: string, status: "approved" | "paid" | "failed", now = new Date()) {
  if (admin.role !== "admin") throw new AuthError("forbidden", "Only admins can update payouts.", 403);
  const payout = await db.payoutLedger.findFirst({ where: { id: payoutId } });
  if (!payout) throw new AuthError("payout_not_found", "Payout was not found.", 404);
  if ((status === "approved" || status === "paid") && payout.eligibleAt > now) {
    throw new AuthError("payout_not_eligible", "Payouts cannot be released before the return window closes.", 409);
  }
  const updated = await db.payoutLedger.update({
    where: { id: payout.id },
    data: {
      status,
      approvedAt: status === "approved" ? now : payout.approvedAt,
      paidAt: status === "paid" ? now : payout.paidAt,
      failedAt: status === "failed" ? now : payout.failedAt,
    },
  });
  await db.auditLog.create({ data: { actorId: admin.id, action: `payout.${status}`, entity: "PayoutLedger", entityId: payout.id } });
  return normalizePayout(updated);
}

export async function listPayouts(db: PayoutDatabase, user: AuthPublicUser) {
  const where = user.role === "admin" ? {} : { artistId: user.id };
  const payouts = await db.payoutLedger.findMany({ where, orderBy: { createdAt: "desc" } });
  return payouts.map(normalizePayout);
}

export function normalizePayout(payout: PayoutLedgerRecord) {
  return {
    id: payout.id,
    orderId: payout.orderId,
    orderItemId: payout.orderItemId,
    artistId: payout.artistId,
    status: payout.status,
    grossAmount: payout.grossCents / 100,
    platformFeeAmount: payout.platformFeeCents / 100,
    payoutAmount: payout.payoutCents / 100,
    currency: payout.currency,
    eligibleAt: payout.eligibleAt.toISOString(),
    approvedAt: payout.approvedAt?.toISOString() ?? null,
    paidAt: payout.paidAt?.toISOString() ?? null,
  };
}
