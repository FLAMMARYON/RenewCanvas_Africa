import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";
import { auditEvent, clientIpFromRequest, rateLimit } from "@/lib/backend/security-log";
import { clearInMemoryRateLimits } from "@/lib/foundation/rate-limit";

function req(ip?: string) {
  const headers = new Headers();
  if (ip) headers.set("x-forwarded-for", `${ip}, 10.0.0.1`);
  return new NextRequest("https://renewcanvas.page/api/auth/login", { method: "POST", headers });
}

test("clientIpFromRequest takes the first x-forwarded-for hop", () => {
  assert.equal(clientIpFromRequest(req("203.0.113.5")), "203.0.113.5");
});

test("rateLimit blocks after the configured limit per IP+identifier", () => {
  clearInMemoryRateLimits();
  const options = { limit: 3, windowMs: 60_000, identifier: "user@example.com" };
  const request = req("203.0.113.9");

  assert.equal(rateLimit(request, "auth:login", options).allowed, true);
  assert.equal(rateLimit(request, "auth:login", options).allowed, true);
  assert.equal(rateLimit(request, "auth:login", options).allowed, true);
  assert.equal(rateLimit(request, "auth:login", options).allowed, false);

  // A different identifier on the same IP has its own bucket.
  assert.equal(
    rateLimit(request, "auth:login", { ...options, identifier: "other@example.com" }).allowed,
    true
  );
});

test("auditEvent never throws even when the database write fails", async () => {
  const failingDb = {
    securityEvent: {
      create: async () => {
        throw new Error("db down");
      },
    },
  };
  await assert.doesNotReject(() =>
    auditEvent(failingDb, req("203.0.113.1"), { eventType: "auth.login.failed", severity: "warning" })
  );
});

test("auditEvent forwards ip, user-agent, and metadata to the security log", async () => {
  const captured: Array<Record<string, unknown>> = [];
  const db = {
    securityEvent: {
      create: async (args: { data: Record<string, unknown> }) => {
        captured.push(args.data);
        return args.data;
      },
    },
  };
  const headers = new Headers({ "x-forwarded-for": "198.51.100.7", "user-agent": "vitest" });
  const request = new NextRequest("https://renewcanvas.page/api/auth/login", { method: "POST", headers });

  await auditEvent(db, request, { actorId: "u1", eventType: "auth.login.success", metadata: { role: "buyer" } });

  assert.equal(captured.length, 1);
  assert.equal(captured[0].actorId, "u1");
  assert.equal(captured[0].eventType, "auth.login.success");
  assert.equal(captured[0].ipAddress, "198.51.100.7");
  assert.equal(captured[0].userAgent, "vitest");
  assert.deepEqual(captured[0].metadata, { role: "buyer" });
});
