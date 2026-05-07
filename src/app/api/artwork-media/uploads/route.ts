import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/backend/auth";
import { authErrorResponse, readJsonBody, readSessionCookie } from "@/lib/backend/auth-route";
import { getDatabaseClient } from "@/lib/backend/db";
import { mediaUploadPlaceholder } from "@/lib/backend/artworks";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const db = getDatabaseClient();
    await requireRole(db, readSessionCookie(request), ["artist", "admin"]);
    const body = (await readJsonBody(request)) as { filename?: string; contentType?: string };
    const upload = mediaUploadPlaceholder(body.filename ?? "artwork-image.jpg", body.contentType ?? "image/jpeg");

    return NextResponse.json({ ok: true, upload });
  } catch (error) {
    return authErrorResponse(error);
  }
}
