import assert from "node:assert/strict";
import test from "node:test";
import { readBackendConfig, requireBackendConfig } from "@/lib/backend/config";

test("readBackendConfig accepts supported PostgreSQL database URLs", () => {
  const result = readBackendConfig({
    NODE_ENV: "test",
    DATABASE_URL: "postgresql://renewcanvas:secret@localhost:5432/renewcanvas",
  });

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.config.nodeEnv, "test");
    assert.equal(result.config.databaseUrl, "postgresql://renewcanvas:secret@localhost:5432/renewcanvas");
  }
});

test("readBackendConfig allows missing DATABASE_URL for build-time frontend operation", () => {
  const result = readBackendConfig({ NODE_ENV: "production" });

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.config.databaseUrl, undefined);
  }
});

test("readBackendConfig can require DATABASE_URL for database operations", () => {
  const result = readBackendConfig({ NODE_ENV: "production" }, { requireDatabase: true });

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.deepEqual(result.issues.map((issue) => issue.field), ["DATABASE_URL"]);
  }
});

test("requireBackendConfig rejects unsupported database providers", () => {
  assert.throws(
    () => requireBackendConfig({ NODE_ENV: "test", DATABASE_URL: "file:./dev.db" }),
    /DATABASE_URL must use a postgres/
  );
});

test("readBackendConfig accepts production integration secrets", () => {
  const result = readBackendConfig({
    NODE_ENV: "production",
    DATABASE_URL: "postgresql://renewcanvas:secret@db.example.com:5432/renewcanvas",
    NEXT_PUBLIC_SITE_URL: "https://renewcanvas.africa",
    PAYMENT_PROVIDER: "mtn_momo",
    PAYMENT_WEBHOOK_SECRET: "webhook-secret",
    MOMO_API_USER: "momo-user",
    MOMO_API_KEY: "momo-key",
    MOMO_SUBSCRIPTION_KEY: "momo-sub-key",
    RESEND_API_KEY: "re-secret",
    EMAIL_FROM: "RenewCanvas Africa <orders@renewcanvas.africa>",
    TWILIO_ACCOUNT_SID: "AC123",
    TWILIO_AUTH_TOKEN: "twilio-secret",
    TWILIO_MESSAGING_SERVICE_SID: "MG123",
    ANTHROPIC_API_KEY: "sk-ant-api03-secret",
  });

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.config.siteUrl, "https://renewcanvas.africa");
    assert.equal(result.config.paymentProvider, "mtn_momo");
    assert.equal(result.config.emailFrom, "RenewCanvas Africa <orders@renewcanvas.africa>");
    assert.equal(result.config.anthropicApiKey, "sk-ant-api03-secret");
  }
});

test("readBackendConfig rejects invalid production URLs and payment providers", () => {
  const result = readBackendConfig({
    NODE_ENV: "production",
    NEXT_PUBLIC_SITE_URL: "renewcanvas.africa",
    PAYMENT_PROVIDER: "cash",
  });

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.deepEqual(
      result.issues.map((issue) => issue.field),
      ["NEXT_PUBLIC_SITE_URL", "PAYMENT_PROVIDER"]
    );
  }
});

test("readBackendConfig loads Anthropic API key for AI listing assistant", () => {
  const result = readBackendConfig({
    NODE_ENV: "production",
    ANTHROPIC_API_KEY: "sk-ant-api03-test-key",
  });

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.config.anthropicApiKey, "sk-ant-api03-test-key");
  }
});
