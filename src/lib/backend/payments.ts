import { createHmac, timingSafeEqual } from "node:crypto";
import { AuthError, type AuthPublicUser } from "./auth";
import { createPaymentProviderClient, type ProviderWebhookEvent } from "./payment-providers";

export type PaymentProvider = "mtn_momo" | "manual_bank";
export type PaymentStatus = "requires_action" | "pending" | "paid" | "failed" | "cancelled" | "refunded";

export type PaymentOrderRecord = {
  id: string;
  buyerId: string;
  status: string;
  totalCents: number;
  currency: string;
  paymentMethod: string;
  transactionReference?: string | null;
  buyer?: { email: string; name: string } | null;
};

export type PaymentTransactionRecord = {
  id: string;
  orderId: string;
  buyerId: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  amountCents: number;
  currency: string;
  providerReference: string | null;
  providerCheckoutUrl: string | null;
  momoPhone: string | null;
  ussdReference: string | null;
  idempotencyKey: string;
  webhookEventId: string | null;
  failureReason: string | null;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type PaymentDatabase = {
  order: {
    findFirst(args: { where: Record<string, unknown> }): Promise<PaymentOrderRecord | null>;
    update(args: { where: { id: string }; data: Record<string, unknown> }): Promise<PaymentOrderRecord>;
  };
  paymentTransaction: {
    findUnique(args: { where: { idempotencyKey?: string; webhookEventId?: string } }): Promise<PaymentTransactionRecord | null>;
    create(args: { data: Record<string, unknown> }): Promise<PaymentTransactionRecord>;
    update(args: { where: { id: string }; data: Record<string, unknown> }): Promise<PaymentTransactionRecord>;
    findFirst(args: { where: Record<string, unknown> }): Promise<PaymentTransactionRecord | null>;
    findMany(args: { where: Record<string, unknown>; orderBy: { createdAt: "desc" } }): Promise<PaymentTransactionRecord[]>;
  };
  artwork: {
    updateMany(args: { where: Record<string, unknown>; data: Record<string, unknown> }): Promise<{ count: number }>;
  };
  auditLog: {
    create(args: { data: { actorId?: string; action: string; entity: string; entityId: string; metadata?: unknown } }): Promise<unknown>;
  };
};

export async function createPaymentSession(
  db: PaymentDatabase,
  buyer: AuthPublicUser,
  input: { orderId?: string; provider?: PaymentProvider; momoPhone?: string; idempotencyKey?: string }
) {
  if (buyer.role !== "buyer") throw new AuthError("forbidden", "Only buyers can pay for orders.", 403);
  const orderId = cleanText(input.orderId, 120);
  if (!orderId) throw new AuthError("invalid_order", "Choose an order to pay.", 400);

  const order = await db.order.findFirst({ where: { id: orderId, buyerId: buyer.id } });
  if (!order) throw new AuthError("order_not_found", "Order was not found.", 404);
  if (order.status !== "pending_payment") {
    throw new AuthError("order_not_payable", "Only pending orders can be paid.", 409);
  }

  const provider = normalizeProvider(input.provider ?? providerFromPaymentMethod(order.paymentMethod));
  const idempotencyKey = cleanText(input.idempotencyKey, 160) ?? `${buyer.id}:${order.id}:${provider}`;
  const existing = await db.paymentTransaction.findUnique({ where: { idempotencyKey } });
  if (existing) return normalizePayment(existing);

  const providerSession = await createPaymentProviderClient(provider).createSession({
    orderId: order.id,
    amountCents: order.totalCents,
    currency: order.currency,
    buyerEmail: order.buyer?.email ?? buyer.email,
    buyerName: order.buyer?.name ?? buyer.name,
    provider,
    momoPhone: cleanText(input.momoPhone, 40),
    idempotencyKey,
  });
  const transaction = await db.paymentTransaction.create({
    data: {
      orderId: order.id,
      buyerId: buyer.id,
      provider: providerSession.provider,
      status: providerSession.status,
      amountCents: order.totalCents,
      currency: order.currency,
      providerReference: providerSession.providerReference,
      providerCheckoutUrl: providerSession.checkoutUrl,
      momoPhone: cleanText(input.momoPhone, 40),
      ussdReference: providerSession.ussdReference,
      idempotencyKey,
      rawProviderPayload: providerSession.rawProviderPayload,
    },
  });

  await db.auditLog.create({
    data: {
      actorId: buyer.id,
      action: "payment.session.create",
      entity: "PaymentTransaction",
      entityId: transaction.id,
      metadata: { orderId: order.id, provider },
    },
  });

  return normalizePayment(transaction);
}

export async function reconcilePaymentWebhook(
  db: PaymentDatabase,
  input: {
    provider: PaymentProvider;
    providerReference?: string;
    webhookEventId?: string;
    status?: PaymentStatus;
    payload?: unknown;
    now?: Date;
  }
) {
  const webhookEventId = cleanText(input.webhookEventId, 180);
  if (webhookEventId) {
    const duplicate = await db.paymentTransaction.findUnique({ where: { webhookEventId } });
    if (duplicate) return { duplicate: true, payment: normalizePayment(duplicate) };
  }

  const providerReference = cleanText(input.providerReference, 180);
  if (!providerReference) throw new AuthError("invalid_provider_reference", "Provider reference is required.", 400);
  const payment = await db.paymentTransaction.findFirst({
    where: { provider: input.provider, providerReference },
  });
  if (!payment) throw new AuthError("payment_not_found", "Payment transaction was not found.", 404);

  const status = input.status === "paid" ? "paid" : input.status === "failed" ? "failed" : "pending";
  const updated = await db.paymentTransaction.update({
    where: { id: payment.id },
    data: {
      status,
      webhookEventId,
      rawProviderPayload: input.payload,
      paidAt: status === "paid" ? input.now ?? new Date() : payment.paidAt,
      failureReason: status === "failed" ? "Provider reported payment failure." : payment.failureReason,
    },
  });

  if (status === "paid") {
    await db.order.update({ where: { id: payment.orderId }, data: { status: "paid" } });
    await db.artwork.updateMany({
      where: { orderItems: { some: { orderId: payment.orderId } }, status: "reserved" },
      data: { status: "sold" },
    });
  }

  await db.auditLog.create({
    data: {
      action: `payment.webhook.${status}`,
      entity: "PaymentTransaction",
      entityId: payment.id,
      metadata: { provider: input.provider, providerReference, webhookEventId },
    },
  });

  return { duplicate: false, payment: normalizePayment(updated) };
}

export async function reconcileProviderWebhook(db: PaymentDatabase, event: ProviderWebhookEvent, now = new Date()) {
  return reconcilePaymentWebhook(db, {
    provider: event.provider,
    providerReference: event.providerReference,
    webhookEventId: event.webhookEventId,
    status: event.status,
    payload: event.rawProviderPayload,
    now,
  });
}

export async function listPaymentSessions(db: PaymentDatabase, user: AuthPublicUser, orderId?: string) {
  const where =
    user.role === "admin"
      ? orderId
        ? { orderId }
        : {}
      : {
          buyerId: user.id,
          ...(orderId ? { orderId } : {}),
        };
  const payments = await db.paymentTransaction.findMany({ where, orderBy: { createdAt: "desc" } });
  return payments.map(normalizePayment);
}

export function verifyWebhookSignature(payload: string, signature: string | null | undefined, secret: string) {
  if (!signature || !secret) return false;
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

export function normalizePayment(payment: PaymentTransactionRecord) {
  return {
    id: payment.id,
    orderId: payment.orderId,
    provider: payment.provider,
    status: payment.status,
    amount: payment.amountCents / 100,
    currency: payment.currency,
    providerReference: payment.providerReference,
    checkoutUrl: payment.providerCheckoutUrl,
    momoPhone: payment.momoPhone,
    ussdReference: payment.ussdReference,
    paidAt: payment.paidAt?.toISOString() ?? null,
  };
}

function providerFromPaymentMethod(paymentMethod: string): PaymentProvider {
  if (paymentMethod === "bank") return "manual_bank";
  return "mtn_momo";
}

function normalizeProvider(provider: PaymentProvider): PaymentProvider {
  return ["mtn_momo", "manual_bank"].includes(provider) ? provider : "mtn_momo";
}

function cleanText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : null;
}
