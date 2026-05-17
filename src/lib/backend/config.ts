export type BackendConfig = {
  databaseUrl?: string;
  nodeEnv: "development" | "test" | "production";
  siteUrl?: string;
  paymentProvider?: "mtn_momo" | "manual_bank";
  paymentWebhookSecret?: string;
  // MTN MoMo Collection API
  momoApiUser?: string;
  momoApiKey?: string;
  momoSubscriptionKey?: string;
  momoTargetEnvironment?: "sandbox" | "production";
  momoBaseUrl?: string;
  resendApiKey?: string;
  emailFrom?: string;
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioMessagingServiceSid?: string;
  // Anthropic API (AI Listing Assistant)
  anthropicApiKey?: string;
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
  const siteUrl = normalizeOptional(env.NEXT_PUBLIC_SITE_URL);
  const paymentProvider = normalizePaymentProvider(env.PAYMENT_PROVIDER);
  const paymentWebhookSecret = normalizeOptional(env.PAYMENT_WEBHOOK_SECRET);
  // MTN MoMo Collection API
  const momoApiUser = normalizeOptional(env.MOMO_API_USER);
  const momoApiKey = normalizeOptional(env.MOMO_API_KEY);
  const momoSubscriptionKey = normalizeOptional(env.MOMO_SUBSCRIPTION_KEY);
  const momoTargetEnvironment = normalizeMomoEnvironment(env.MOMO_TARGET_ENVIRONMENT);
  // Rwanda-specific production endpoint; sandbox uses global endpoint
  const momoBaseUrl = normalizeOptional(env.MOMO_BASE_URL) ??
    (momoTargetEnvironment === "production"
      ? "https://proxy.momoapi.mtn.co.rw"
      : "https://sandbox.momodeveloper.mtn.com");
  const resendApiKey = normalizeOptional(env.RESEND_API_KEY);
  const emailFrom = normalizeOptional(env.EMAIL_FROM);
  const twilioAccountSid = normalizeOptional(env.TWILIO_ACCOUNT_SID);
  const twilioAuthToken = normalizeOptional(env.TWILIO_AUTH_TOKEN);
  const twilioMessagingServiceSid = normalizeOptional(env.TWILIO_MESSAGING_SERVICE_SID);
  // Anthropic API
  const anthropicApiKey = normalizeOptional(env.ANTHROPIC_API_KEY);

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

  if (siteUrl && !isHttpUrl(siteUrl)) {
    issues.push({
      field: "NEXT_PUBLIC_SITE_URL",
      message: "NEXT_PUBLIC_SITE_URL must be an http:// or https:// URL.",
    });
  }

  if (env.PAYMENT_PROVIDER && !paymentProvider) {
    issues.push({
      field: "PAYMENT_PROVIDER",
      message: "PAYMENT_PROVIDER must be mtn_momo or manual_bank.",
    });
  }

  if (env.MOMO_TARGET_ENVIRONMENT && !momoTargetEnvironment) {
    issues.push({
      field: "MOMO_TARGET_ENVIRONMENT",
      message: "MOMO_TARGET_ENVIRONMENT must be sandbox or production.",
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
      siteUrl,
      paymentProvider,
      paymentWebhookSecret,
      momoApiUser,
      momoApiKey,
      momoSubscriptionKey,
      momoTargetEnvironment,
      momoBaseUrl,
      resendApiKey,
      emailFrom,
      twilioAccountSid,
      twilioAuthToken,
      twilioMessagingServiceSid,
      anthropicApiKey,
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

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizePaymentProvider(value: string | undefined): BackendConfig["paymentProvider"] {
  const normalized = normalizeOptional(value);
  if (!normalized) return undefined;
  return ["mtn_momo", "manual_bank"].includes(normalized)
    ? (normalized as BackendConfig["paymentProvider"])
    : undefined;
}

function normalizeMomoEnvironment(value: string | undefined): "sandbox" | "production" | undefined {
  const normalized = normalizeOptional(value);
  if (!normalized) return "sandbox"; // default to sandbox
  return normalized === "production" ? "production" : normalized === "sandbox" ? "sandbox" : undefined;
}
