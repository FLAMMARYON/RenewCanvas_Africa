import { NextResponse, type NextRequest } from "next/server";
import { AuthError } from "@/lib/backend/auth";
import { authErrorResponse } from "@/lib/backend/auth-route";
import { getDatabaseClient } from "@/lib/backend/db";
import { createPaymentProviderClient, type ProviderWebhookEvent } from "@/lib/backend/payment-providers";
import { reconcileProviderWebhook, verifyWebhookSignature, type PaymentDatabase, type PaymentProvider, type PaymentStatus } from "@/lib/backend/payments";
import { recordConfirmedOrderEarnings } from "@/lib/backend/earnings";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const payloadText = await request.text();
    const secret = process.env.PAYMENT_WEBHOOK_SECRET;

    // Fail closed: a webhook that flips orders to "paid" and artworks to "sold"
    // MUST be authenticated. If no secret is configured we refuse to process the
    // event rather than trusting an unsigned payload (payment-fraud vector).
    if (!secret) {
      // Outside production we allow unsigned webhooks so local/sandbox testing
      // still works, but we never silently accept them in production.
      if (process.env.NODE_ENV === "production") {
        console.error("[payments/webhook] PAYMENT_WEBHOOK_SECRET is not configured; refusing unsigned webhook.");
        return NextResponse.json(
          { ok: false, code: "webhook_not_configured" },
          { status: 503 }
        );
      }
      console.warn("[payments/webhook] PAYMENT_WEBHOOK_SECRET not set; accepting unsigned webhook (non-production only).");
    } else if (!verifyWebhookSignature(payloadText, request.headers.get("x-renewcanvas-signature"), secret)) {
      return NextResponse.json({ ok: false, code: "invalid_signature" }, { status: 401 });
    }
    const body = JSON.parse(payloadText) as Partial<{
      provider: PaymentProvider;
      providerReference: string;
      webhookEventId: string;
      status: PaymentStatus;
    }>;
    const db = getDatabaseClient();
    const provider = body.provider ?? providerFromHeader(request.headers.get("x-renewcanvas-provider"));
    const event = body.providerReference
      ? {
          provider,
          providerReference: body.providerReference,
          webhookEventId: body.webhookEventId,
          status: body.status ?? "pending",
          rawProviderPayload: body,
        }
      : createPaymentProviderClient(provider).parseWebhook(body);
    const result = await reconcileProviderWebhook(db as unknown as PaymentDatabase, event as ProviderWebhookEvent);
    // On confirmed payment, add the order's earnings to artist running totals (idempotent).
    if (result.payment?.status === "paid" && result.payment.orderId) {
      await recordConfirmedOrderEarnings(db, result.payment.orderId);
    }
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof SyntaxError) return authErrorResponse(new AuthError("invalid_json", "Request body must be valid JSON.", 400));
    return authErrorResponse(error);
  }
}

function providerFromHeader(value: string | null): PaymentProvider {
  return value === "manual_bank" ? value : "mtn_momo";
}
