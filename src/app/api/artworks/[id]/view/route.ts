import { NextResponse, type NextRequest } from "next/server";
import { readSessionUser } from "@/lib/backend/auth";
import { authErrorResponse, readSessionCookie } from "@/lib/backend/auth-route";
import { getDatabaseClient } from "@/lib/backend/db";
import { recordArtworkView, type ArtworkDatabase } from "@/lib/backend/artworks";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const db = getDatabaseClient();
    const artworkDb = db as unknown as ArtworkDatabase;
    const { id } = await context.params;
    // Pass the logged-in user so the view counts only once per buyer; anonymous
    // viewers keep the previous (always-increment) behaviour.
    const user = await readSessionUser(db, readSessionCookie(request));
    await recordArtworkView(artworkDb, id, user?.id ?? null);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return authErrorResponse(error);
  }
}
