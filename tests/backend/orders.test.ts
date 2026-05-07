import assert from "node:assert/strict";
import test from "node:test";
import { createOrder, listOrders, normalizeOrder, type OrderArtworkRecord, type OrderDatabase, type OrderRecord } from "@/lib/backend/orders";
import type { AuthPublicUser } from "@/lib/backend/auth";

const buyer: AuthPublicUser = { id: "buyer_1", email: "buyer@example.com", name: "Buyer", role: "buyer", status: "active" };
const artist: AuthPublicUser = { id: "artist_1", email: "artist@example.com", name: "Artist", role: "artist", status: "active" };
const admin: AuthPublicUser = { id: "admin_1", email: "hello.renewcanvas.africa@gmail.com", name: "Admin", role: "admin", status: "active" };

test("buyer order creation snapshots item data and reserves listed artwork", async () => {
  const db = createMemoryOrderDatabase();
  const order = await createOrder(db, buyer, validOrderInput());

  assert.equal(order.status, "pending_payment");
  assert.equal(order.items?.[0]?.title, "Ocean Waves");
  assert.equal(order.items?.[0]?.artistId, artist.id);
  assert.equal(db.artworks[0].status, "reserved");
  assert.equal(db.auditLogs[0].action, "order.create");
});

test("reserved artwork cannot be ordered twice", async () => {
  const db = createMemoryOrderDatabase();
  await createOrder(db, buyer, validOrderInput());
  await assert.rejects(() => createOrder(db, buyer, validOrderInput()), /not available|reserved/);
});

test("order listing is scoped by buyer artist and admin", async () => {
  const db = createMemoryOrderDatabase();
  const order = await createOrder(db, buyer, validOrderInput());

  assert.deepEqual((await listOrders(db, buyer)).map((item) => item.id), [order.id]);
  assert.deepEqual((await listOrders(db, artist)).map((item) => item.id), [order.id]);
  assert.deepEqual((await listOrders(db, admin)).map((item) => item.id), [order.id]);
  assert.equal(normalizeOrder(order, "artist").buyer, null);
  assert.equal(normalizeOrder(order, "artist").deliveryAddress, null);
});

function validOrderInput() {
  return {
    artworkId: "artwork_1",
    paymentMethod: "momo",
    deliveryAddress: {
      fullName: "Amina Buyer",
      email: "buyer@example.com",
      phone: "+250 788 111 222",
      address: "KG 1 Ave",
      city: "Kigali",
    },
  };
}

function createMemoryOrderDatabase(): OrderDatabase & {
  artworks: OrderArtworkRecord[];
  auditLogs: Array<{ action: string }>;
} {
  const artworks: OrderArtworkRecord[] = [
    {
      id: "artwork_1",
      artistId: artist.id,
      slug: "ocean-waves",
      title: "Ocean Waves",
      status: "listed",
      ownerType: "artist",
      priceCents: 4200000,
      currency: "RWF",
      kgDiverted: 2.5,
      artist,
    },
  ];
  const orders: OrderRecord[] = [];
  const auditLogs: Array<{ action: string }> = [];
  const now = new Date();

  return {
    artworks,
    auditLogs,
    artwork: {
      async findFirst(args) {
        return artworks.find((artwork) => artwork.id === args.where.id && artwork.status === args.where.status) ?? null;
      },
      async updateMany(args) {
        const matching = artworks.filter((artwork) => artwork.id === args.where.id && artwork.status === args.where.status);
        for (const artwork of matching) Object.assign(artwork, args.data);
        return { count: matching.length };
      },
    },
    order: {
      async create(args) {
        const order: OrderRecord = {
          id: `order_${orders.length + 1}`,
          buyerId: args.data.buyerId,
          status: args.data.status,
          currency: args.data.currency,
          paymentMethod: args.data.paymentMethod,
          subtotalCents: args.data.subtotalCents,
          deliveryCents: args.data.deliveryCents,
          totalCents: args.data.totalCents,
          deliveryAddress: args.data.deliveryAddress,
          notes: args.data.notes ?? null,
          createdAt: now,
          updatedAt: now,
          buyer,
          items: args.data.items.create.map((item, index) => ({
            id: `item_${index + 1}`,
            orderId: `order_${orders.length + 1}`,
            createdAt: now,
            artwork: { id: item.artworkId, slug: item.artworkSlug, images: [] },
            ...item,
          })),
        };
        orders.push(order);
        return order;
      },
      async findMany(args) {
        if (args.where.buyerId) return orders.filter((order) => order.buyerId === args.where.buyerId);
        const artistId = (args.where.items as { some?: { artistId?: string } } | undefined)?.some?.artistId;
        if (artistId) return orders.filter((order) => order.items?.some((item) => item.artistId === artistId));
        return orders;
      },
      async findFirst(args) {
        return orders.find((order) => order.id === args.where.id) ?? null;
      },
    },
    auditLog: {
      async create(args) {
        auditLogs.push({ action: args.data.action });
        return args.data;
      },
    },
  };
}
