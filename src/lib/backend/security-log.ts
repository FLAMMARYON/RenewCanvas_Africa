import type { NextRequest } from "next/server";
import { recordSecurityEvent, type HardeningDatabase } from "./hardening";
import { checkInMemoryRateLimit, type RateLimitResult } from "@/lib/foundation/rate-limit";

/**
 * Request-aware audit logging + rate limiting helpers shared across the
 * sensitive auth / contact / admin endpoints.
 *
 * These wrap the lower-level primitives so that:
 *  - audit failures NEVER break the user-facing request (best-effort logging),
 *  - IP / user-agent are consistently captured for the security trail.
 */

export function clientIpFromRequest(request: NextRequest): string | undefined {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    undefined
  );
}

export async function auditEvent(
  db: unknown,
  request: NextRequest,
  input: {
    actorId?: string;
    eventType: string;
    severity?: "info" | "warning" | "critical";
    metadata?: unknown;
  }
): Promise<void> {
  try {
    await recordSecurityEvent(db as HardeningDatabase, {
      actorId: input.actorId,
      eventType: input.eventType,
      severity: input.severity,
      ipAddress: clientIpFromRequest(request),
      userAgent: request.headers.get("user-agent") ?? undefined,
      metadata: input.metadata,
    });
  } catch (error) {
    // Logging must not take down the request path.
    console.error("Failed to record security event", { eventType: input.eventType, error });
  }
}

/**
 * Per-IP (optionally per-identifier) rate limit for an endpoint. Returns the
 * full result so callers can attach standard rate-limit headers.
 */
export function rateLimit(
  request: NextRequest,
  scope: string,
  options: { limit: number; windowMs: number; identifier?: string }
): RateLimitResult {
  const ip = clientIpFromRequest(request) ?? "unknown";
  const key = options.identifier ? `${scope}:${ip}:${options.identifier}` : `${scope}:${ip}`;
  return checkInMemoryRateLimit(key, { limit: options.limit, windowMs: options.windowMs });
}
