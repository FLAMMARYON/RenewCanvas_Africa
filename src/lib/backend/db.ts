import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as typeof globalThis & {
  renewCanvasPrisma?: PrismaClient;
};

export function getDatabaseClient(): PrismaClient {
  if (globalForPrisma.renewCanvasPrisma) {
    return globalForPrisma.renewCanvasPrisma;
  }

  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.renewCanvasPrisma = client;
  }

  return client;
}

export async function checkDatabaseConnection(): Promise<{
  ok: boolean;
  latencyMs: number;
  error?: string;
}> {
  const startedAt = Date.now();

  try {
    await getDatabaseClient().$queryRaw`SELECT 1`;
    return { ok: true, latencyMs: Date.now() - startedAt };
  } catch (error) {
    return {
      ok: false,
      latencyMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : "Unknown database connection error",
    };
  }
}
