import assert from "node:assert/strict";
import test from "node:test";
import { createLogEvent } from "../../src/lib/foundation/logger";

test("createLogEvent creates structured JSON-safe log payloads", () => {
  const event = createLogEvent("info", "pricing calculated", {
    requestId: "req_123",
    now: new Date("2026-05-04T00:00:00.000Z"),
    metadata: {
      endpoint: "/api/pricing",
      status: 200,
      cached: false,
    },
  });

  assert.deepEqual(event, {
    level: "info",
    message: "pricing calculated",
    requestId: "req_123",
    timestamp: "2026-05-04T00:00:00.000Z",
    metadata: {
      endpoint: "/api/pricing",
      status: 200,
      cached: false,
    },
  });
  assert.doesNotThrow(() => JSON.stringify(event));
});
