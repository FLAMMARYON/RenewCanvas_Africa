import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/backend/auth";
import { authErrorResponse, readJsonBody, readSessionCookie } from "@/lib/backend/auth-route";
import { getDatabaseClient } from "@/lib/backend/db";

export const dynamic = "force-dynamic";

// Mirror of SUPPORTED_LOCALES in src/i18n/config.ts. Kept here (server) so the
// API never trusts an arbitrary client value. English, French, Kinyarwanda,
// Swahili only.
const SUPPORTED_LOCALES = ["en", "fr", "rw", "sw"] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

function isSupported(value: unknown): value is SupportedLocale {
  return typeof value === "string" && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

/** GET /api/profile/language — the signed-in user's saved language preference. */
export async function GET(request: NextRequest) {
  try {
    const db = getDatabaseClient();
    const user = await requireRole(db, readSessionCookie(request), ["buyer", "artist", "admin"]);
    const row = await db.user.findUnique({
      where: { id: user.id },
      select: { languagePreference: true },
    });
    const language = isSupported(row?.languagePreference) ? row!.languagePreference : "en";
    return NextResponse.json({ ok: true, language });
  } catch (error) {
    return authErrorResponse(error);
  }
}

/** PATCH /api/profile/language — persist the user's chosen language. */
export async function PATCH(request: NextRequest) {
  try {
    const db = getDatabaseClient();
    const user = await requireRole(db, readSessionCookie(request), ["buyer", "artist", "admin"]);
    const body = (await readJsonBody(request)) as Partial<{ language: string }>;

    if (!isSupported(body.language)) {
      return NextResponse.json(
        { ok: false, code: "invalid_language", message: "Unsupported language." },
        { status: 400 }
      );
    }

    await db.user.update({
      where: { id: user.id },
      data: { languagePreference: body.language },
    });

    return NextResponse.json({ ok: true, language: body.language });
  } catch (error) {
    return authErrorResponse(error);
  }
}
