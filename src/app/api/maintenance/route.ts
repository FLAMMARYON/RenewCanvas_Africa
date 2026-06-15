/**
 * Maintenance gate status — consumed by `src/middleware.ts`.
 *
 * The edge middleware can't touch Prisma (node:crypto / pg are unavailable on
 * the edge), so it asks this Node route whether maintenance mode is on AND
 * whether the current session belongs to an admin (admins bypass the gate).
 * The request's cookies are forwarded by the middleware so the role lookup works.
 */
import { NextResponse, type NextRequest } from "next/server";
import { readSessionUser } from "@/lib/backend/auth";
import { readSessionCookie } from "@/lib/backend/auth-route";
import { getDatabaseClient } from "@/lib/backend/db";
import { getMaintenanceMode } from "@/lib/backend/settings";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const db = getDatabaseClient();
    const maintenance = await getMaintenanceMode(db);
    let isAdmin = false;
    if (maintenance) {
      const user = await readSessionUser(db, readSessionCookie(request)).catch(() => null);
      isAdmin = user?.role === "admin";
    }
    return NextResponse.json({ maintenance, isAdmin });
  } catch {
    // Fail OPEN — never lock the whole site out because of a settings read error.
    return NextResponse.json({ maintenance: false, isAdmin: false });
  }
}
