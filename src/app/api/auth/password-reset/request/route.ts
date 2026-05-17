import { NextResponse, type NextRequest } from "next/server";
import { requestPasswordReset, passwordResetDurationMs } from "@/lib/backend/auth";
import { getDatabaseClient } from "@/lib/backend/db";
import { authErrorResponse, readJsonBody } from "@/lib/backend/auth-route";
import { sendPasswordResetEmail, type NotificationServiceDatabase } from "@/lib/backend/notification-service";
import { requireBackendConfig } from "@/lib/backend/config";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const db = getDatabaseClient();
    const body = (await readJsonBody(request)) as Partial<{ email: string }>;
    const result = await requestPasswordReset(db, body.email ?? "");
    const responseBody: { ok: true; resetToken?: string } = { ok: true };

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
