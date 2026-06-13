import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/backend/auth";
import { authErrorResponse, readJsonBody, readSessionCookie } from "@/lib/backend/auth-route";
import { getDatabaseClient } from "@/lib/backend/db";
import {
  getNotificationPrefs,
  updateNotificationPrefs,
  type NotificationPrefsDatabase,
} from "@/lib/backend/notification-prefs";

export const dynamic = "force-dynamic";

/** GET — the signed-in user's notification preferences (every key defaults on). */
export async function GET(request: NextRequest) {
  try {
    const db = getDatabaseClient();
    const user = await requireRole(db, readSessionCookie(request), ["buyer", "artist", "admin"]);
    const preferences = await getNotificationPrefs(db as unknown as NotificationPrefsDatabase, user.id);
    return NextResponse.json({ ok: true, preferences });
  } catch (error) {
    return authErrorResponse(error);
  }
}

/**
 * PATCH — merge a partial set of toggles into the stored prefs. The settings UI
 * sends a single key per change so toggles persist immediately; sending several
 * at once also works.
 */
export async function PATCH(request: NextRequest) {
  try {
    const db = getDatabaseClient();
    const user = await requireRole(db, readSessionCookie(request), ["buyer", "artist", "admin"]);
    const body = (await readJsonBody(request)) as Record<string, unknown>;
    const preferences = await updateNotificationPrefs(
      db as unknown as NotificationPrefsDatabase,
      user.id,
      body
    );
    return NextResponse.json({ ok: true, preferences });
  } catch (error) {
    return authErrorResponse(error);
  }
}
