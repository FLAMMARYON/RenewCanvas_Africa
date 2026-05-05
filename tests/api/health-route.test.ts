import assert from "node:assert/strict";
import test from "node:test";
import { GET } from "../../src/app/api/health/route";

test("GET /api/health reports degraded when DATABASE_URL is not configured", async () => {
  const previousDatabaseUrl = process.env.DATABASE_URL;
  const previousNodeEnv = process.env.NODE_ENV;
  delete process.env.DATABASE_URL;
  setEnv("NODE_ENV", "test");

  try {
    const response = await GET();
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.status, "degraded");
    assert.equal(body.app.ok, true);
    assert.equal(body.database.status, "not_configured");
    assert.match(body.requestId, /^health_/);
  } finally {
    restoreEnv("DATABASE_URL", previousDatabaseUrl);
    restoreEnv("NODE_ENV", previousNodeEnv);
  }
});

test("GET /api/health rejects invalid backend environment", async () => {
  const previousDatabaseUrl = process.env.DATABASE_URL;
  const previousNodeEnv = process.env.NODE_ENV;
  setEnv("DATABASE_URL", "file:./dev.db");
  setEnv("NODE_ENV", "test");

  try {
    const response = await GET();
    const body = await response.json();

    assert.equal(response.status, 503);
    assert.equal(body.status, "degraded");
    assert.equal(body.database.status, "invalid_config");
    assert.deepEqual(body.issues.map((issue: { field: string }) => issue.field), ["DATABASE_URL"]);
  } finally {
    restoreEnv("DATABASE_URL", previousDatabaseUrl);
    restoreEnv("NODE_ENV", previousNodeEnv);
  }
});

function restoreEnv(name: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[name];
    return;
  }

  setEnv(name, value);
}

function setEnv(name: string, value: string) {
  Object.defineProperty(process.env, name, {
    configurable: true,
    enumerable: true,
    value,
    writable: true,
  });
}
