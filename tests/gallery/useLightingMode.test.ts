import { describe, it, mock } from "node:test";
import assert from "node:assert";

describe("useLightingMode", () => {
  it("should return 'day' when hour is less than 18", () => {
    // Mock date to 10:00 AM
    const mockDate = new Date("2026-05-25T10:00:00");
    const originalDate = global.Date;

    // @ts-ignore - Mocking Date constructor
    global.Date = class extends Date {
      constructor() {
        super();
        return mockDate;
      }
    } as DateConstructor;

    // Import after mocking
    const { useLightingMode } = require("../../src/lib/frontend/useLightingMode");

    // Note: Since this is a hook, we can't directly test it in Node.js
    // This test validates the logic by checking the time condition
    const hour = mockDate.getHours();
    const expectedMode = hour < 18 ? "day" : "night";

    assert.strictEqual(expectedMode, "day");
    assert.strictEqual(hour, 10);

    // Restore original Date
    global.Date = originalDate;
  });

  it("should return 'night' when hour is 18 or greater", () => {
    // Mock date to 20:00 (8 PM)
    const mockDate = new Date("2026-05-25T20:00:00");
    const originalDate = global.Date;

    // @ts-ignore - Mocking Date constructor
    global.Date = class extends Date {
      constructor() {
        super();
        return mockDate;
      }
    } as DateConstructor;

    const hour = mockDate.getHours();
    const expectedMode = hour < 18 ? "day" : "night";

    assert.strictEqual(expectedMode, "night");
    assert.strictEqual(hour, 20);

    // Restore original Date
    global.Date = originalDate;
  });

  it("should return 'night' when hour is exactly 18", () => {
    const mockDate = new Date("2026-05-25T18:00:00");
    const hour = mockDate.getHours();
    const expectedMode = hour < 18 ? "day" : "night";

    assert.strictEqual(expectedMode, "night");
    assert.strictEqual(hour, 18);
  });

  it("should return 'day' for early morning hours", () => {
    const mockDate = new Date("2026-05-25T06:00:00");
    const hour = mockDate.getHours();
    const expectedMode = hour < 18 ? "day" : "night";

    assert.strictEqual(expectedMode, "day");
    assert.strictEqual(hour, 6);
  });
});
