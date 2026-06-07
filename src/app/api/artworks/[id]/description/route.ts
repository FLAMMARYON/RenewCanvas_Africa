import { NextResponse, type NextRequest } from "next/server";
import { getDatabaseClient } from "@/lib/backend/db";
import { readBackendConfig } from "@/lib/backend/config";
import { checkInMemoryRateLimit } from "@/lib/foundation/rate-limit";
import { getClientIp } from "@/lib/foundation/request";
import { resolveLocale } from "@/lib/i18n/config";
import {
  fallbackDescription,
  generateArtworkDescription,
  type ArtworkDescriptionInput,
} from "@/lib/ml/artwork-description";

export const dynamic = "force-dynamic";

// AI cost control: 20 generations / 5 min / IP (cache hits are not counted).
const RATE_LIMIT = { limit: 20, windowMs: 5 * 60_000 };

// In-memory cache keyed by `${artworkId}:${locale}` (no new DB table needed).
const cache = new Map<string, { text: string; at: number }>();
const CACHE_TTL_MS = 24 * 60 * 60_000;

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const locale = resolveLocale(request.nextUrl.searchParams.get("locale"));
    const cacheKey = `${id}:${locale}`;

    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
      return NextResponse.json({ ok: true, description: cached.text, cached: true, locale });
    }

    const db = getDatabaseClient();
    const artwork = await db.artwork.findFirst({
      where: { id, status: { in: ["listed", "approved", "reserved", "sold"] } },
      select: {
        title: true,
        category: true,
        tags: true,
        theme: true,
        materials: { select: { material: true } },
      },
    });

    if (!artwork) {
      return NextResponse.json({ ok: false, error: "Artwork not found" }, { status: 404 });
    }

    const input: ArtworkDescriptionInput = {
      title: artwork.title,
      category: artwork.category,
      tags: artwork.tags ?? [],
      theme: artwork.theme,
      materials: (artwork.materials ?? []).map((m: { material: string }) => m.material),
      locale,
    };

    // Only spend an AI call + rate-limit budget on cache misses.
    const rate = checkInMemoryRateLimit(`artwork-description:${getClientIp(request.headers)}`, RATE_LIMIT);
    const config = readBackendConfig();
    const apiKey = config.ok ? config.config.anthropicApiKey : undefined;

    let description: string;
    let generated = false;
    if (apiKey && rate.allowed) {
      try {
        description = await generateArtworkDescription(input, apiKey);
        generated = true;
      } catch (error) {
        console.error("artwork description generation failed; using fallback", error);
        description = fallbackDescription(input);
      }
    } else {
      // No key or rate-limited → deterministic fallback (still useful).
      description = fallbackDescription(input);
    }

    if (generated) cache.set(cacheKey, { text: description, at: Date.now() });

    return NextResponse.json({ ok: true, description, cached: false, generated, locale });
  } catch (error) {
    console.error("artwork description route error", error);
    return NextResponse.json({ ok: false, error: "Failed to load description" }, { status: 500 });
  }
}
