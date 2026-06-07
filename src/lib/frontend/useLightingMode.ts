import { useEffect, useState } from "react";

export type LightingMode = "day" | "night";

/** Pure mapping: hour (0–23) → lighting mode. Night begins at 18:00. */
export function lightingModeForHour(hour: number): LightingMode {
  return hour < 18 ? "day" : "night";
}

/**
 * Returns "day" if current hour < 18, "night" otherwise.
 * Updates every 60 seconds.
 */
function getLightingMode(): LightingMode {
  return lightingModeForHour(new Date().getHours());
}

export function useLightingMode(): LightingMode {
  const [mode, setMode] = useState<LightingMode>(getLightingMode);

  useEffect(() => {
    // Update mode every 60 seconds
    const intervalId = setInterval(() => {
      setMode(getLightingMode());
    }, 60_000); // 60 seconds

    return () => clearInterval(intervalId);
  }, []);

  return mode;
}
