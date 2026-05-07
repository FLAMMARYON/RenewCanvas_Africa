import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/backend/auth";
import { authErrorResponse, readJsonBody, readSessionCookie } from "@/lib/backend/auth-route";
import { getDatabaseClient } from "@/lib/backend/db";
import {
  submitVerificationEvidence,
  type VerificationDatabase,
  type VerificationEvidenceType,
} from "@/lib/backend/verification";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ artworkId: string }> }
) {
  try {
    const db = getDatabaseClient();
    const artist = await requireRole(db, readSessionCookie(request), ["artist"]);
    const params = await context.params;
    const body = (await readJsonBody(request)) as Partial<{
      type: VerificationEvidenceType;
      url: string;
      label: string;
      notes: string;
    }>;
    const evidence = await submitVerificationEvidence(db as unknown as VerificationDatabase, artist, {
      artworkId: params.artworkId,
      type: body.type,
      url: body.url,
      label: body.label,
      notes: body.notes,
    });
    return NextResponse.json({ ok: true, evidence }, { status: 201 });
  } catch (error) {
    return authErrorResponse(error);
  }
}
