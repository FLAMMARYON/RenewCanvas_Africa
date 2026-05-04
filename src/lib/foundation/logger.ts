export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogEvent = {
  level: LogLevel;
  message: string;
  requestId?: string;
  timestamp: string;
  metadata?: Record<string, string | number | boolean | null>;
};

export function createLogEvent(
  level: LogLevel,
  message: string,
  options: {
    requestId?: string;
    metadata?: Record<string, string | number | boolean | null>;
    now?: Date;
  } = {}
): LogEvent {
  return {
    level,
    message,
    requestId: options.requestId,
    timestamp: (options.now ?? new Date()).toISOString(),
    metadata: options.metadata,
  };
}

export function writeLog(event: LogEvent) {
  const payload = JSON.stringify(event);

  if (event.level === "error") {
    console.error(payload);
    return;
  }

  if (event.level === "warn") {
    console.warn(payload);
    return;
  }

  console.log(payload);
}
