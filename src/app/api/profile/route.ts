import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/backend/auth";
import { authErrorResponse, readJsonBody, readSessionCookie } from "@/lib/backend/auth-route";
import { getDatabaseClient } from "@/lib/backend/db";
import {
  getProfile,
  updateProfile,
  type ProfileDatabase,
  type ProfileUpdateInput,
} from "@/lib/backend/profiles";
import { flattenZodError, profileUpdateSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const db = getDatabaseClient();
    const user = await requireRole(db, readSessionCookie(request), ["buyer", "artist", "admin"]);
    const profileDb = db as unknown as ProfileDatabase;

    return NextResponse.json({ ok: true, ...(await getProfile(profileDb, user)) });
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const db = getDatabaseClient();
    const user = await requireRole(db, readSessionCookie(request), ["buyer", "artist", "admin"]);
    const profileDb = db as unknown as ProfileDatabase;

    // Server-side Zod validation + sanitisation (authoritative).
    const parsed = profileUpdateSchema.safeParse(await readJsonBody(request));
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, code: "invalid_profile", errors: flattenZodError(parsed.error) },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      ...(await updateProfile(profileDb, user, parsed.data as ProfileUpdateInput)),
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}
