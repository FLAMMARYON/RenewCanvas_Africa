import { NextResponse, type NextRequest } from "next/server";
import { readSessionUser } from "@/lib/backend/auth";
import { getDatabaseClient } from "@/lib/backend/db";
import {
  authErrorResponse,
  clearSessionCookie,
  readSessionCookie,
} from "@/lib/backend/auth-route";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await readSessionUser(getDatabaseClient(), readSessionCookie(request));

    if (!user) {
      return clearSessionCookie(
        NextResponse.json({ ok: false, code: "unauthenticated" }, { status: 401 })
      );
    }

    return NextResponse.json({ ok: true, user });
  } catch (error) {
    return authErrorResponse(error);
  }
}
