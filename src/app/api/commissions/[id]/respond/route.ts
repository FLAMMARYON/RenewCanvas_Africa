import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/backend/auth";
import { authErrorResponse, readJsonBody, readSessionCookie } from "@/lib/backend/auth-route";
import { normalizeCommissionRequest, respondToCommissionRequest, type CommissionDatabase } from "@/lib/backend/commissions";
import { getDatabaseClient } from "@/lib/backend/db";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const db = getDatabaseClient();
    const commissionDb = db as unknown as CommissionDatabase;
    const artist = await requireRole(db, readSessionCookie(request), ["artist"]);
    const body = (await readJsonBody(request)) as Partial<{
      decision: "accepted" | "rejected";
      note: string;
    }>;
    const { id } = await context.params;

    const commission = await respondToCommissionRequest(commissionDb, artist, {
      requestId: id,
      decision: body.decision ?? "rejected",
      note: body.note,
    });

    return NextResponse.json({ ok: true, request: normalizeCommissionRequest(commission) });
  } catch (error) {
    return authErrorResponse(error);
  }
}
