import { NextResponse } from "next/server";
import { authErrorResponse } from "@/lib/backend/auth-route";
import { getDatabaseClient } from "@/lib/backend/db";
import { getSharedVirtualRoom, type VirtualRoomDatabase } from "@/lib/backend/virtual-room";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ token: string }> }) {
  try {
    const db = getDatabaseClient();
    const { token } = await context.params;
    const room = await getSharedVirtualRoom(db as unknown as VirtualRoomDatabase, token);
    return room ? NextResponse.json({ ok: true, room }) : NextResponse.json({ ok: false, code: "room_not_found" }, { status: 404 });
  } catch (error) {
    return authErrorResponse(error);
  }
}
