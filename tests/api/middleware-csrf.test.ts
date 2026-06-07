import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";

function apiRequest(
  method: string,
  init: { origin?: string; referer?: string; host?: string; path?: string } = {}
) {
  const host = init.host ?? "renewcanvas.page";
  const path = init.path ?? "/api/orders";
  const headers = new Headers({ host });
  if (init.origin) headers.set("origin", init.origin);
  if (init.referer) headers.set("referer", init.referer);
  return new NextRequest(`https://${host}${path}`, { method, headers });
}

test("middleware allows safe (GET) requests without an Origin", () => {
  const res = middleware(apiRequest("GET"));
  assert.equal(res.status, 200);
});

test("middleware allows same-origin mutating requests", () => {
  const res = middleware(apiRequest("POST", { origin: "https://renewcanvas.page" }));
  assert.equal(res.status, 200);
});

test("middleware blocks cross-origin mutating requests", async () => {
  const res = middleware(apiRequest("POST", { origin: "https://evil.example.com" }));
  assert.equal(res.status, 403);
  const body = await res.json();
  assert.equal(body.code, "csrf_origin_mismatch");
});

test("middleware blocks mutating requests with no Origin or Referer", () => {
  const res = middleware(apiRequest("DELETE"));
  assert.equal(res.status, 403);
});

test("middleware falls back to Referer when Origin is absent", () => {
  const ok = middleware(apiRequest("POST", { referer: "https://renewcanvas.page/checkout" }));
  assert.equal(ok.status, 200);
  const bad = middleware(apiRequest("POST", { referer: "https://evil.example.com/x" }));
  assert.equal(bad.status, 403);
});

test("middleware exempts the HMAC-signed payment webhook", () => {
  const res = middleware(apiRequest("POST", { path: "/api/payments/webhook", origin: "https://momodeveloper.mtn.com" }));
  assert.equal(res.status, 200);
});

test("middleware exempts the bearer-authed cron reminder endpoint", () => {
  const res = middleware(apiRequest("POST", { path: "/api/admin/reminders" }));
  assert.equal(res.status, 200);
});
