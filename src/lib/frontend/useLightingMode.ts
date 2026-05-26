import { useEffect, useState } from "react";

export type LightingMode = "day" | "night";

/**
 * Returns "day" if current hour < 18, "night" otherwise.
 * Updates every 60 seconds.
 */
function getLightingMode(): LightingMode {
  const hour = new Date().getHours();
  return hour < 18 ? "day" : "night";
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
