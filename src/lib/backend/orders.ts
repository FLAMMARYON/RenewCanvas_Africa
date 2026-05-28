import { AuthError, type AuthPublicUser } from "./auth";

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded"
  | "failed";

export type OrderArtworkRecord = {
  id: string;
  artistId: string;
  slug: string;
  title: string;
  status: string;
  ownerType: "artist" | "renewcanvas";
  priceCents: number;
  currency: string;
  kgDiverted: unknown;
  artist?: { id: string; name: string; email: string } | null;
};

export type OrderRecord = {
  id: string;
  buyerId: string;
  status: OrderStatus;
  currency: string;
  paymentMethod: string;
  subtotalCents: number;
  deliveryCents: number;
  totalCents: number;
  deliveryAddress: unknown;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  buyer?: { id: string; name: string; email: string } | null;
  items?: OrderItemRecord[];
};

export type OrderItemRecord = {
  id: string;
  orderId: string;
  artworkId: string;
  artistId: string;
  artistName: string;
  title: string;
  artworkSlug: string | null;
  ownerType: "artist" | "renewcanvas";
  kgDiverted: unknown;
  unitCents: number;
  quantity: number;
  createdAt: Date;
  artwork?: { id: string; slug: string; images?: Array<{ url: string; altText: string; sortOrder: number }> } | null;
};

type OrderInclude = {
  buyer: { select: { id: true; name: true; email: true } };
  items: { include: { artwork: { select: { id: true; slug: true; images: { orderBy: { sortOrder: "asc" } } } } } };
};

export type OrderDatabase = {
  artwork: {
    findFirst(args: {
      where: Record<string, unknown>;
      include: { artist: { select: { id: true; name: true; email: true } } };
    }): Promise<OrderArtworkRecord | null>;
    updateMany(args: { where: Record<string, unknown>; data: Record<string, unknown> }): Promise<{ count: number }>;
  };
  order: {
    create(args: {
      data: {
        buyerId: string;
        status: OrderStatus;
        currency: string;
        paymentMethod: string;
        subtotalCents: number;
        deliveryCents: number;
        totalCents: number;
        deliveryAddress: unknown;
        notes?: string;
        items: {
          create: Array<{
            artworkId: string;
            artistId: string;
            artistName: string;
            title: string;
            artworkSlug: string;
            ownerType: "artist" | "renewcanvas";
            kgDiverted: number;
            unitCents: number;
            quantity: number;
          }>;
        };
      };
      include: OrderInclude;
    }): Promise<OrderRecord>;
    findMany(args: { where: Record<string, unknown>; include: OrderInclude; orderBy: { createdAt: "desc" } }): Promise<OrderRecord[]>;
    findFirst(args: { where: Record<string, unknown>; include: OrderInclude }): Promise<OrderRecord | null>;
  };
  auditLog: {
    create(args: { data: { actorId: string; action: string; entity: string; entityId: string; metadata?: unknown } }): Promise<unknown>;
  };
};

const orderInclude = {
  buyer: { select: { id: true, name: true, email: true } },
  items: {
    include: {
      artwork: { select: { id: true, slug: true, images: { orderBy: { sortOrder: "asc" as const } } } },
    },
  },
} as const;

export async function createOrder(
  db: OrderDatabase,
  buyer: AuthPublicUser,
  input: {
    artworkId?: string;
    paymentMethod?: string;
    deliveryAddress?: Record<string, unknown>;
    notes?: string;
  }
) {
  if (buyer.role !== "buyer") {
    throw new AuthError("forbidden", "Only buyers can create orders.", 403);
  }

  const artworkId = cleanText(input.artworkId, 120);
  if (!artworkId) throw new AuthError("invalid_artwork", "Choose an artwork to order.", 400);

  const artwork = await db.artwork.findFirst({
    where: { id: artworkId, status: { in: ["listed", "approved"] } },
    include: { artist: { select: { id: true, name: true, email: true } } },
  });
  if (!artwork) throw new AuthError("artwork_unavailable", "This artwork is not available for checkout.", 409);

  const deliveryAddress = normalizeDeliveryAddress(input.deliveryAddress);
  const paymentMethod = normalizePaymentMethod(input.paymentMethod);

  const reserved = await db.artwork.updateMany({
    where: { id: artwork.id, status: { in: ["listed", "approved"] } },
    data: { status: "reserved" },
  });
  if (reserved.count !== 1) {
    throw new AuthError("artwork_unavailable", "This artwork was just reserved by another buyer.", 409);
  }

  try {
    const order = await db.order.create({
      data: {
        buyerId: buyer.id,
        status: "pending_payment",
        currency: artwork.currency,
        paymentMethod,
        subtotalCents: artwork.priceCents,
        deliveryCents: 0,
        totalCents: artwork.priceCents,
        deliveryAddress,
        notes: cleanText(input.notes, 500) ?? undefined,
        items: {
          create: [
            {
              artworkId: artwork.id,
              artistId: artwork.artistId,
              artistName: artwork.artist?.name ?? "RenewCanvas Africa",
              title: artwork.title,
              artworkSlug: artwork.slug,
              ownerType: artwork.ownerType,
              kgDiverted: decimalNumber(artwork.kgDiverted),
              unitCents: artwork.priceCents,
              quantity: 1,
            },
          ],
        },
      },
      include: orderInclude,
    });

    await db.auditLog.create({
      data: {
        actorId: buyer.id,
        action: "order.create",
        entity: "Order",
        entityId: order.id,
        metadata: { artworkId: artwork.id, paymentMethod },
      },
    });

    return order;
  } catch (error) {
    await db.artwork.updateMany({
      where: { id: artwork.id, status: "reserved", orderItems: { none: {} } },
      data: { status: "listed" },
    });
    throw error;
  }
}

export async function listOrders(db: OrderDatabase, user: AuthPublicUser) {
  const where =
    user.role === "admin"
      ? {}
      : user.role === "buyer"
      ? { buyerId: user.id }
      : { items: { some: { artistId: user.id } } };

  return db.order.findMany({ where, include: orderInclude, orderBy: { createdAt: "desc" } });
}

export async function getOrder(db: OrderDatabase, user: AuthPublicUser, orderId: string) {
  const where =
    user.role === "admin"
      ? { id: orderId }
      : user.role === "buyer"
      ? { id: orderId, buyerId: user.id }
      : { id: orderId, items: { some: { artistId: user.id } } };
  const order = await db.order.findFirst({ where, include: orderInclude });
  if (!order) throw new AuthError("order_not_found", "Order was not found.", 404);
  return order;
}

export function normalizeOrder(order: OrderRecord, viewerRole: AuthPublicUser["role"]) {
  const deliveryAddress = isRecord(order.deliveryAddress) ? order.deliveryAddress : {};
  return {
    id: order.id,
    buyerId: viewerRole === "artist" ? null : order.buyerId,
    status: order.status,
    currency: order.currency,
    paymentMethod: order.paymentMethod,
    subtotalAmount: order.subtotalCents / 100,
    deliveryAmount: order.deliveryCents / 100,
    totalAmount: order.totalCents / 100,
    deliveryAddress: viewerRole === "artist" ? null : deliveryAddress,
    notes: viewerRole === "artist" ? null : order.notes,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    buyer: viewerRole === "artist" ? null : order.buyer ?? null,
    items: (order.items ?? []).map((item) => ({
      id: item.id,
      artworkId: item.artworkId,
      artistId: item.artistId,
      artistName: item.artistName,
      title: item.title,
      artworkSlug: item.artworkSlug,
      ownerType: item.ownerType,
      kgDiverted: decimalNumber(item.kgDiverted),
      unitAmount: item.unitCents / 100,
      quantity: item.quantity,
      image: item.artwork?.images?.[0] ?? null,
    })),
  };
}

function normalizeDeliveryAddress(value: unknown) {
  const record = isRecord(value) ? value : {};
  const fullName = cleanText(record.fullName, 120);
  const email = cleanText(record.email, 160);
  const phone = cleanText(record.phone, 60);
  const address = cleanText(record.address, 240);
  const city = cleanText(record.city, 120);
  if (!fullName || !email || !phone || !address || !city) {
    throw new AuthError("invalid_delivery_address", "Delivery name, email, phone, address, and city are required.", 400);
  }
  return {
    fullName,
    email,
    phone,
    address,
    city,
  };
}

function normalizePaymentMethod(value: unknown) {
  return value === "bank" || value === "card" || value === "momo" ? value : "momo";
}

function cleanText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function decimalNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (value && typeof value === "object" && "toString" in value) return Number(value.toString());
  return Number(value) || 0;
}
