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
