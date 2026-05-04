import { NextResponse } from "next/server";
import { createLogEvent, writeLog } from "@/lib/foundation/logger";
import { checkInMemoryRateLimit } from "@/lib/foundation/rate-limit";
import { createRequestId, getClientIp } from "@/lib/foundation/request";
import {
  calculateImpactEstimate,
  validateImpactInput,
} from "@/lib/ml/impact";

const RATE_LIMIT = {
  limit: 30,
  windowMs: 60_000,
};

export async function POST(request: Request) {
  const requestId = createRequestId("impact");
  const startedAt = Date.now();
  const clientIp = getClientIp(request.headers);
  const rateLimit = checkInMemoryRateLimit(`impact:${clientIp}`, RATE_LIMIT);

  if (!rateLimit.allowed) {
    writeLog(
      createLogEvent("warn", "impact rate limit exceeded", {
        requestId,
        metadata: {
          endpoint: "/api/impact",
          clientIp,
          limit: rateLimit.limit,
          resetAt: rateLimit.resetAt,
        },
      })
    );

    return NextResponse.json(
      {
        error: "Too many impact requests. Please try again shortly.",
        requestId,
      },
      {
        status: 429,
        headers: {
          "x-request-id": requestId,
          "x-ratelimit-limit": String(rateLimit.limit),
          "x-ratelimit-remaining": String(rateLimit.remaining),
          "x-ratelimit-reset": String(rateLimit.resetAt),
        },
      }
    );
  }

  const body = await request.json().catch(() => null);
  const validation = validateImpactInput(body);

  if (!validation.ok) {
    writeLog(
      createLogEvent("warn", "impact validation failed", {
        requestId,
        metadata: {
          endpoint: "/api/impact",
          clientIp,
          fields: Object.keys(validation.errors).join(","),
        },
      })
    );

    return NextResponse.json(
      {
        errors: validation.errors,
        requestId,
      },
      {
        status: 400,
        headers: {
          "x-request-id": requestId,
          "x-ratelimit-limit": String(rateLimit.limit),
          "x-ratelimit-remaining": String(rateLimit.remaining),
          "x-ratelimit-reset": String(rateLimit.resetAt),
        },
      }
    );
  }

  const impact = calculateImpactEstimate(validation.value.materials);
  const latencyMs = Date.now() - startedAt;

  writeLog(
    createLogEvent("info", "impact estimate calculated", {
      requestId,
      metadata: {
        endpoint: "/api/impact",
        clientIp,
        confidence: impact.confidence,
        materialCount: validation.value.materials.length,
        latencyMs,
      },
    })
  );

  return NextResponse.json(
    {
      ...impact,
      requestId,
    },
    {
      headers: {
        "x-request-id": requestId,
        "x-ratelimit-limit": String(rateLimit.limit),
        "x-ratelimit-remaining": String(rateLimit.remaining),
        "x-ratelimit-reset": String(rateLimit.resetAt),
      },
    }
  );
}

