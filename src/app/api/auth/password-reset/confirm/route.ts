import { NextResponse, type NextRequest } from "next/server";
import { resetPassword } from "@/lib/backend/auth";
import { getDatabaseClient } from "@/lib/backend/db";
import { authErrorResponse, readJsonBody } from "@/lib/backend/auth-route";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = (await readJsonBody(request)) as Partial<{
      token: string;
      password: string;
    }>;

    const result = await resetPassword(getDatabaseClient(), {
      token: body.token ?? "",
      password: body.password ?? "",
    });

    return NextResponse.json({ ok: true, user: result.user });
  } catch (error) {
    return authErrorResponse(error);
  }
}
