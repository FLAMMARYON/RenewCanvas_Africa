import { NextResponse, type NextRequest } from "next/server";
import { getDatabaseClient } from "@/lib/backend/db";
import { AuthError, registerUser } from "@/lib/backend/auth";
import {
  attachSessionCookie,
  authErrorResponse,
  readJsonBody,
  requestMetadata,
} from "@/lib/backend/auth-route";
import { auditEvent, rateLimit } from "@/lib/backend/security-log";
import { notifyAdmins } from "@/lib/backend/admin-notifications";

export const dynamic = "force-dynamic";

// Public sign-up may only create buyer/artist accounts. Admin accounts are
// provisioned out-of-band; accepting "admin" here would be privilege escalation.
const PUBLIC_ROLES = new Set(["buyer", "artist"]);

const REGISTER_RATE_LIMIT = { limit: 5, windowMs: 10 * 60_000 };

export async function POST(request: NextRequest) {
  const db = getDatabaseClient();

  try {
    const limit = rateLimit(request, "auth:register", REGISTER_RATE_LIMIT);
    if (!limit.allowed) {
      return NextResponse.json(
        { ok: false, code: "rate_limited", message: "Too many sign-up attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = (await readJsonBody(request)) as Partial<{
      email: string;
      name: string;
      password: string;
      role: string;
    }>;

    const requestedRole = body.role ?? "buyer";
    if (!PUBLIC_ROLES.has(requestedRole)) {
      await auditEvent(db, request, {
        eventType: "auth.register.role_rejected",
        severity: "warning",
        metadata: { requestedRole, email: body.email },
      });
      throw new AuthError("invalid_role", "Accounts can only be created as a buyer or artist.", 400);
    }

    const result = await registerUser(
      db,
      {
        email: body.email ?? "",
        name: body.name ?? "",
        password: body.password ?? "",
        role: requestedRole as "buyer" | "artist",
      },
      requestMetadata(request)
    );

    await auditEvent(db, request, {
      actorId: result.user.id,
      eventType: "auth.register.success",
      severity: "info",
      metadata: { role: result.user.role },
    });

    // Admin push: new user registration (and new artist application for artists).
    await notifyAdmins(db, {
      templateKey: result.user.role === "artist" ? "admin_new_artist_application" : "admin_new_user",
      subject: result.user.role === "artist" ? "New artist application" : "New user registration",
      body: `${result.user.name} signed up as ${result.user.role}.`,
      metadata: { userId: result.user.id, role: result.user.role },
    });

    const responseBody: {
      ok: true;
      user: typeof result.user;
      emailVerificationToken?: string;
    } = { ok: true, user: result.user };

    if (process.env.NODE_ENV !== "production") {
      responseBody.emailVerificationToken = result.emailVerificationToken;
    }

    return attachSessionCookie(NextResponse.json(responseBody, { status: 201 }), result.sessionToken);
  } catch (error) {
    return authErrorResponse(error);
  }
}
