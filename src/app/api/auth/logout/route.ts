import { NextResponse, type NextRequest } from "next/server";
import { logoutSession, readSessionUser } from "@/lib/backend/auth";
import { getDatabaseClient } from "@/lib/backend/db";
import {
  authErrorResponse,
  clearSessionCookie,
  readSessionCookie,
} from "@/lib/backend/auth-route";
import { auditEvent } from "@/lib/backend/security-log";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const db = getDatabaseClient();
    const token = readSessionCookie(request);
    // Resolve the actor before revoking so the audit trail records who logged out.
    const user = await readSessionUser(db, token).catch(() => null);
    await logoutSession(db, token);
    if (user) {
      await auditEvent(db, request, { actorId: user.id, eventType: "auth.logout", severity: "info" });
    }
    return clearSessionCookie(NextResponse.json({ ok: true }));
  } catch (error) {
    return authErrorResponse(error);
  }
}
