import { NextResponse, type NextRequest } from "next/server";
import { changePassword, requireRole, type PasswordChangeDatabase } from "@/lib/backend/auth";
import {
  authErrorResponse,
  clearSessionCookie,
  readJsonBody,
  readSessionCookie,
} from "@/lib/backend/auth-route";
import { getDatabaseClient } from "@/lib/backend/db";
import { auditEvent, rateLimit } from "@/lib/backend/security-log";
import { flattenZodError, passwordChangeSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

// Throttle to slow current-password guessing.
const RATE_LIMIT = { limit: 5, windowMs: 15 * 60_000 };

export async function POST(request: NextRequest) {
  const db = getDatabaseClient();
  try {
    const user = await requireRole(db, readSessionCookie(request), ["buyer", "artist", "admin"]);

    const limit = rateLimit(request, "auth:password-change", { ...RATE_LIMIT, identifier: user.id });
    if (!limit.allowed) {
      return NextResponse.json(
        { ok: false, code: "rate_limited", message: "Too many attempts. Please try again later." },
        { status: 429 }
      );
    }

    const parsed = passwordChangeSchema.safeParse(await readJsonBody(request));
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, code: "invalid_input", errors: flattenZodError(parsed.error) },
        { status: 400 }
      );
    }

    await changePassword(db as unknown as PasswordChangeDatabase, user.id, parsed.data);

    await auditEvent(db, request, {
      actorId: user.id,
      eventType: "auth.password_change",
      severity: "warning",
    });

    // All sessions (including this one) were revoked — clear the cookie so the
    // client re-authenticates with the new password.
    return clearSessionCookie(
      NextResponse.json({ ok: true, message: "Password updated. Please sign in again." })
    );
  } catch (error) {
    if (error instanceof Error && "code" in error && (error as { code: string }).code === "invalid_credentials") {
      await auditEvent(db, request, { eventType: "auth.password_change.failed", severity: "warning" });
    }
    return authErrorResponse(error);
  }
}
