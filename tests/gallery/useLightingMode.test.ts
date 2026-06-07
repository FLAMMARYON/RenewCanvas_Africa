import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { lightingModeForHour } from "@/lib/frontend/useLightingMode";

describe("lightingModeForHour", () => {
  it("returns 'day' for hours before 18:00", () => {
    for (const hour of [0, 6, 10, 12, 17]) {
      assert.equal(lightingModeForHour(hour), "day");
    }
  });

  it("returns 'night' from 18:00 onward", () => {
    for (const hour of [18, 19, 21, 23]) {
      assert.equal(lightingModeForHour(hour), "night");
    }
  });

  it("uses 18:00 as the day→night boundary", () => {
    assert.equal(lightingModeForHour(17), "day");
    assert.equal(lightingModeForHour(18), "night");
  });
});
