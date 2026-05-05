export type BackendConfig = {
  databaseUrl?: string;
  nodeEnv: "development" | "test" | "production";
};

export type BackendConfigIssue = {
  field: string;
  message: string;
};

export type BackendConfigResult =
  | { ok: true; config: BackendConfig; issues: [] }
  | { ok: false; issues: BackendConfigIssue[] };

const allowedNodeEnvs = ["development", "test", "production"] as const;

export function readBackendConfig(
  env: NodeJS.ProcessEnv = process.env,
  options: { requireDatabase?: boolean } = {}
): BackendConfigResult {
  const issues: BackendConfigIssue[] = [];
  const nodeEnv = normalizeNodeEnv(env.NODE_ENV);
  const databaseUrl = normalizeOptional(env.DATABASE_URL);

  if (!nodeEnv) {
    issues.push({
      field: "NODE_ENV",
      message: "NODE_ENV must be development, test, or production.",
    });
  }

  if (options.requireDatabase && !databaseUrl) {
    issues.push({
      field: "DATABASE_URL",
      message: "DATABASE_URL is required for database-backed backend operations.",
    });
  }

  if (databaseUrl && !isSupportedDatabaseUrl(databaseUrl)) {
    issues.push({
      field: "DATABASE_URL",
      message: "DATABASE_URL must use a postgres:// or postgresql:// connection string.",
    });
  }

  if (issues.length > 0 || !nodeEnv) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    config: {
      databaseUrl,
      nodeEnv,
    },
    issues: [],
  };
}

export function requireBackendConfig(
  env: NodeJS.ProcessEnv = process.env,
  options: { requireDatabase?: boolean } = {}
): BackendConfig {
  const result = readBackendConfig(env, options);

  if (!result.ok) {
    const message = result.issues.map((issue) => `${issue.field}: ${issue.message}`).join("; ");
    throw new Error(`Invalid backend environment: ${message}`);
  }

  return result.config;
}

function normalizeOptional(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function normalizeNodeEnv(value: string | undefined): BackendConfig["nodeEnv"] | null {
  const normalized = normalizeOptional(value) ?? "development";
  return allowedNodeEnvs.includes(normalized as BackendConfig["nodeEnv"])
    ? (normalized as BackendConfig["nodeEnv"])
    : null;
}

function isSupportedDatabaseUrl(value: string): boolean {
  return value.startsWith("postgres://") || value.startsWith("postgresql://");
}
