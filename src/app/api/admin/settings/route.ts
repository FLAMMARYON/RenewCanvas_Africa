import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/backend/auth";
import { authErrorResponse, readJsonBody, readSessionCookie } from "@/lib/backend/auth-route";
import { getDatabaseClient } from "@/lib/backend/db";
import { getPlatformSettings, updatePlatformSettings, type PlatformSettings } from "@/lib/backend/settings";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const db = getDatabaseClient();
    await requireRole(db, readSessionCookie(request), ["admin"]);
    const settings = await getPlatformSettings(db);
    return NextResponse.json({ ok: true, settings });
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const db = getDatabaseClient();
    await requireRole(db, readSessionCookie(request), ["admin"]);
    const body = (await readJsonBody(request)) as Partial<PlatformSettings>;
    const settings = await updatePlatformSettings(db, body);
    return NextResponse.json({ ok: true, settings });
  } catch (error) {
    return authErrorResponse(error);
  }
}
