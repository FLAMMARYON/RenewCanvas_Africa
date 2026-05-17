export type FrontendPayment = {
  id: string;
  orderId: string;
  provider: string;
  status: string;
  amount: number;
  currency: string;
  providerReference: string | null;
  checkoutUrl: string | null;
  momoPhone: string | null;
  ussdReference: string | null;
  paidAt: string | null;
};

type PaymentResponse = { ok: boolean; payment: FrontendPayment; message?: string };
type PaymentListResponse = { ok: boolean; payments: FrontendPayment[]; message?: string };

export async function createPaymentSession(payload: {
  orderId: string;
  provider?: string;
  momoPhone?: string;
  idempotencyKey?: string;
}) {
  const response = await fetch("/api/payments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const body = (await response.json()) as PaymentResponse;
  if (!response.ok || !body.ok) throw new Error(body.message ?? "Could not create payment session.");
  return body.payment;
}

export async function listPaymentSessions(orderId?: string) {
  const query = orderId ? `?orderId=${encodeURIComponent(orderId)}` : "";
  const response = await fetch(`/api/payments${query}`, { credentials: "include" });
  const body = (await response.json()) as PaymentListResponse;
  if (!response.ok || !body.ok) throw new Error(body.message ?? "Could not load payment sessions.");
  return body.payments;
}
