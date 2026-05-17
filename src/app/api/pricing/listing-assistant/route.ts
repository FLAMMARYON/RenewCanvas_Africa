import { NextResponse } from "next/server";
import { createLogEvent, writeLog } from "@/lib/foundation/logger";
import { checkInMemoryRateLimit } from "@/lib/foundation/rate-limit";
import { createRequestId, getClientIp } from "@/lib/foundation/request";
import { readBackendConfig } from "@/lib/backend/config";
import {
  callListingAssistant,
  LISTING_ASSISTANT_VERSION,
  validateListingAssistantInput,
} from "@/lib/ml/listing-assistant";

const RATE_LIMIT = {
  limit: 10, // Lower limit due to external API cost
  windowMs: 60_000,
};

export async function POST(request: Request) {
  const requestId = createRequestId("listing-assistant");
  const startedAt = Date.now();
  const clientIp = getClientIp(request.headers);
  const rateLimit = checkInMemoryRateLimit(`listing-assistant:${clientIp}`, RATE_LIMIT);

  if (!rateLimit.allowed) {
    writeLog(
      createLogEvent("warn", "listing assistant rate limit exceeded", {
        requestId,
        metadata: {
          endpoint: "/api/pricing/listing-assistant",
          clientIp,
          limit: rateLimit.limit,
          resetAt: rateLimit.resetAt,
        },
      })
    );

    return NextResponse.json(
      {
        error: "Too many requests. Please wait before trying again.",
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

  // Check for Anthropic API key using config system
  const configResult = readBackendConfig();
  const anthropicApiKey = configResult.ok ? configResult.config.anthropicApiKey : undefined;

  // Debug logging to confirm env loading
  const rawEnvKey = process.env.ANTHROPIC_API_KEY;
  console.log("[listing-assistant] DEBUG: process.env.ANTHROPIC_API_KEY =", rawEnvKey ? `sk-...${rawEnvKey.slice(-8)}` : "undefined");
  console.log("[listing-assistant] DEBUG: config.anthropicApiKey =", anthropicApiKey ? `sk-...${anthropicApiKey.slice(-8)}` : "undefined");

  if (!anthropicApiKey) {
    writeLog(
      createLogEvent("error", "listing assistant missing API key", {
        requestId,
        metadata: {
          endpoint: "/api/pricing/listing-assistant",
          rawEnvDefined: !!rawEnvKey,
          configKeyDefined: !!anthropicApiKey,
        },
      })
    );

    return NextResponse.json(
      {
        error: "AI service is not configured. Please contact support.",
        requestId,
      },
      {
        status: 503,
        headers: {
          "x-request-id": requestId,
        },
      }
    );
  }

  const body = await request.json().catch(() => null);
  const validation = validateListingAssistantInput(body);

  if (!validation.ok) {
    writeLog(
      createLogEvent("warn", "listing assistant validation failed", {
        requestId,
        metadata: {
          endpoint: "/api/pricing/listing-assistant",
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

  try {
    const result = await callListingAssistant(validation.value, anthropicApiKey);
    const latencyMs = Date.now() - startedAt;

    writeLog(
      createLogEvent("info", "listing assistant completed", {
        requestId,
        metadata: {
          endpoint: "/api/pricing/listing-assistant",
          clientIp,
          tagsCount: result.suggestedTags.length,
          priceMin: result.priceRange.min,
          priceMax: result.priceRange.max,
          latencyMs,
        },
      })
    );

    return NextResponse.json(
      {
        ok: true,
        ...result,
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
  } catch (error) {
    const latencyMs = Date.now() - startedAt;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    writeLog(
      createLogEvent("error", "listing assistant failed", {
        requestId,
        metadata: {
          endpoint: "/api/pricing/listing-assistant",
          clientIp,
          error: errorMessage,
          latencyMs,
        },
      })
    );

    return NextResponse.json(
      {
        error: "AI service temporarily unavailable. Please try again later.",
        requestId,
      },
      {
        status: 500,
        headers: {
          "x-request-id": requestId,
          "x-ratelimit-limit": String(rateLimit.limit),
          "x-ratelimit-remaining": String(rateLimit.remaining),
          "x-ratelimit-reset": String(rateLimit.resetAt),
        },
      }
    );
  }
}
