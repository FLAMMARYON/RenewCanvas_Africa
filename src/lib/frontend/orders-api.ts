export type FrontendOrder = {
  id: string;
  buyerId: string | null;
  status: string;
  currency: string;
  paymentMethod: string;
  subtotalAmount: number;
  deliveryAmount: number;
  totalAmount: number;
  deliveryAddress: Record<string, unknown> | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  buyer: { id: string; name: string; email: string } | null;
  buyerContact: { email: string | null; phone: string | null } | null;
  items: Array<{
    id: string;
    artworkId: string;
    artistId: string;
    artistName: string;
    title: string;
    artworkSlug: string | null;
    ownerType: "artist" | "renewcanvas";
    kgDiverted: number;
    unitAmount: number;
    quantity: number;
    image: { url: string; altText: string; sortOrder: number } | null;
  }>;
};

type OrderResponse = { ok: boolean; order: FrontendOrder; message?: string };
type OrderListResponse = { ok: boolean; orders: FrontendOrder[]; message?: string };

/**
 * Platform commission rate (artist keeps the remaining 80%). There is no payout
 * field on the order, so the payout is computed as artwork value minus this
 * commission (delivery is excluded — it is not the artist's share).
 */
export const PLATFORM_COMMISSION_RATE = 0.2;

/**
 * Artist payout for an order: the artist's share of the artwork value after the
 * platform commission. Returns null when the order has no artist-owned items
 * (e.g. RenewCanvas-owned), which the UI shows as "—".
 */
export function artistPayout(order: FrontendOrder): number | null {
  const artistSubtotal = order.items
    .filter((item) => item.ownerType === "artist")
    .reduce((sum, item) => sum + item.unitAmount * item.quantity, 0);
  if (artistSubtotal <= 0) return null;
  return Math.round(artistSubtotal * (1 - PLATFORM_COMMISSION_RATE));
}

export async function createOrder(payload: {
  artworkId: string;
  paymentMethod: string;
  deliveryAddress: Record<string, unknown>;
  notes?: string;
}) {
  const response = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const body = (await response.json()) as OrderResponse;
  if (!response.ok || !body.ok) throw new Error(body.message ?? "Could not create order.");
  return body.order;
}

export async function listOrders() {
  const response = await fetch("/api/orders", { credentials: "include" });
  const body = (await response.json()) as OrderListResponse;
  if (!response.ok || !body.ok) throw new Error(body.message ?? "Could not load orders.");
  return body.orders;
}

export async function readOrder(id: string) {
  const response = await fetch(`/api/orders/${encodeURIComponent(id)}`, { credentials: "include" });
  const body = (await response.json()) as OrderResponse;
  if (!response.ok || !body.ok) throw new Error(body.message ?? "Could not load order.");
  return body.order;
}

type OrderActionResponse = { ok: boolean; id?: string; status?: string; message?: string };

async function postOrderAction(orderId: string, action: "confirm-payment" | "disburse"): Promise<string> {
  const response = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}/${action}`, {
    method: "POST",
    credentials: "include",
  });
  const body = (await response.json()) as OrderActionResponse;
  if (!response.ok || !body.ok) throw new Error(body.message ?? "Could not update order.");
  return body.status ?? "";
}

/** Admin: confirm the buyer's payment was received (pending_payment → paid, artwork sold). */
export async function confirmOrderPayment(orderId: string): Promise<string> {
  return postOrderAction(orderId, "confirm-payment");
}

/** Admin: record the artist disbursement (paid → artist_paid). */
export async function disburseOrder(orderId: string): Promise<string> {
  return postOrderAction(orderId, "disburse");
}
