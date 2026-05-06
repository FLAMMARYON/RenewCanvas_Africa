import { NextResponse, type NextRequest } from "next/server";
import { logoutSession } from "@/lib/backend/auth";
import { getDatabaseClient } from "@/lib/backend/db";
import {
  authErrorResponse,
  clearSessionCookie,
  readSessionCookie,
} from "@/lib/backend/auth-route";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    await logoutSession(getDatabaseClient(), readSessionCookie(request));
    return clearSessionCookie(NextResponse.json({ ok: true }));
  } catch (error) {
    return authErrorResponse(error);
  }
}
