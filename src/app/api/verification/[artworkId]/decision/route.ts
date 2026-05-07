import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/backend/auth";
import { authErrorResponse, readJsonBody, readSessionCookie } from "@/lib/backend/auth-route";
import { getDatabaseClient } from "@/lib/backend/db";
import {
  decideVerificationReview,
  type VerificationDatabase,
  type VerificationDecision,
} from "@/lib/backend/verification";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ artworkId: string }> }
) {
  try {
    const db = getDatabaseClient();
    const admin = await requireRole(db, readSessionCookie(request), ["admin"]);
    const params = await context.params;
    const body = (await readJsonBody(request)) as Partial<{ decision: VerificationDecision; note: string }>;
    const review = await decideVerificationReview(db as unknown as VerificationDatabase, admin, {
      artworkId: params.artworkId,
      decision: body.decision ?? "request_more_info",
      note: body.note,
    });
    return NextResponse.json({ ok: true, review });
  } catch (error) {
    return authErrorResponse(error);
  }
}
