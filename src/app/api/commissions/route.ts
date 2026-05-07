import { NextResponse, type NextRequest } from "next/server";
import { requireRole, type AuthUserRole } from "@/lib/backend/auth";
import { authErrorResponse, readJsonBody, readSessionCookie } from "@/lib/backend/auth-route";
import { getDatabaseClient } from "@/lib/backend/db";
import {
  createCommissionRequest,
  listAssignableArtists,
  listCommissionRequests,
  normalizeCommissionRequest,
  type CommissionSizeCategory,
  type CommissionDatabase,
} from "@/lib/backend/commissions";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const db = getDatabaseClient();
    const commissionDb = db as unknown as CommissionDatabase;
    const role = request.nextUrl.searchParams.get("role") as AuthUserRole | null;
    const user = await requireRole(db, readSessionCookie(request), ["buyer", "artist", "admin"]);
    const effectiveRole = role && user.role === "admin" ? role : user.role;
    const effectiveUser = { ...user, role: effectiveRole };

    const requests = await listCommissionRequests(commissionDb, effectiveUser);
    const artists = user.role === "admin" ? await listAssignableArtists(commissionDb) : [];

    return NextResponse.json({
      ok: true,
      requests: requests.map(normalizeCommissionRequest),
      artists,
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDatabaseClient();
    const commissionDb = db as unknown as CommissionDatabase;
    const user = await requireRole(db, readSessionCookie(request), ["buyer"]);
    const body = (await readJsonBody(request)) as Partial<{
      title: string;
      description: string;
      preferredMaterials: string;
      budgetAmount: number;
      sizeCategory: CommissionSizeCategory;
      dimensions: string;
    }>;

    const commission = await createCommissionRequest(commissionDb, user, {
      title: body.title ?? "",
      description: body.description ?? "",
      preferredMaterials: body.preferredMaterials,
      budgetAmount: Number(body.budgetAmount),
      sizeCategory: body.sizeCategory ?? "medium",
      dimensions: body.dimensions,
    });

    return NextResponse.json(
      { ok: true, request: normalizeCommissionRequest(commission) },
      { status: 201 }
    );
  } catch (error) {
    return authErrorResponse(error);
  }
}
