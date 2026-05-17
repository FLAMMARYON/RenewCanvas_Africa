import { AuthError, type AuthPublicUser } from "./auth";

export type ShipmentStatus = "pending" | "preparing" | "ready_for_pickup" | "in_transit" | "delivered" | "failed" | "returned";

export type FulfillmentOrderRecord = {
  id: string;
  buyerId: string;
  status: string;
  deliveryAddress: unknown;
  deliveryCents: number;
};

export type ShipmentRecord = {
  id: string;
  orderId: string;
  buyerId: string;
  status: ShipmentStatus;
  carrier: string | null;
  trackingNumber: string | null;
  deliveryAddress: unknown;
  deliveryFeeCents: number;
  artistPrepDueAt: Date | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type FulfillmentDatabase = {
  order: {
    findFirst(args: { where: Record<string, unknown> }): Promise<FulfillmentOrderRecord | null>;
    update(args: { where: { id: string }; data: Record<string, unknown> }): Promise<FulfillmentOrderRecord>;
  };
  shipment: {
    findUnique(args: { where: { orderId: string } }): Promise<ShipmentRecord | null>;
    create(args: { data: Record<string, unknown> }): Promise<ShipmentRecord>;
    update(args: { where: { id: string }; data: Record<string, unknown> }): Promise<ShipmentRecord>;
    findFirst(args: { where: Record<string, unknown> }): Promise<ShipmentRecord | null>;
    findMany(args: { where: Record<string, unknown>; orderBy: { createdAt: "desc" } }): Promise<ShipmentRecord[]>;
  };
  auditLog: {
    create(args: { data: { actorId?: string; action: string; entity: string; entityId: string; metadata?: unknown } }): Promise<unknown>;
  };
};

export async function createShipmentForPaidOrder(db: FulfillmentDatabase, admin: AuthPublicUser, orderId: string, now = new Date()) {
  if (admin.role !== "admin") throw new AuthError("forbidden", "Only admins can create shipments.", 403);
  const order = await db.order.findFirst({ where: { id: orderId } });
  if (!order) throw new AuthError("order_not_found", "Order was not found.", 404);
  if (!["paid", "processing"].includes(order.status)) throw new AuthError("order_not_ready", "Order must be paid before fulfillment.", 409);

  const existing = await db.shipment.findUnique({ where: { orderId: order.id } });
  if (existing) return normalizeShipment(existing);

  const shipment = await db.shipment.create({
    data: {
      orderId: order.id,
      buyerId: order.buyerId,
      status: "preparing",
      deliveryAddress: order.deliveryAddress,
      deliveryFeeCents: order.deliveryCents,
      artistPrepDueAt: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 3),
    },
  });
  await db.order.update({ where: { id: order.id }, data: { status: "processing" } });
  await db.auditLog.create({ data: { actorId: admin.id, action: "shipment.create", entity: "Shipment", entityId: shipment.id } });
  return normalizeShipment(shipment);
}

export async function updateShipmentStatus(
  db: FulfillmentDatabase,
  user: AuthPublicUser,
  shipmentId: string,
  input: { status: ShipmentStatus; carrier?: string; trackingNumber?: string },
  now = new Date()
) {
  if (user.role !== "admin" && user.role !== "artist") {
    throw new AuthError("forbidden", "Only admins and artists can update shipments.", 403);
  }
  const shipment = await db.shipment.findFirst({ where: { id: shipmentId } });
  if (!shipment) throw new AuthError("shipment_not_found", "Shipment was not found.", 404);
  const status = input.status;
  if (!["pending", "preparing", "ready_for_pickup", "in_transit", "delivered", "failed", "returned"].includes(status)) {
    throw new AuthError("invalid_status", "Unsupported shipment status.", 400);
  }

  const updated = await db.shipment.update({
    where: { id: shipment.id },
    data: {
      status,
      carrier: cleanText(input.carrier, 100) ?? shipment.carrier,
      trackingNumber: cleanText(input.trackingNumber, 100) ?? shipment.trackingNumber,
      shippedAt: status === "in_transit" ? now : shipment.shippedAt,
      deliveredAt: status === "delivered" ? now : shipment.deliveredAt,
    },
  });
  if (status === "delivered") await db.order.update({ where: { id: shipment.orderId }, data: { status: "delivered" } });
  if (status === "in_transit") await db.order.update({ where: { id: shipment.orderId }, data: { status: "shipped" } });
  await db.auditLog.create({
    data: { actorId: user.id, action: "shipment.status.update", entity: "Shipment", entityId: shipment.id, metadata: { status } },
  });
  return normalizeShipment(updated);
}

export async function listShipments(db: FulfillmentDatabase, user: AuthPublicUser) {
  const where = user.role === "admin" ? {} : user.role === "buyer" ? { buyerId: user.id } : {};
  const shipments = await db.shipment.findMany({ where, orderBy: { createdAt: "desc" } });
  return shipments.map(normalizeShipment);
}

export function normalizeShipment(shipment: ShipmentRecord) {
  return {
    id: shipment.id,
    orderId: shipment.orderId,
    buyerId: shipment.buyerId,
    status: shipment.status,
    carrier: shipment.carrier,
    trackingNumber: shipment.trackingNumber,
    deliveryAddress: shipment.deliveryAddress,
    deliveryFeeAmount: shipment.deliveryFeeCents / 100,
    artistPrepDueAt: shipment.artistPrepDueAt?.toISOString() ?? null,
    shippedAt: shipment.shippedAt?.toISOString() ?? null,
    deliveredAt: shipment.deliveredAt?.toISOString() ?? null,
  };
}

function cleanText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : null;
}
