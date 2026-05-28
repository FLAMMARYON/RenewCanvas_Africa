import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/backend/auth";
import { authErrorResponse, readJsonBody, readSessionCookie } from "@/lib/backend/auth-route";
import { getDatabaseClient } from "@/lib/backend/db";
import { saveVirtualRoom, type VirtualRoomDatabase } from "@/lib/backend/virtual-room";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const db = getDatabaseClient();
    const user = await requireRole(db, readSessionCookie(request), ["buyer", "artist", "admin"]);
    const body = (await readJsonBody(request)) as Record<string, unknown>;
    const room = await saveVirtualRoom(db as unknown as VirtualRoomDatabase, user, {
      ...body,
      isPublic: true,
    });
    return NextResponse.json({ ok: true, room }, { status: 201 });
  } catch (error) {
    return authErrorResponse(error);
  }
}
