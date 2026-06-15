import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/backend/auth";
import { authErrorResponse, readJsonBody, readSessionCookie } from "@/lib/backend/auth-route";
import { getDatabaseClient } from "@/lib/backend/db";
import { listAdminNotifications, markAdminNotificationRead } from "@/lib/backend/admin-notifications";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const db = getDatabaseClient();
    const admin = await requireRole(db, readSessionCookie(request), ["admin"]);
    const notifications = await listAdminNotifications(db, admin.id);
    return NextResponse.json({ ok: true, notifications });
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const db = getDatabaseClient();
    const admin = await requireRole(db, readSessionCookie(request), ["admin"]);
    const body = (await readJsonBody(request)) as { id?: string; all?: boolean };
    await markAdminNotificationRead(db, admin.id, body);
    const notifications = await listAdminNotifications(db, admin.id);
    return NextResponse.json({ ok: true, notifications });
  } catch (error) {
    return authErrorResponse(error);
  }
}
