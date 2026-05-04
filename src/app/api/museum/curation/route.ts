import { NextResponse } from "next/server";

import { createLogEvent, writeLog } from "@/lib/foundation/logger";
import { checkInMemoryRateLimit } from "@/lib/foundation/rate-limit";
import { createRequestId, getClientIp } from "@/lib/foundation/request";
import { curateMuseum, validateCurationInput } from "@/lib/ml/curator";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 30;

export async function POST(request: Request) {
  const requestId = createRequestId("curation");
  const clientIp = getClientIp(request.headers);
  const startedAt = Date.now();
  const rateLimit = checkInMemoryRateLimit(
    `museum-curation:${clientIp}`,
    {
    limit: RATE_LIMIT_MAX_REQUESTS,
    windowMs: RATE_LIMIT_WINDOW_MS,
    }
  );

  const headers = {
    "x-request-id": requestId,
    "x-ratelimit-limit": String(RATE_LIMIT_MAX_REQUESTS),
    "x-ratelimit-remaining": String(rateLimit.remaining),
    "x-ratelimit-reset": String(rateLimit.resetAt),
  };

  if (!rateLimit.allowed) {
    writeLog(
      createLogEvent("warn", "museum curation rate limit exceeded", {
        requestId,
        metadata: {
          endpoint: "/api/museum/curation",
          clientIp,
          limit: rateLimit.limit,
          resetAt: rateLimit.resetAt,
        },
      })
    );

    return NextResponse.json(
      { error: "Too many curation requests. Try again soon.", requestId },
      { status: 429, headers }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed JSON body.", requestId }, { status: 400, headers });
  }

  const parsed = validateCurationInput(body);
  if (!parsed.ok) {
    writeLog(
      createLogEvent("warn", "museum curation validation failed", {
        requestId,
        metadata: {
          endpoint: "/api/museum/curation",
          clientIp,
          fields: Object.keys(parsed.errors).join(","),
        },
      })
    );

    return NextResponse.json({ error: "Invalid curation input.", details: parsed.errors, requestId }, { status: 400, headers });
  }

  const plan = curateMuseum(parsed.value);
  const latencyMs = Date.now() - startedAt;

  writeLog(createLogEvent("info", "museum curation created", {
    requestId,
    metadata: {
      endpoint: "/api/museum/curation",
      clientIp,
      artworkCount: parsed.value.artworks.length,
      roomCount: plan.rooms.length,
      placementCount: plan.placements.length,
      latencyMs,
    },
  }));

  return NextResponse.json({ plan, requestId }, { status: 200, headers });
}
