import { NextResponse, type NextRequest } from "next/server";
import { requestPasswordReset } from "@/lib/backend/auth";
import { getDatabaseClient } from "@/lib/backend/db";
import { authErrorResponse, readJsonBody } from "@/lib/backend/auth-route";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = (await readJsonBody(request)) as Partial<{ email: string }>;
    const result = await requestPasswordReset(getDatabaseClient(), body.email ?? "");
    const responseBody: { ok: true; resetToken?: string } = { ok: true };

    if (process.env.NODE_ENV !== "production" && result.resetToken) {
      responseBody.resetToken = result.resetToken;
    }

    return NextResponse.json(responseBody);
  } catch (error) {
    return authErrorResponse(error);
  }
}
