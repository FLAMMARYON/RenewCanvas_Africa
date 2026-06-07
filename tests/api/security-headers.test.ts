import assert from "node:assert/strict";
import test from "node:test";
import nextConfig from "../../next.config";

test("next.config exposes the required security headers on all routes", async () => {
  assert.equal(typeof nextConfig.headers, "function");
  const rules = await nextConfig.headers!();
  const rule = rules.find((r) => r.source === "/:path*");
  assert.ok(rule, "expected a catch-all header rule");

  const byKey = new Map(rule!.headers.map((h) => [h.key, h.value]));

  assert.equal(byKey.get("X-Frame-Options"), "DENY");
  assert.equal(byKey.get("X-Content-Type-Options"), "nosniff");
  assert.equal(byKey.get("Referrer-Policy"), "strict-origin-when-cross-origin");
  assert.ok(byKey.get("Permissions-Policy"));
  assert.ok(byKey.get("Strict-Transport-Security")?.includes("max-age="));

  const csp = byKey.get("Content-Security-Policy-Report-Only");
  assert.ok(csp, "expected a report-only CSP");
  assert.ok(csp!.includes("default-src 'self'"));
  assert.ok(csp!.includes("frame-ancestors 'none'"));
  assert.ok(csp!.includes("object-src 'none'"));
});

test("next.config disables the X-Powered-By header", () => {
  assert.equal(nextConfig.poweredByHeader, false);
});
