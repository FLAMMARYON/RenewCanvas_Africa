import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/backend/auth";
import { authErrorResponse, readSessionCookie } from "@/lib/backend/auth-route";
import { getDatabaseClient } from "@/lib/backend/db";
import { getMoMoPaymentStatus } from "@/lib/backend/payment-providers";
import { requireBackendConfig } from "@/lib/backend/config";
import type { PaymentDatabase, PaymentStatus } from "@/lib/backend/payments";

export const dynamic = "force-dynamic";

/**
 * GET /api/payments/status?reference=<uuid>
 *
 * Checks the payment status via MTN MoMo Collection API.
 * GET /collection/v1_0/requesttopay/{referenceId}
 *
 * Returns:
 * - { ok: true, status: "PENDING" | "SUCCESSFUL" | "FAILED", ... }
 *
 * If status is SUCCESSFUL, updates the order status to "paid".
 * If status is FAILED, updates the order status to "payment_failed".
 */
export async function GET(request: NextRequest) {
  try {
    const db = getDatabaseClient();
    const user = await requireRole(db, readSessionCookie(request), ["buyer", "admin"]);

    const reference = request.nextUrl.searchParams.get("reference");
    if (!reference) {
      return NextResponse.json(
        { ok: false, error: "Missing reference parameter" },
        { status: 400 }
      );
    }

    const config = requireBackendConfig();

    // Debug: print MoMo config values at runtime
    console.log("[MoMo Config Debug]", {
      momoApiUser: config.momoApiUser ?? "(undefined)",
      momoApiKey: config.momoApiKey ? `${config.momoApiKey.slice(0, 4)}...` : "(undefined)",
      momoSubscriptionKey: config.momoSubscriptionKey ? `${config.momoSubscriptionKey.slice(0, 4)}...` : "(undefined)",
      momoTargetEnvironment: config.momoTargetEnvironment ?? "(undefined)",
      momoBaseUrl: config.momoBaseUrl ?? "(undefined)",
    });

    if (!config.momoApiUser || !config.momoApiKey || !config.momoSubscriptionKey) {
      return NextResponse.json(
        { ok: false, error: "MTN MoMo not configured" },
        { status: 503 }
      );
    }

    // Find the payment transaction by provider reference
    const payment = await (db as unknown as PaymentDatabase).paymentTransaction.findFirst({
      where: { providerReference: reference },
    });

    if (!payment) {
      return NextResponse.json(
        { ok: false, error: "Payment transaction not found" },
        { status: 404 }
      );
    }

    // Only check if user owns this payment or is admin
    if (user.role !== "admin" && payment.buyerId !== user.id) {
      return NextResponse.json(
        { ok: false, error: "Not authorized to view this payment" },
        { status: 403 }
      );
    }

    // If already in a final state, return cached status
    if (payment.status === "paid" || payment.status === "failed") {
      return NextResponse.json({
        ok: true,
        status: payment.status === "paid" ? "SUCCESSFUL" : "FAILED",
        orderId: payment.orderId,
        cached: true,
      });
    }

    // Check status with MoMo API
    const momoResult = await getMoMoPaymentStatus(reference);

    // Handle MoMo API errors gracefully
    if (!momoResult.ok) {
      console.error("[MoMo Status Error]", {
        reference,
        errorCode: momoResult.errorCode,
        errorMessage: momoResult.errorMessage,
        rawResponse: momoResult.rawResponse,
      });

      return NextResponse.json(
        {
          ok: false,
          error: momoResult.errorMessage,
          errorCode: momoResult.errorCode,
          orderId: payment.orderId,
          hint:
            momoResult.errorCode === 404
              ? "This payment reference may not exist on MTN MoMo. Try creating a new order."
              : undefined,
        },
        { status: momoResult.errorCode >= 500 ? 502 : momoResult.errorCode }
      );
    }

    // Map MoMo status to our internal status
    let internalStatus: PaymentStatus = "pending";
    if (momoResult.status === "SUCCESSFUL") {
      internalStatus = "paid";
    } else if (momoResult.status === "FAILED") {
      internalStatus = "failed";
    }

    // Update payment transaction if status changed
    if (internalStatus !== payment.status) {
      await (db as unknown as PaymentDatabase).paymentTransaction.update({
        where: { id: payment.id },
        data: {
          status: internalStatus,
          paidAt: internalStatus === "paid" ? new Date() : payment.paidAt,
          failureReason: momoResult.reason ?? payment.failureReason,
          webhookEventId: momoResult.financialTransactionId ?? payment.webhookEventId,
          rawProviderPayload: momoResult.rawResponse,
        },
      });

      // Update order status
      if (internalStatus === "paid") {
        await (db as unknown as PaymentDatabase).order.update({
          where: { id: payment.orderId },
          data: { status: "paid" },
        });

        // Mark artworks as sold
        await (db as unknown as PaymentDatabase).artwork.updateMany({
          where: { orderItems: { some: { orderId: payment.orderId } }, status: "reserved" },
          data: { status: "sold" },
        });
      } else if (internalStatus === "failed") {
        await (db as unknown as PaymentDatabase).order.update({
          where: { id: payment.orderId },
          data: { status: "failed" },
        });
      }

      // Audit log
      await (db as unknown as PaymentDatabase).auditLog.create({
        data: {
          actorId: user.id,
          action: `payment.status.${internalStatus}`,
          entity: "PaymentTransaction",
          entityId: payment.id,
          metadata: {
            momoStatus: momoResult.status,
            reason: momoResult.reason,
            financialTransactionId: momoResult.financialTransactionId,
          },
        },
      });
    }

    return NextResponse.json({
      ok: true,
      status: momoResult.status,
      orderId: payment.orderId,
      reason: momoResult.reason,
      financialTransactionId: momoResult.financialTransactionId,
      internalStatus,
    });
  } catch (error) {
    console.error("[Payment Status Error]", error);
    return authErrorResponse(error);
  }
}
