import assert from "node:assert/strict";
import test from "node:test";
import {
  checkInMemoryRateLimit,
  clearInMemoryRateLimits,
} from "../../src/lib/foundation/rate-limit";

test("checkInMemoryRateLimit allows requests up to the configured limit", () => {
  clearInMemoryRateLimits();

  const first = checkInMemoryRateLimit("artist-1", {
    limit: 2,
    windowMs: 1000,
    now: 100,
  });
  const second = checkInMemoryRateLimit("artist-1", {
    limit: 2,
    windowMs: 1000,
    now: 200,
  });

  assert.equal(first.allowed, true);
  assert.equal(first.remaining, 1);
  assert.equal(second.allowed, true);
  assert.equal(second.remaining, 0);
});

test("checkInMemoryRateLimit blocks requests over the configured limit", () => {
  clearInMemoryRateLimits();

  checkInMemoryRateLimit("artist-2", { limit: 1, windowMs: 1000, now: 100 });
  const blocked = checkInMemoryRateLimit("artist-2", {
    limit: 1,
    windowMs: 1000,
    now: 200,
  });

  assert.equal(blocked.allowed, false);
  assert.equal(blocked.remaining, 0);
});

test("checkInMemoryRateLimit resets buckets after the window expires", () => {
  clearInMemoryRateLimits();

  checkInMemoryRateLimit("artist-3", { limit: 1, windowMs: 1000, now: 100 });
  const afterReset = checkInMemoryRateLimit("artist-3", {
    limit: 1,
    windowMs: 1000,
    now: 1200,
  });

  assert.equal(afterReset.allowed, true);
  assert.equal(afterReset.remaining, 0);
});

test("checkInMemoryRateLimit rejects invalid configuration", () => {
  clearInMemoryRateLimits();

  assert.throws(
    () => checkInMemoryRateLimit("artist-4", { limit: 0, windowMs: 1000 }),
    /positive integer/
  );
  assert.throws(
    () => checkInMemoryRateLimit("artist-4", { limit: 1, windowMs: 0 }),
    /positive integer/
  );
  assert.throws(
    () => checkInMemoryRateLimit(" ", { limit: 1, windowMs: 1000 }),
    /must not be empty/
  );
});
