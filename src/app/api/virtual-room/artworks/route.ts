import { NextResponse } from "next/server";
import { authErrorResponse } from "@/lib/backend/auth-route";
import { getDatabaseClient } from "@/lib/backend/db";
import { listVirtualRoomArtworks, type VirtualRoomDatabase } from "@/lib/backend/virtual-room";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getDatabaseClient();
    return NextResponse.json({ ok: true, artworks: await listVirtualRoomArtworks(db as unknown as VirtualRoomDatabase) });
  } catch (error) {
    return authErrorResponse(error);
  }
}
