import { NextResponse, type NextRequest } from "next/server";
import { getDatabaseClient } from "@/lib/backend/db";
import { registerUser, type AuthUserRole } from "@/lib/backend/auth";
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
      name: string;
      password: string;
      role: AuthUserRole;
    }>;

    const result = await registerUser(
      getDatabaseClient(),
      {
        email: body.email ?? "",
        name: body.name ?? "",
        password: body.password ?? "",
        role: body.role ?? "buyer",
      },
      requestMetadata(request)
    );

    const responseBody: {
      ok: true;
      user: typeof result.user;
      emailVerificationToken?: string;
    } = { ok: true, user: result.user };

    if (process.env.NODE_ENV !== "production") {
      responseBody.emailVerificationToken = result.emailVerificationToken;
    }

    return attachSessionCookie(NextResponse.json(responseBody, { status: 201 }), result.sessionToken);
  } catch (error) {
    return authErrorResponse(error);
  }
}
