import { NextResponse } from "next/server";
import { createLogEvent, writeLog } from "@/lib/foundation/logger";
import { checkInMemoryRateLimit } from "@/lib/foundation/rate-limit";
import { createRequestId, getClientIp } from "@/lib/foundation/request";
import {
  calculatePricingRecommendation,
  PRICING_METHODOLOGY_VERSION,
  validatePricingInput,
} from "@/lib/ml/pricing";

const RATE_LIMIT = {
  limit: 30,
  windowMs: 60_000,
};

export async function POST(request: Request) {
  const requestId = createRequestId("pricing");
  const startedAt = Date.now();
  const clientIp = getClientIp(request.headers);
  const rateLimit = checkInMemoryRateLimit(`pricing:${clientIp}`, RATE_LIMIT);

  if (!rateLimit.allowed) {
    writeLog(
      createLogEvent("warn", "pricing rate limit exceeded", {
        requestId,
        metadata: {
          endpoint: "/api/pricing",
          clientIp,
          limit: rateLimit.limit,
          resetAt: rateLimit.resetAt,
        },
      })
    );

    return NextResponse.json(
      {
        error: "Too many pricing requests. Please try again shortly.",
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
  const validation = validatePricingInput(body);

  if (!validation.ok) {
    writeLog(
      createLogEvent("warn", "pricing validation failed", {
        requestId,
        metadata: {
          endpoint: "/api/pricing",
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

  const recommendation = calculatePricingRecommendation(validation.value);
  const latencyMs = Date.now() - startedAt;

  writeLog(
    createLogEvent("info", "pricing recommendation calculated", {
      requestId,
      metadata: {
        endpoint: "/api/pricing",
        clientIp,
        category: validation.value.category,
        confidence: recommendation.confidence,
        latencyMs,
      },
    })
  );

  return NextResponse.json(
    {
      ...recommendation,
      methodologyVersion: PRICING_METHODOLOGY_VERSION,
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
