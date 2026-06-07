import assert from "node:assert/strict";
import test from "node:test";
import { POST } from "@/app/api/payments/webhook/route";

function webhookRequest(body: unknown, headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/payments/webhook", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

const payload = { provider: "mtn_momo", providerReference: "ref-123", status: "paid" };

// NODE_ENV is typed read-only; mutate via a loosely-typed view for the test.
const mutableEnv = process.env as Record<string, string | undefined>;

test("webhook refuses unsigned payloads in production when no secret is configured (fail closed)", async () => {
  const prevEnv = process.env.NODE_ENV;
  const prevSecret = process.env.PAYMENT_WEBHOOK_SECRET;
  mutableEnv.NODE_ENV = "production";
  delete mutableEnv.PAYMENT_WEBHOOK_SECRET;

  try {
    const response = await POST(webhookRequest(payload) as never);
    assert.equal(response.status, 503);
    const json = await response.json();
    assert.equal(json.code, "webhook_not_configured");
  } finally {
    mutableEnv.NODE_ENV = prevEnv;
    if (prevSecret === undefined) delete mutableEnv.PAYMENT_WEBHOOK_SECRET;
    else mutableEnv.PAYMENT_WEBHOOK_SECRET = prevSecret;
  }
});

test("webhook rejects a bad signature with 401 when a secret is configured", async () => {
  const prevSecret = process.env.PAYMENT_WEBHOOK_SECRET;
  process.env.PAYMENT_WEBHOOK_SECRET = "test-webhook-secret";

  try {
    const response = await POST(
      webhookRequest(payload, { "x-renewcanvas-signature": "deadbeef" }) as never
    );
    assert.equal(response.status, 401);
    const json = await response.json();
    assert.equal(json.code, "invalid_signature");
  } finally {
    if (prevSecret === undefined) delete process.env.PAYMENT_WEBHOOK_SECRET;
    else process.env.PAYMENT_WEBHOOK_SECRET = prevSecret;
  }
});
