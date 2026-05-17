import { randomUUID } from "node:crypto";
import { requireBackendConfig } from "./config";
import type { PaymentProvider, PaymentStatus } from "./payments";

export type ProviderPaymentRequest = {
  orderId: string;
  amountCents: number;
  currency: string;
  buyerEmail: string;
  buyerName: string;
  provider: PaymentProvider;
  momoPhone?: string | null;
  idempotencyKey: string;
};

export type ProviderPaymentSession = {
  provider: PaymentProvider;
  status: PaymentStatus;
  providerReference: string;
  checkoutUrl: string | null;
  ussdReference: string | null;
  rawProviderPayload?: unknown;
};

export type ProviderWebhookEvent = {
  provider: PaymentProvider;
  providerReference: string;
  webhookEventId?: string;
  status: PaymentStatus;
  rawProviderPayload: unknown;
};

export type PaymentProviderClient = {
  createSession(input: ProviderPaymentRequest): Promise<ProviderPaymentSession>;
  parseWebhook(payload: unknown): ProviderWebhookEvent;
};

// MTN MoMo Token Cache
let cachedMomoToken: { token: string; expiresAt: number } | null = null;

/**
 * Get MTN MoMo Collection API bearer token.
 * Calls POST /collection/token/ with Basic auth (base64 of API_USER:API_KEY)
 * and the subscription key header. Token expires in 3600s, so we cache it
 * with a 5-minute buffer before expiry.
 */
export async function getMoMoToken(): Promise<string> {
  const config = requireBackendConfig();

  if (!config.momoApiUser || !config.momoApiKey || !config.momoSubscriptionKey) {
    throw new Error("MTN MoMo credentials not configured. Set MOMO_API_USER, MOMO_API_KEY, and MOMO_SUBSCRIPTION_KEY.");
  }

  // Return cached token if still valid (with 5-minute buffer)
  const now = Date.now();
  if (cachedMomoToken && cachedMomoToken.expiresAt > now + 5 * 60 * 1000) {
    return cachedMomoToken.token;
  }

  const basicAuth = Buffer.from(`${config.momoApiUser}:${config.momoApiKey}`).toString("base64");
  const baseUrl = config.momoBaseUrl ?? "https://sandbox.momodeveloper.mtn.com";

  const response = await fetch(`${baseUrl}/collection/token/`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Ocp-Apim-Subscription-Key": config.momoSubscriptionKey,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get MoMo token: ${response.status} ${errorText}`);
  }

  const body = (await response.json()) as { access_token?: string; expires_in?: number };
  if (!body.access_token) {
    throw new Error("MoMo token response missing access_token.");
  }

  // Cache the token (expires_in is in seconds, typically 3600)
  const expiresIn = body.expires_in ?? 3600;
  cachedMomoToken = {
    token: body.access_token,
    expiresAt: now + expiresIn * 1000,
  };

  return cachedMomoToken.token;
}

/**
 * Request payment via MTN MoMo Collection API.
 * POST /collection/v1_0/requesttopay
 *
 * Note: Sandbox uses EUR currency; production uses RWF.
 */
export async function requestMoMoPay(input: {
  amountRwf: number;
  phoneNumber: string; // format: 2507XXXXXXXX or sandbox test number
  orderId: string;
  payerMessage?: string;
  payeeNote?: string;
}): Promise<{ referenceId: string; status: "PENDING" }> {
  const config = requireBackendConfig();

  if (!config.momoSubscriptionKey) {
    throw new Error("MTN MoMo subscription key not configured.");
  }

  const token = await getMoMoToken();
  const referenceId = randomUUID();
  const baseUrl = config.momoBaseUrl ?? "https://sandbox.momodeveloper.mtn.com";
  const targetEnvironment = config.momoTargetEnvironment ?? "sandbox";

  // Sandbox uses EUR; production uses RWF
  const isSandbox = targetEnvironment === "sandbox";
  const currency = isSandbox ? "EUR" : "RWF";

  const response = await fetch(`${baseUrl}/collection/v1_0/requesttopay`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Reference-Id": referenceId,
      "X-Target-Environment": targetEnvironment,
      "Ocp-Apim-Subscription-Key": config.momoSubscriptionKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: String(input.amountRwf),
      currency,
      externalId: input.orderId,
      payer: {
        partyIdType: "MSISDN",
        partyId: input.phoneNumber,
      },
      payerMessage: input.payerMessage ?? "RenewCanvas Africa Order Payment",
      payeeNote: input.payeeNote ?? `Order ${input.orderId}`,
    }),
  });

  // MoMo returns 202 Accepted for successful request
  if (response.status !== 202) {
    const errorText = await response.text();
    throw new Error(`MoMo requestToPay failed: ${response.status} ${errorText}`);
  }

  return { referenceId, status: "PENDING" };
}

export type MoMoStatusResult =
  | {
      ok: true;
      status: "PENDING" | "SUCCESSFUL" | "FAILED";
      reason?: string;
      financialTransactionId?: string;
      rawResponse: unknown;
    }
  | {
      ok: false;
      errorCode: number;
      errorMessage: string;
      rawResponse?: unknown;
    };

/**
 * Check payment status via MTN MoMo Collection API.
 * GET /collection/v1_0/requesttopay/{referenceId}
 *
 * Returns a discriminated union so callers can handle errors without try/catch.
 */
export async function getMoMoPaymentStatus(referenceId: string): Promise<MoMoStatusResult> {
  const config = requireBackendConfig();

  if (!config.momoSubscriptionKey) {
    return {
      ok: false,
      errorCode: 503,
      errorMessage: "MTN MoMo subscription key not configured.",
    };
  }

  let token: string;
  try {
    token = await getMoMoToken();
  } catch (err) {
    return {
      ok: false,
      errorCode: 502,
      errorMessage: err instanceof Error ? err.message : "Failed to get MoMo token",
    };
  }

  const baseUrl = config.momoBaseUrl ?? "https://sandbox.momodeveloper.mtn.com";
  const targetEnvironment = config.momoTargetEnvironment ?? "sandbox";

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/collection/v1_0/requesttopay/${referenceId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Target-Environment": targetEnvironment,
        "Ocp-Apim-Subscription-Key": config.momoSubscriptionKey,
      },
    });
  } catch (err) {
    return {
      ok: false,
      errorCode: 502,
      errorMessage: err instanceof Error ? err.message : "Network error contacting MoMo API",
    };
  }

  if (!response.ok) {
    let errorBody: unknown;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = await response.text().catch(() => null);
    }

    // 404 typically means the reference doesn't exist on MTN side
    if (response.status === 404) {
      return {
        ok: false,
        errorCode: 404,
        errorMessage: "Payment reference not found on MTN MoMo. The transaction may not have been created successfully.",
        rawResponse: errorBody,
      };
    }

    return {
      ok: false,
      errorCode: response.status,
      errorMessage: `MoMo API returned ${response.status}`,
      rawResponse: errorBody,
    };
  }

  const body = (await response.json()) as {
    status?: string;
    reason?: string;
    financialTransactionId?: string;
  };

  const status =
    body.status === "SUCCESSFUL"
      ? "SUCCESSFUL"
      : body.status === "FAILED"
        ? "FAILED"
        : "PENDING";

  return {
    ok: true,
    status,
    reason: body.reason,
    financialTransactionId: body.financialTransactionId,
    rawResponse: body,
  };
}

export function createPaymentProviderClient(provider: PaymentProvider): PaymentProviderClient {
  if (provider === "mtn_momo") return new MtnMoMoPaymentClient();
  return new ManualPaymentClient(provider);
}

class MtnMoMoPaymentClient implements PaymentProviderClient {
  async createSession(input: ProviderPaymentRequest): Promise<ProviderPaymentSession> {
    const config = requireBackendConfig();

    // Fall back to manual if MoMo not configured
    if (!config.momoApiUser || !config.momoApiKey || !config.momoSubscriptionKey) {
      return new ManualPaymentClient("mtn_momo").createSession(input);
    }

    if (!input.momoPhone) {
      throw new Error("Phone number is required for MTN MoMo payments.");
    }

    // Validate phone format (should be 2507XXXXXXXX for Rwanda)
    const phoneNumber = normalizeRwandaPhone(input.momoPhone);
    if (!phoneNumber) {
      throw new Error("Invalid phone number format. Use format 2507XXXXXXXX or 07XXXXXXXX.");
    }

    const result = await requestMoMoPay({
      amountRwf: Math.round(input.amountCents / 100), // Convert cents to RWF
      phoneNumber,
      orderId: input.orderId,
      payerMessage: `RenewCanvas Africa Order ${input.orderId}`,
      payeeNote: `Payment from ${input.buyerName}`,
    });

    return {
      provider: "mtn_momo",
      status: "pending",
      providerReference: result.referenceId,
      checkoutUrl: null, // MoMo uses push notification to phone
      ussdReference: null,
      rawProviderPayload: result,
    };
  }

  parseWebhook(payload: unknown): ProviderWebhookEvent {
    const record = asRecord(payload);
    const status = record.status === "SUCCESSFUL" ? "paid" : record.status === "FAILED" ? "failed" : "pending";
    return {
      provider: "mtn_momo",
      providerReference: stringValue(record.externalId) ?? stringValue(record.referenceId) ?? "",
      webhookEventId: stringValue(record.financialTransactionId),
      status,
      rawProviderPayload: payload,
    };
  }
}

class ManualPaymentClient implements PaymentProviderClient {
  constructor(private readonly provider: PaymentProvider) {}

  async createSession(input: ProviderPaymentRequest): Promise<ProviderPaymentSession> {
    const providerReference = `rc-${input.orderId}-${Date.now()}`;
    return {
      provider: this.provider,
      status: this.provider === "mtn_momo" ? "requires_action" : "pending",
      providerReference,
      checkoutUrl: null,
      ussdReference: this.provider === "mtn_momo" ? `RC${input.orderId.slice(-6).toUpperCase()}` : null,
    };
  }

  parseWebhook(payload: unknown): ProviderWebhookEvent {
    const record = asRecord(payload);
    return {
      provider: this.provider,
      providerReference: stringValue(record.providerReference) ?? "",
      webhookEventId: stringValue(record.webhookEventId),
      status: record.status === "paid" || record.status === "failed" ? record.status : "pending",
      rawProviderPayload: payload,
    };
  }
}

/**
 * Normalize phone number for MoMo API.
 * In sandbox mode, accepts test numbers (any format).
 * In production, requires Rwandan format 2507XXXXXXXX.
 */
function normalizeRwandaPhone(phone: string): string | null {
  const cleaned = phone.replace(/[\s\-\(\)\+]/g, "");
  const config = requireBackendConfig();
  const isSandbox = config.momoTargetEnvironment !== "production";

  // Already in international format (Rwanda)
  if (/^2507\d{8}$/.test(cleaned)) {
    return cleaned;
  }

  // Local format 07XXXXXXXX (Rwanda)
  if (/^07\d{8}$/.test(cleaned)) {
    return "25" + cleaned;
  }

  // In sandbox mode, accept any numeric phone number for testing
  // MTN MoMo sandbox accepts European test numbers like 46733123450
  if (isSandbox && /^\d{8,15}$/.test(cleaned)) {
    return cleaned;
  }

  return null;
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" || typeof value === "number" ? String(value) : undefined;
}

// For testing: clear token cache
export function clearMomoTokenCache(): void {
  cachedMomoToken = null;
}
