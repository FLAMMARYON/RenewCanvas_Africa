import { NextResponse, type NextRequest } from "next/server";
import { authErrorResponse } from "@/lib/backend/auth-route";
import { getDatabaseClient } from "@/lib/backend/db";
import { recordArtworkView, type ArtworkDatabase } from "@/lib/backend/artworks";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: NextRequest, context: RouteContext) {
  try {
    const db = getDatabaseClient();
    const artworkDb = db as unknown as ArtworkDatabase;
    const { id } = await context.params;
    await recordArtworkView(artworkDb, id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return authErrorResponse(error);
  }
}
