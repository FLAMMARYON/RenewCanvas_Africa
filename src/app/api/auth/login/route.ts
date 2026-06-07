import { NextResponse, type NextRequest } from "next/server";
import { AuthError, loginUser, normalizeEmail } from "@/lib/backend/auth";
import { getDatabaseClient } from "@/lib/backend/db";
import {
  attachSessionCookie,
  authErrorResponse,
  readJsonBody,
  requestMetadata,
} from "@/lib/backend/auth-route";
import { auditEvent, rateLimit } from "@/lib/backend/security-log";

export const dynamic = "force-dynamic";

// Throttle credential stuffing / brute force: max 10 attempts per IP+email per 5 min.
const LOGIN_RATE_LIMIT = { limit: 10, windowMs: 5 * 60_000 };

export async function POST(request: NextRequest) {
  const db = getDatabaseClient();
  let email = "";

  try {
    const body = (await readJsonBody(request)) as Partial<{
      email: string;
      password: string;
    }>;
    email = normalizeEmail(body.email ?? "");

    const limit = rateLimit(request, "auth:login", { ...LOGIN_RATE_LIMIT, identifier: email });
    if (!limit.allowed) {
      await auditEvent(db, request, {
        eventType: "auth.login.rate_limited",
        severity: "warning",
        metadata: { email },
      });
      return NextResponse.json(
        { ok: false, code: "rate_limited", message: "Too many login attempts. Please try again later." },
        { status: 429, headers: { "retry-after": String(Math.ceil(LOGIN_RATE_LIMIT.windowMs / 1000)) } }
      );
    }

    const result = await loginUser(
      db,
      { email: body.email ?? "", password: body.password ?? "" },
      requestMetadata(request)
    );

    await auditEvent(db, request, {
      actorId: result.user.id,
      eventType: "auth.login.success",
      severity: "info",
      metadata: { role: result.user.role },
    });

    return attachSessionCookie(
      NextResponse.json({ ok: true, user: result.user }),
      result.sessionToken
    );
  } catch (error) {
    // Record failed attempts (bad credentials, suspended account) for the audit trail.
    if (error instanceof AuthError) {
      await auditEvent(db, request, {
        eventType: "auth.login.failed",
        severity: "warning",
        metadata: { email, code: error.code },
      });
    }
    return authErrorResponse(error);
  }
}
