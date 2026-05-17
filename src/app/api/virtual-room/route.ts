import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/backend/auth";
import { authErrorResponse, readJsonBody, readSessionCookie } from "@/lib/backend/auth-route";
import { getDatabaseClient } from "@/lib/backend/db";
import { listVirtualRooms, saveVirtualRoom, type VirtualRoomDatabase } from "@/lib/backend/virtual-room";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const db = getDatabaseClient();
    const user = await requireRole(db, readSessionCookie(request), ["buyer", "artist", "admin"]);
    return NextResponse.json({ ok: true, rooms: await listVirtualRooms(db as unknown as VirtualRoomDatabase, user) });
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDatabaseClient();
    const user = await requireRole(db, readSessionCookie(request), ["buyer", "artist", "admin"]);
    const room = await saveVirtualRoom(db as unknown as VirtualRoomDatabase, user, (await readJsonBody(request)) as Record<string, unknown>);
    return NextResponse.json({ ok: true, room }, { status: 201 });
  } catch (error) {
    return authErrorResponse(error);
  }
}
