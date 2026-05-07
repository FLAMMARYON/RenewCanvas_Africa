import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/backend/auth";
import { authErrorResponse, readJsonBody, readSessionCookie } from "@/lib/backend/auth-route";
import { getDatabaseClient } from "@/lib/backend/db";
import { normalizeArtwork, reviewArtwork, type ArtworkDatabase } from "@/lib/backend/artworks";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const db = getDatabaseClient();
    const artworkDb = db as unknown as ArtworkDatabase;
    const user = await requireRole(db, readSessionCookie(request), ["admin"]);
    const { id } = await context.params;
    const body = (await readJsonBody(request)) as {
      decision?: "approve" | "reject";
      rejectionReason?: string;
    };
    const artwork = await reviewArtwork(artworkDb, user, {
      artworkId: id,
      decision: body.decision ?? "reject",
      rejectionReason: body.rejectionReason,
    });

    return NextResponse.json({ ok: true, artwork: normalizeArtwork(artwork) });
  } catch (error) {
    return authErrorResponse(error);
  }
}
