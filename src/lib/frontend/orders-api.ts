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
