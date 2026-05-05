import { NextResponse } from "next/server";
import { readBackendConfig } from "@/lib/backend/config";
import { checkDatabaseConnection } from "@/lib/backend/db";
import { createLogEvent, writeLog } from "@/lib/foundation/logger";
import { createRequestId } from "@/lib/foundation/request";

export const dynamic = "force-dynamic";

export async function GET() {
  const requestId = createRequestId("health");
  const configResult = readBackendConfig(process.env);

  if (!configResult.ok) {
    writeLog(
      createLogEvent("warn", "backend health configuration invalid", {
        requestId,
        metadata: { fields: configResult.issues.map((issue) => issue.field).join(",") },
      })
    );

    return NextResponse.json(
      {
        status: "degraded",
        requestId,
        app: { ok: true },
        database: { status: "invalid_config" },
        issues: configResult.issues,
      },
      { status: 503 }
    );
  }

  if (!configResult.config.databaseUrl) {
    return NextResponse.json({
      status: "degraded",
      requestId,
      app: { ok: true },
      database: { status: "not_configured" },
    });
  }

  const database = await checkDatabaseConnection();

  if (!database.ok) {
    writeLog(
      createLogEvent("error", "backend health database check failed", {
        requestId,
        metadata: { latencyMs: database.latencyMs },
      })
    );

    return NextResponse.json(
      {
        status: "degraded",
        requestId,
        app: { ok: true },
        database: {
          status: "unavailable",
          latencyMs: database.latencyMs,
          error: database.error,
        },
      },
      { status: 503 }
    );
  }

  return NextResponse.json({
    status: "ok",
    requestId,
    app: { ok: true },
    database: {
      status: "ok",
      latencyMs: database.latencyMs,
    },
  });
}
