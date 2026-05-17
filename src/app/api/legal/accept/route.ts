import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/backend/auth";
import { authErrorResponse, readSessionCookie } from "@/lib/backend/auth-route";
import { getDatabaseClient } from "@/lib/backend/db";
import { acceptLegalTerms, type HardeningDatabase } from "@/lib/backend/hardening";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const db = getDatabaseClient();
    const user = await requireRole(db, readSessionCookie(request), ["buyer", "artist", "admin"]);
    return NextResponse.json({ ok: true, legal: await acceptLegalTerms(db as unknown as HardeningDatabase, user) });
  } catch (error) {
    return authErrorResponse(error);
  }
}
