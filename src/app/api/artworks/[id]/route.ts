import { NextResponse, type NextRequest } from "next/server";
import { readSessionUser, requireRole } from "@/lib/backend/auth";
import { authErrorResponse, readJsonBody, readSessionCookie } from "@/lib/backend/auth-route";
import { getDatabaseClient } from "@/lib/backend/db";
import {
  deleteArtwork,
  getArtwork,
  normalizeArtwork,
  updateArtwork,
  type ArtworkDatabase,
  type ArtworkInput,
} from "@/lib/backend/artworks";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const db = getDatabaseClient();
    const artworkDb = db as unknown as ArtworkDatabase;
    const user = await readSessionUser(db, readSessionCookie(request));
    const { id } = await context.params;
    const artwork = await getArtwork(artworkDb, user, id);

    return NextResponse.json({ ok: true, artwork: normalizeArtwork(artwork) });
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const db = getDatabaseClient();
    const artworkDb = db as unknown as ArtworkDatabase;
    const user = await requireRole(db, readSessionCookie(request), ["artist", "admin"]);
    const { id } = await context.params;
    const body = (await readJsonBody(request)) as ArtworkInput;
    const artwork = await updateArtwork(artworkDb, user, id, body);

    return NextResponse.json({ ok: true, artwork: normalizeArtwork(artwork) });
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const db = getDatabaseClient();
    const artworkDb = db as unknown as ArtworkDatabase;
    const user = await requireRole(db, readSessionCookie(request), ["artist", "admin"]);
    const { id } = await context.params;
    await deleteArtwork(artworkDb, user, id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return authErrorResponse(error);
  }
}
