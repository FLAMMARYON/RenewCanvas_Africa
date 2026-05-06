import { NextResponse, type NextRequest } from "next/server";
import { AuthError, authSessionCookieName, sessionDurationMs } from "./auth";

export function readSessionCookie(request: NextRequest): string | undefined {
  return request.cookies.get(authSessionCookieName)?.value;
}

export function attachSessionCookie(response: NextResponse, sessionToken: string): NextResponse {
  response.cookies.set(authSessionCookieName, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.floor(sessionDurationMs / 1000),
  });
  return response;
}

export function clearSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set(authSessionCookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}

export function authErrorResponse(error: unknown): NextResponse {
  if (error instanceof AuthError) {
    return NextResponse.json(
      { ok: false, code: error.code, message: error.message },
      { status: error.status }
    );
  }

  return NextResponse.json(
    { ok: false, code: "server_error", message: "Authentication service unavailable." },
    { status: 500 }
  );
}

export async function readJsonBody(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new AuthError("invalid_json", "Request body must be valid JSON.", 400);
  }
}

export function requestMetadata(request: NextRequest) {
  return {
    userAgent: request.headers.get("user-agent") ?? undefined,
    ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
  };
}
