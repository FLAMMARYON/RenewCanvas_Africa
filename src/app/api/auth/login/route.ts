import { NextResponse, type NextRequest } from "next/server";
import { loginUser } from "@/lib/backend/auth";
import { getDatabaseClient } from "@/lib/backend/db";
import {
  attachSessionCookie,
  authErrorResponse,
  readJsonBody,
  requestMetadata,
} from "@/lib/backend/auth-route";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = (await readJsonBody(request)) as Partial<{
      email: string;
      password: string;
    }>;

    const result = await loginUser(
      getDatabaseClient(),
      {
        email: body.email ?? "",
        password: body.password ?? "",
      },
      requestMetadata(request)
    );

    return attachSessionCookie(
      NextResponse.json({ ok: true, user: result.user }),
      result.sessionToken
    );
  } catch (error) {
    return authErrorResponse(error);
  }
}
