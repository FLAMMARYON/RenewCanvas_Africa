import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/backend/auth";
import { authErrorResponse, readJsonBody, readSessionCookie } from "@/lib/backend/auth-route";
import { assignCommissionRequest, normalizeCommissionRequest, type CommissionDatabase } from "@/lib/backend/commissions";
import { getDatabaseClient } from "@/lib/backend/db";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const db = getDatabaseClient();
    const commissionDb = db as unknown as CommissionDatabase;
    const admin = await requireRole(db, readSessionCookie(request), ["admin"]);
    const body = (await readJsonBody(request)) as Partial<{
      artistId: string;
      adminNotes: string;
    }>;
    const { id } = await context.params;

    const commission = await assignCommissionRequest(commissionDb, admin, {
      requestId: id,
      artistId: body.artistId ?? "",
      adminNotes: body.adminNotes,
    });

    return NextResponse.json({ ok: true, request: normalizeCommissionRequest(commission) });
  } catch (error) {
    return authErrorResponse(error);
  }
}
