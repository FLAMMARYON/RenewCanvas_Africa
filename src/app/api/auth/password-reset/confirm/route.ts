import { NextResponse, type NextRequest } from "next/server";
import { resetPassword } from "@/lib/backend/auth";
import { getDatabaseClient } from "@/lib/backend/db";
import { authErrorResponse, readJsonBody } from "@/lib/backend/auth-route";
import { auditEvent, rateLimit } from "@/lib/backend/security-log";

export const dynamic = "force-dynamic";

// Throttle brute-forcing of reset tokens.
const CONFIRM_RATE_LIMIT = { limit: 10, windowMs: 15 * 60_000 };

export async function POST(request: NextRequest) {
  const db = getDatabaseClient();
  try {
    const limit = rateLimit(request, "auth:password-reset-confirm", CONFIRM_RATE_LIMIT);
    if (!limit.allowed) {
      return NextResponse.json(
        { ok: false, code: "rate_limited", message: "Too many attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = (await readJsonBody(request)) as Partial<{
      token: string;
      password: string;
    }>;

    const result = await resetPassword(db, {
      token: body.token ?? "",
      password: body.password ?? "",
    });

    // resetPassword also revokes all existing sessions for the account.
    await auditEvent(db, request, {
      actorId: result.user.id,
      eventType: "auth.password_reset.completed",
      severity: "warning",
    });

    return NextResponse.json({ ok: true, user: result.user });
  } catch (error) {
    return authErrorResponse(error);
  }
}
