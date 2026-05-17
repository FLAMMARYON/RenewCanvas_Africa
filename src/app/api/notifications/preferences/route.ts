import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/backend/auth";
import { authErrorResponse, readJsonBody, readSessionCookie } from "@/lib/backend/auth-route";
import { getDatabaseClient } from "@/lib/backend/db";
import { updateNotificationPreferences, type NotificationDatabase } from "@/lib/backend/notifications";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest) {
  try {
    const db = getDatabaseClient();
    const user = await requireRole(db, readSessionCookie(request), ["buyer", "artist", "admin"]);
    const preferences = await updateNotificationPreferences(db as unknown as NotificationDatabase, user, (await readJsonBody(request)) as Record<string, unknown>);
    return NextResponse.json({ ok: true, preferences });
  } catch (error) {
    return authErrorResponse(error);
  }
}
