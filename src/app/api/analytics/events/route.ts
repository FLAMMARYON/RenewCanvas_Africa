import { NextResponse, type NextRequest } from "next/server";
import { readSessionUser } from "@/lib/backend/auth";
import { authErrorResponse, readJsonBody, readSessionCookie } from "@/lib/backend/auth-route";
import { getDatabaseClient } from "@/lib/backend/db";
import { trackAnalyticsEvent, type AnalyticsDatabase } from "@/lib/backend/analytics";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const db = getDatabaseClient();
    const user = await readSessionUser(db, readSessionCookie(request));
    const body = (await readJsonBody(request)) as Partial<{ eventName: string; sessionId: string; entityType: string; entityId: string; metadata: unknown }>;
    const event = await trackAnalyticsEvent(db as unknown as AnalyticsDatabase, { user, ...body, eventName: body.eventName ?? "unknown" });
    return NextResponse.json({ ok: true, event }, { status: 201 });
  } catch (error) {
    return authErrorResponse(error);
  }
}
