/**
 * Frontend session types.
 *
 * The authoritative session lives in an httpOnly server cookie and is read via
 * `readServerSession()` in `auth-api.ts` (which hits `/api/auth/session`).
 *
 * There is intentionally NO client-side session store or role inference here:
 * roles must come from the server, never from the email address or localStorage.
 */

export type FrontendUserRole = "buyer" | "artist" | "admin";

export type FrontendSession = {
  email: string;
  name: string;
  role: FrontendUserRole;
  createdAt: string;
};

export function dashboardPathForRole(role: FrontendUserRole): string {
  return `/dashboard/${role}`;
}
