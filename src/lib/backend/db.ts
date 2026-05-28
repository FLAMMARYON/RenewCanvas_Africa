import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { requireBackendConfig } from "./config";

const globalForPrisma = globalThis as typeof globalThis & {
  renewCanvasPrisma?: PrismaClient;
};

export function getDatabaseClient(): PrismaClient {
  if (globalForPrisma.renewCanvasPrisma) {
    console.info("Database client reuse: using cached Prisma client.");
    return globalForPrisma.renewCanvasPrisma;
  }

  console.info("Database client init: creating Prisma client.");
  const client = createDatabaseClient();

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.renewCanvasPrisma = client;
  }

  return client;
}

export function createDatabaseClient(): PrismaClient {
  console.info("Database config read: start.");
  const config = requireBackendConfig(process.env, { requireDatabase: true });
  const databaseUrl = config.databaseUrl;
  console.info("Database config read: success.", {
    hasDatabaseUrl: Boolean(databaseUrl),
  });

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for database-backed backend operations.");
  }

  console.info("Database client init: creating pg pool.");
  const pool = new Pool({ connectionString: databaseUrl });
  return new PrismaClient({
    adapter: new PrismaPg(pool),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
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
