import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/backend/auth";
import { authErrorResponse, readJsonBody, readSessionCookie } from "@/lib/backend/auth-route";
import { getDatabaseClient } from "@/lib/backend/db";
import { changeUserEmail } from "@/lib/backend/account";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest) {
  try {
    const db = getDatabaseClient();
    const user = await requireRole(db, readSessionCookie(request), ["buyer", "artist", "admin"]);
    const body = (await readJsonBody(request)) as Partial<{ email: string }>;
    const email = await changeUserEmail(db, user, body.email ?? "");
    return NextResponse.json({ ok: true, email });
  } catch (error) {
    return authErrorResponse(error);
  }
}
