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
    const body = (await readJsonBody(request)) as ProfileUpdateInput;

    return NextResponse.json({ ok: true, ...(await updateProfile(profileDb, user, body)) });
  } catch (error) {
    return authErrorResponse(error);
  }
}
