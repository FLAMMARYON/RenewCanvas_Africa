import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/backend/auth";
import { authErrorResponse, readSessionCookie } from "@/lib/backend/auth-route";
import { getDatabaseClient } from "@/lib/backend/db";
import { listVerificationQueue, type VerificationDatabase } from "@/lib/backend/verification";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const db = getDatabaseClient();
    const user = await requireRole(db, readSessionCookie(request), ["artist", "admin"]);
    const items = await listVerificationQueue(db as unknown as VerificationDatabase, user);
    return NextResponse.json({ ok: true, items });
  } catch (error) {
    return authErrorResponse(error);
  }
}
