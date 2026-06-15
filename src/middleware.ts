import { NextResponse, type NextRequest } from "next/server";

// Must match `authSessionCookieName` in src/lib/backend/auth.ts. Defined locally
// because the auth module imports node:crypto, which is unavailable on the edge.
const SESSION_COOKIE = "renewcanvas_session";

/**
 * Edge middleware — CSRF defense-in-depth.
 *
 * Session auth uses a SameSite=Lax cookie, which already blocks the most common
 * cross-site CSRF vectors. This adds a second, explicit layer: every
 * state-changing request to our own API must originate from our own site.
 *
 * We verify the Origin header (falling back to Referer) against the request
 * host. Browsers always attach Origin on cross-origin and same-origin
 * unsafe-method requests, so a missing Origin on a mutating request is treated
 * as suspicious.
 *
 * Endpoints authenticated by means OTHER than the session cookie are exempt,
 * because they are legitimately called cross-origin / server-to-server:
 *   - /api/payments/webhook  → verified by HMAC signature
 *   - /api/admin/reminders   → verified by CRON_SECRET bearer token
 */
const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

const CSRF_EXEMPT_PATHS = ["/api/payments/webhook", "/api/admin/reminders"];

// Paths reachable even while maintenance mode is ON. /login + /maintenance let an
// admin sign in; /dashboard/admin lets them reach the toggle to turn it back off
// (non-admins are bounced by the dashboard role guard regardless).
function isMaintenanceAllowed(pathname: string): boolean {
  return (
    pathname === "/maintenance" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/dashboard/admin") ||
    pathname.startsWith("/api/")
  );
}

async function readMaintenanceStatus(request: NextRequest): Promise<{ maintenance: boolean; isAdmin: boolean }> {
  try {
    const response = await fetch(new URL("/api/maintenance", request.url), {
      headers: { cookie: request.headers.get("cookie") ?? "" },
      cache: "no-store",
    });
    if (!response.ok) return { maintenance: false, isAdmin: false };
    return (await response.json()) as { maintenance: boolean; isAdmin: boolean };
  } catch {
    return { maintenance: false, isAdmin: false };
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- Maintenance gate: when ON, all non-admin users are sent to /maintenance. ---
  // Only page navigations are gated (GET, not /api, not an allowed bypass path).
  if (request.method === "GET" && !isMaintenanceAllowed(pathname)) {
    const { maintenance, isAdmin } = await readMaintenanceStatus(request);
    if (maintenance && !isAdmin) {
      return NextResponse.redirect(new URL("/maintenance", request.url));
    }
  }

  // --- Page guard: private dashboard routes require a session cookie. ---
  // This is a fast presence check; the API layer + dashboard layout still do
  // full DB-backed validation and role routing. Edge can't validate the token.
  if (pathname.startsWith("/dashboard")) {
    const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
    if (!hasSession) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  if (!MUTATING_METHODS.has(request.method)) {
    return NextResponse.next();
  }

  if (CSRF_EXEMPT_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const host = request.headers.get("host");
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  const sourceUrl = origin ?? referer;

  // No Origin/Referer on a mutating same-origin request is abnormal for browsers
  // and is the signature of a forged cross-site request.
  if (!sourceUrl) {
    return csrfRejection();
  }

  let sourceHost: string;
  try {
    sourceHost = new URL(sourceUrl).host;
  } catch {
    return csrfRejection();
  }

  if (!host || sourceHost !== host) {
    return csrfRejection();
  }

  return NextResponse.next();
}

function csrfRejection() {
  return NextResponse.json(
    { ok: false, code: "csrf_origin_mismatch", message: "Cross-origin request blocked." },
    { status: 403 }
  );
}

export const config = {
  // All page navigations (maintenance gate) + API routes (CSRF) + dashboard pages
  // (auth guard). Excludes Next internals and static files (anything ending .ext).
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.[\\w]+$).*)"],
};
