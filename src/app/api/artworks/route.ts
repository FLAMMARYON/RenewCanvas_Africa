import { NextResponse, type NextRequest } from "next/server";
import { readSessionUser, requireRole } from "@/lib/backend/auth";
import { authErrorResponse, readJsonBody, readSessionCookie } from "@/lib/backend/auth-route";
import { getDatabaseClient } from "@/lib/backend/db";
import {
  createArtwork,
  listArtworks,
  normalizeArtwork,
  type ArtworkDatabase,
  type ArtworkInput,
  type ArtworkListQuery,
} from "@/lib/backend/artworks";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const db = getDatabaseClient();
    const artworkDb = db as unknown as ArtworkDatabase;
    const scope = request.nextUrl.searchParams.get("scope");
    const sessionToken = readSessionCookie(request);

    if (scope === "artist") {
      const user = await requireRole(db, sessionToken, ["artist"]);
      const result = await listArtworks(artworkDb, user, "artist", readListQuery(request));
      return NextResponse.json({
        ok: true,
        artworks: result.items.map(normalizeArtwork),
        pagination: result.pagination,
      });
    }

    if (scope === "admin") {
      const user = await requireRole(db, sessionToken, ["admin"]);
      const result = await listArtworks(artworkDb, user, "admin", readListQuery(request));
      return NextResponse.json({
        ok: true,
        artworks: result.items.map(normalizeArtwork),
        pagination: result.pagination,
      });
    }

    const user = await readSessionUser(db, sessionToken);
    const result = await listArtworks(artworkDb, user, "marketplace", readListQuery(request));
    return NextResponse.json({
      ok: true,
      artworks: result.items.map(normalizeArtwork),
      pagination: result.pagination,
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDatabaseClient();
    const artworkDb = db as unknown as ArtworkDatabase;
    const user = await requireRole(db, readSessionCookie(request), ["artist", "admin"]);
    const body = (await readJsonBody(request)) as ArtworkInput;
    const artwork = await createArtwork(artworkDb, user, body);

    return NextResponse.json({ ok: true, artwork: normalizeArtwork(artwork) }, { status: 201 });
  } catch (error) {
    return authErrorResponse(error);
  }
}

function readListQuery(request: NextRequest): ArtworkListQuery {
  const params = request.nextUrl.searchParams;
  return {
    search: params.get("search"),
    category: params.get("category"),
    material: params.get("material"),
    minPrice: numberParam(params.get("minPrice")),
    maxPrice: numberParam(params.get("maxPrice")),
    sort: params.get("sort") as ArtworkListQuery["sort"],
    page: numberParam(params.get("page")),
    pageSize: numberParam(params.get("pageSize")),
  };
}

function numberParam(value: string | null): number | null {
  if (!value) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}
