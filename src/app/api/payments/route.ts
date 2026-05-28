import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/backend/auth";
import { authErrorResponse, readJsonBody, readSessionCookie } from "@/lib/backend/auth-route";
import { getDatabaseClient } from "@/lib/backend/db";
import { createPaymentSession, listPaymentSessions, normalizePayment, type PaymentDatabase, type PaymentProvider } from "@/lib/backend/payments";
import { requestMoMoPay } from "@/lib/backend/payment-providers";
import { requireBackendConfig } from "@/lib/backend/config";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const db = getDatabaseClient();
    const user = await requireRole(db, readSessionCookie(request), ["buyer", "admin"]);
    const orderId = request.nextUrl.searchParams.get("orderId") ?? undefined;
    const payments = await listPaymentSessions(db as unknown as PaymentDatabase, user, orderId);
    return NextResponse.json({ ok: true, payments });
  } catch (error) {
    return authErrorResponse(error);
  }
}

/**
 * POST /api/payments
 *
 * Accepts:
 * - orderId: string (required)
 * - phoneNumber: string (format 2507XXXXXXXX or 07XXXXXXXX) (required)
 *
 * Calls MTN MoMo requestToPay endpoint and:
 * - Saves the X-Reference-Id as transactionReference on the order
 * - Sets order status to "pending_payment"
 * - Returns { message: "MoMo prompt sent to phone", reference: uuid }
 */
export async function POST(request: NextRequest) {
  try {
    const db = getDatabaseClient();
    const buyer = await requireRole(db, readSessionCookie(request), ["buyer"]);
    const body = (await readJsonBody(request)) as Partial<{
      orderId: string;
      phoneNumber: string;
      provider: PaymentProvider;
      momoPhone: string; // alias for phoneNumber
      idempotencyKey: string;
    }>;

    // Support both phoneNumber and momoPhone for backwards compatibility
    const phoneNumber = body.phoneNumber || body.momoPhone;

    // Check if MoMo is configured - if so, use direct MoMo API
    const config = requireBackendConfig();
    const momoConfigured = config.momoApiUser && config.momoApiKey && config.momoSubscriptionKey;

    if (momoConfigured && phoneNumber && body.orderId) {
      // Direct MoMo API call
      const order = await (db as unknown as PaymentDatabase).order.findFirst({
        where: { id: body.orderId, buyerId: buyer.id },
      });

      if (!order) {
        return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
      }

      if (order.status !== "pending_payment" && order.status !== "pending") {
        return NextResponse.json(
          { ok: false, error: "Order is not in a payable state" },
          { status: 409 }
        );
      }

      // Normalize phone number
      const normalizedPhone = normalizeRwandaPhone(phoneNumber);
      if (!normalizedPhone) {
        return NextResponse.json(
          { ok: false, error: "Invalid phone number format. Use format 2507XXXXXXXX or 07XXXXXXXX." },
          { status: 400 }
        );
      }

      try {
        // Call MoMo requestToPay
        const result = await requestMoMoPay({
          amountRwf: Math.round(order.totalCents / 100),
          phoneNumber: normalizedPhone,
          orderId: order.id,
          payerMessage: `RenewCanvas Africa Order ${order.id}`,
          payeeNote: `Payment from ${buyer.name}`,
        });

        // Update order with transaction reference and set status to pending_payment
        await (db as unknown as PaymentDatabase).order.update({
          where: { id: order.id },
          data: {
            status: "pending_payment",
            transactionReference: result.referenceId,
          },
        });

        // Create payment transaction record
        const idempotencyKey = body.idempotencyKey ?? `${buyer.id}:${order.id}:mtn_momo:${Date.now()}`;
        const payment = await (db as unknown as PaymentDatabase).paymentTransaction.create({
          data: {
            orderId: order.id,
            buyerId: buyer.id,
            provider: "mtn_momo",
            status: "pending",
            amountCents: order.totalCents,
            currency: order.currency,
            providerReference: result.referenceId,
            providerCheckoutUrl: null,
            momoPhone: normalizedPhone,
            ussdReference: null,
            idempotencyKey,
            rawProviderPayload: result,
          },
        });

        // Audit log
        await (db as unknown as PaymentDatabase).auditLog.create({
          data: {
            actorId: buyer.id,
            action: "payment.momo.request",
            entity: "Order",
            entityId: order.id,
            metadata: { reference: result.referenceId, phone: normalizedPhone },
          },
        });

        return NextResponse.json(
          {
            ok: true,
            message: "MoMo prompt sent to phone",
            reference: result.referenceId,
            payment: normalizePayment(payment),
          },
          { status: 201 }
        );
      } catch (momoError) {
        const errorMessage = momoError instanceof Error ? momoError.message : "MoMo request failed";
        return NextResponse.json({ ok: false, error: errorMessage }, { status: 502 });
      }
    }

    // Fallback to existing payment session flow (for manual payments or if MoMo not configured)
    const payment = await createPaymentSession(db as unknown as PaymentDatabase, buyer, {
      orderId: body.orderId,
      provider: body.provider ?? "mtn_momo",
      momoPhone: phoneNumber,
      idempotencyKey: body.idempotencyKey,
    });

    return NextResponse.json({ ok: true, payment }, { status: 201 });
  } catch (error) {
    return authErrorResponse(error);
  }
}

/**
 * Normalize phone number for MoMo API.
 * In sandbox mode, accepts test numbers (any format).
 * In production, requires Rwandan format 2507XXXXXXXX.
 */
function normalizeRwandaPhone(phone: string): string | null {
  const cleaned = phone.replace(/[\s\-\(\)\+]/g, "");
  const config = requireBackendConfig();
  const isSandbox = config.momoTargetEnvironment !== "production";

  // Already in international format (Rwanda)
  if (/^2507\d{8}$/.test(cleaned)) {
    return cleaned;
  }

  // Local format 07XXXXXXXX (Rwanda)
  if (/^07\d{8}$/.test(cleaned)) {
    return "25" + cleaned;
  }

  // In sandbox mode, accept any numeric phone number for testing
  // MTN MoMo sandbox accepts European test numbers like 46733123450
  if (isSandbox && /^\d{8,15}$/.test(cleaned)) {
    return cleaned;
  }

  return null;
}
