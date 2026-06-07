import { NextResponse, type NextRequest } from "next/server";
import { requestPasswordReset, passwordResetDurationMs } from "@/lib/backend/auth";
import { getDatabaseClient } from "@/lib/backend/db";
import { authErrorResponse, readJsonBody } from "@/lib/backend/auth-route";
import { sendPasswordResetEmail, type NotificationServiceDatabase } from "@/lib/backend/notification-service";
import { requireBackendConfig } from "@/lib/backend/config";
import { auditEvent, rateLimit } from "@/lib/backend/security-log";

export const dynamic = "force-dynamic";

// Prevent reset-email bombing and user enumeration by volume: 5 requests / 15 min / IP.
const RESET_RATE_LIMIT = { limit: 5, windowMs: 15 * 60_000 };

export async function POST(request: NextRequest) {
  try {
    const db = getDatabaseClient();

    const limit = rateLimit(request, "auth:password-reset", RESET_RATE_LIMIT);
    if (!limit.allowed) {
      // Still return ok:true shape to avoid leaking whether throttling is tied to a known account.
      return NextResponse.json(
        { ok: false, code: "rate_limited", message: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = (await readJsonBody(request)) as Partial<{ email: string }>;
    const result = await requestPasswordReset(db, body.email ?? "");
    const responseBody: { ok: true; resetToken?: string } = { ok: true };

    await auditEvent(db, request, {
      actorId: result.user?.id,
      eventType: "auth.password_reset.requested",
      severity: "info",
      metadata: { email: body.email, matched: Boolean(result.user) },
    });

    // Send password reset email if token was created
    if (result.resetToken && result.user) {
      const config = requireBackendConfig();
      const siteUrl = config.siteUrl || "http://localhost:3000";
      const resetLink = `${siteUrl}/reset-password?token=${result.resetToken}`;
      const expiresInMinutes = Math.round(passwordResetDurationMs / 60000);

      await sendPasswordResetEmail(db as unknown as NotificationServiceDatabase, result.user.id, {
        userName: result.user.name,
        resetLink,
        expiresInMinutes,
      });
    }

    // Only expose token in non-production for testing
    if (process.env.NODE_ENV !== "production" && result.resetToken) {
      responseBody.resetToken = result.resetToken;
    }

    return NextResponse.json(responseBody);
  } catch (error) {
    return authErrorResponse(error);
  }
}
