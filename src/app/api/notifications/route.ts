import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/backend/auth";
import { authErrorResponse, readSessionCookie } from "@/lib/backend/auth-route";
import { getDatabaseClient } from "@/lib/backend/db";
import { dispatchQueuedNotifications, listNotifications, type NotificationDatabase } from "@/lib/backend/notifications";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const db = getDatabaseClient();
    const user = await requireRole(db, readSessionCookie(request), ["buyer", "artist", "admin"]);
    return NextResponse.json({ ok: true, notifications: await listNotifications(db as unknown as NotificationDatabase, user) });
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDatabaseClient();
    await requireRole(db, readSessionCookie(request), ["admin"]);
    const notifications = await dispatchQueuedNotifications(db as unknown as NotificationDatabase);
    return NextResponse.json({ ok: true, notifications });
  } catch (error) {
    return authErrorResponse(error);
  }
}
