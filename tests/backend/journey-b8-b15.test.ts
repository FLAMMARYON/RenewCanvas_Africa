import assert from "node:assert/strict";
import test from "node:test";
import type { AuthPublicUser } from "@/lib/backend/auth";
import { placeBid, scheduleAuction, type AuctionDatabase, type AuctionRecord, type AuctionBidRecord } from "@/lib/backend/auctions";
import { createShipmentForPaidOrder, updateShipmentStatus, type FulfillmentDatabase, type ShipmentRecord } from "@/lib/backend/fulfillment";
import { dispatchQueuedNotifications, queueNotification, type NotificationDatabase, type NotificationRecord } from "@/lib/backend/notifications";
import { createPaymentSession, reconcilePaymentWebhook, type PaymentDatabase, type PaymentTransactionRecord } from "@/lib/backend/payments";
import { createPayoutsForDeliveredOrder, markPayout, type PayoutDatabase, type PayoutLedgerRecord } from "@/lib/backend/payouts";
import { getSharedVirtualRoom, saveVirtualRoom, type VirtualRoomDatabase, type VirtualRoomRecord } from "@/lib/backend/virtual-room";

const buyer: AuthPublicUser = { id: "buyer_1", email: "buyer@example.com", name: "Buyer", role: "buyer", status: "active" };
const artist: AuthPublicUser = { id: "artist_1", email: "artist@example.com", name: "Artist", role: "artist", status: "active" };
const admin: AuthPublicUser = { id: "admin_1", email: "admin@example.com", name: "Admin", role: "admin", status: "active" };
const now = new Date("2026-05-14T10:00:00.000Z");

test("payment sessions are idempotent and paid webhooks update order inventory", async () => {
  const db = createPaymentDb();
  const first = await createPaymentSession(db, buyer, { orderId: "order_1", provider: "mtn_momo", idempotencyKey: "pay_once" });
  const second = await createPaymentSession(db, buyer, { orderId: "order_1", provider: "mtn_momo", idempotencyKey: "pay_once" });

  assert.equal(first.id, second.id);
  assert.equal(first.ussdReference, "RCRDER_1");

  const result = await reconcilePaymentWebhook(db, {
    provider: "mtn_momo",
    providerReference: first.providerReference ?? "",
    webhookEventId: "evt_1",
    status: "paid",
    now,
  });

  assert.equal(result.payment.status, "paid");
  assert.equal(db.orderRecord.status, "paid");
  assert.equal(db.artworkStatus, "sold");
  assert.equal((await reconcilePaymentWebhook(db, { provider: "mtn_momo", providerReference: first.providerReference ?? "", webhookEventId: "evt_1", status: "paid" })).duplicate, true);
});

test("shipments move paid orders through fulfillment states", async () => {
  const db = createFulfillmentDb();
  const shipment = await createShipmentForPaidOrder(db, admin, "order_1", now);
  assert.equal(shipment.status, "preparing");
  assert.equal(db.orderRecord.status, "processing");

  const delivered = await updateShipmentStatus(db, admin, "shipment_1", { status: "delivered", carrier: "RenewCanvas Courier" }, now);
  assert.equal(delivered.status, "delivered");
  assert.equal(db.orderRecord.status, "delivered");
});

test("payouts exclude platform inventory and enforce the 48 hour return window", async () => {
  const db = createPayoutDb();
  const payouts = await createPayoutsForDeliveredOrder(db, admin, "order_1", now);
  assert.equal(payouts.length, 1);
  assert.equal(payouts[0].artistId, artist.id);
  await assert.rejects(() => markPayout(db, admin, "payout_1", "paid", now), /return window/);

  const paid = await markPayout(db, admin, "payout_1", "paid", new Date(now.getTime() + 1000 * 60 * 60 * 49));
  assert.equal(paid.status, "paid");
});

test("notification preferences skip disabled channels", async () => {
  const db = createNotificationDb();
  const notification = await queueNotification(db, {
    userId: buyer.id,
    channel: "sms",
    templateKey: "order.paid",
    body: "Your order is paid.",
    category: "orderUpdates",
  });
  assert.equal(notification.status, "skipped");
});

test("queued notifications dispatch through configured provider", async () => {
  const db = createNotificationDb({ smsEnabled: true });
  await queueNotification(db, {
    userId: buyer.id,
    channel: "sms",
    templateKey: "order.paid",
    body: "Your order is paid.",
    category: "orderUpdates",
  });
  const dispatched = await dispatchQueuedNotifications(db, {
    provider: {
      async send(input) {
        assert.equal(input.to, "+250788000000");
        return { status: "sent", providerReference: "SM123" };
      },
    },
    now,
  });

  assert.equal(dispatched[0].status, "sent");
  assert.equal(dispatched[0].sentAt, now.toISOString());
});

test("auctions validate increments and record winning bid", async () => {
  const db = createAuctionDb();
  const auction = await scheduleAuction(db, admin, { artworkId: "artwork_1", startsAt: now, endsAt: new Date(now.getTime() + 100000), startingBidCents: 10000 }, now);
  const bid = await placeBid(db, buyer, auction.id, 10000, now);
  assert.equal(bid.status, "winning");
  await assert.rejects(() => placeBid(db, buyer, auction.id, 10001, now), /at least/);
});

test("virtual room saves can be shared by token", async () => {
  const db = createVirtualRoomDb();
  const saved = await saveVirtualRoom(db, buyer, { name: "Gallery", isPublic: true, roomState: { wall: "north" }, viewedArtworkIds: ["artwork_1"] });
  assert.ok(saved.shareToken);
  const shared = await getSharedVirtualRoom(db, saved.shareToken ?? "");
  assert.equal(shared?.name, "Gallery");
});

function createPaymentDb(): PaymentDatabase & { orderRecord: { status: string }; artworkStatus: string } {
  const transactions: PaymentTransactionRecord[] = [];
  const orderRecord = { id: "order_1", buyerId: buyer.id, status: "pending_payment", totalCents: 10000, currency: "RWF", paymentMethod: "momo" };
  const db = {
    orderRecord,
    artworkStatus: "reserved",
    order: {
      async findFirst() {
        return orderRecord;
      },
      async update(args: { data: { status?: string } }) {
        orderRecord.status = args.data.status ?? orderRecord.status;
        return orderRecord;
      },
    },
    paymentTransaction: {
      async findUnique(args: { where: { idempotencyKey?: string; webhookEventId?: string } }) {
        return transactions.find((item) => item.idempotencyKey === args.where.idempotencyKey || item.webhookEventId === args.where.webhookEventId) ?? null;
      },
      async create(args: { data: Record<string, unknown> }) {
        const transaction = paymentRecord({ id: `payment_${transactions.length + 1}`, providerReference: "rc-order_1-1", ...args.data });
        transactions.push(transaction);
        return transaction;
      },
      async update(args: { where: { id: string }; data: Record<string, unknown> }) {
        const transaction = transactions.find((item) => item.id === args.where.id);
        if (!transaction) throw new Error("missing transaction");
        Object.assign(transaction, args.data);
        return transaction;
      },
      async findFirst(args: { where: { providerReference?: unknown } }) {
        return transactions.find((item) => item.providerReference === args.where.providerReference) ?? null;
      },
      async findMany() {
        return transactions;
      },
    },
    artwork: {
      async updateMany(args: { data: { status?: string } }) {
        db.artworkStatus = args.data.status ?? db.artworkStatus;
        return { count: 1 };
      },
    },
    auditLog: { async create() { return {}; } },
  };
  return db;
}

function paymentRecord(data: Record<string, unknown>): PaymentTransactionRecord {
  return {
    id: String(data.id),
    orderId: String(data.orderId),
    buyerId: String(data.buyerId),
    provider: data.provider === "mtn_momo" ? "mtn_momo" : "manual_bank",
    status: data.status === "requires_action" || data.status === "paid" || data.status === "failed" ? data.status : "pending",
    amountCents: Number(data.amountCents),
    currency: String(data.currency),
    providerReference: String(data.providerReference),
    providerCheckoutUrl: null,
    momoPhone: null,
    ussdReference: typeof data.ussdReference === "string" ? data.ussdReference : null,
    idempotencyKey: String(data.idempotencyKey),
    webhookEventId: typeof data.webhookEventId === "string" ? data.webhookEventId : null,
    failureReason: null,
    paidAt: data.paidAt instanceof Date ? data.paidAt : null,
    createdAt: now,
    updatedAt: now,
  };
}

function createFulfillmentDb(): FulfillmentDatabase & { orderRecord: { status: string } } {
  const orderRecord = { id: "order_1", buyerId: buyer.id, status: "paid", deliveryAddress: { city: "Kigali" }, deliveryCents: 0 };
  const shipments: ShipmentRecord[] = [];
  return {
    orderRecord,
    order: {
      async findFirst() { return orderRecord; },
      async update(args: { data: { status?: string } }) {
        orderRecord.status = args.data.status ?? orderRecord.status;
        return orderRecord;
      },
    },
    shipment: {
      async findUnique() { return shipments[0] ?? null; },
      async create() {
        const shipment: ShipmentRecord = { id: "shipment_1", orderId: "order_1", buyerId: buyer.id, status: "preparing", carrier: null, trackingNumber: null, deliveryAddress: {}, deliveryFeeCents: 0, artistPrepDueAt: now, shippedAt: null, deliveredAt: null, createdAt: now, updatedAt: now };
        shipments.push(shipment);
        return shipment;
      },
      async update(args: { where: { id: string }; data: Partial<ShipmentRecord> }) {
        const shipment = shipments.find((item) => item.id === args.where.id);
        if (!shipment) throw new Error("missing shipment");
        Object.assign(shipment, args.data);
        return shipment;
      },
      async findFirst() { return shipments[0] ?? null; },
      async findMany() { return shipments; },
    },
    auditLog: { async create() { return {}; } },
  };
}

function createPayoutDb(): PayoutDatabase {
  const payouts: PayoutLedgerRecord[] = [];
  return {
    order: {
      async findFirst() {
        return {
          id: "order_1",
          status: "delivered",
          currency: "RWF",
          items: [
            { id: "item_1", orderId: "order_1", artistId: artist.id, ownerType: "artist", unitCents: 10000, quantity: 1 },
            { id: "item_2", orderId: "order_1", artistId: admin.id, ownerType: "renewcanvas", unitCents: 10000, quantity: 1 },
          ],
        };
      },
    },
    payoutLedger: {
      async findFirst(args: { where: { id?: unknown; orderItemId?: unknown } }) {
        return payouts.find((item) => item.id === args.where.id || item.orderItemId === args.where.orderItemId) ?? null;
      },
      async create(args: { data: Record<string, unknown> }) {
        const payout: PayoutLedgerRecord = { id: "payout_1", orderId: String(args.data.orderId), orderItemId: String(args.data.orderItemId), artistId: String(args.data.artistId), status: "pending", grossCents: 10000, platformFeeCents: 2000, deliveryCostCents: 0, payoutCents: 8000, currency: "RWF", eligibleAt: args.data.eligibleAt as Date, approvedAt: null, paidAt: null, failedAt: null, failureReason: null, providerReference: null, createdAt: now, updatedAt: now };
        payouts.push(payout);
        return payout;
      },
      async update(args: { where: { id: string }; data: Partial<PayoutLedgerRecord> }) {
        const payout = payouts.find((item) => item.id === args.where.id);
        if (!payout) throw new Error("missing payout");
        Object.assign(payout, args.data);
        return payout;
      },
      async findMany() { return payouts; },
    },
    returnRequest: { async findFirst() { return null; } },
    auditLog: { async create() { return {}; } },
  };
}

function createNotificationDb(preferenceOverrides: Record<string, unknown> = {}): NotificationDatabase {
  const records: NotificationRecord[] = [];
  return {
    notificationPreference: {
      async findUnique() { return { userId: buyer.id, emailEnabled: true, smsEnabled: false, orderUpdates: true, ...preferenceOverrides }; },
      async upsert(args) { return args.create; },
    },
    notification: {
      async create(args: { data: Record<string, unknown> }) {
        const record: NotificationRecord = { id: "notification_1", userId: String(args.data.userId), channel: "sms", status: args.data.status === "skipped" ? "skipped" : "queued", templateKey: String(args.data.templateKey), subject: null, body: String(args.data.body), metadata: null, errorMessage: null, sentAt: null, createdAt: now, updatedAt: now, user: { email: buyer.email, buyerProfile: { phone: "+250788000000" } } };
        records.push(record);
        return record;
      },
      async update(args: { where: { id: string }; data: Partial<NotificationRecord> }) {
        const record = records.find((item) => item.id === args.where.id);
        if (!record) throw new Error("missing notification");
        Object.assign(record, args.data);
        return record;
      },
      async findMany(args: { where?: { status?: string } }) {
        return args.where?.status ? records.filter((record) => record.status === args.where?.status) : records;
      },
    },
  };
}

function createAuctionDb(): AuctionDatabase {
  const auctions: AuctionRecord[] = [];
  const bids: AuctionBidRecord[] = [];
  return {
    artwork: { async findFirst() { return { id: "artwork_1", title: "Auction Work", status: "listed", currency: "RWF" }; } },
    auction: {
      async create(args: { data: Record<string, unknown> }) {
        const auction: AuctionRecord = { id: "auction_1", artworkId: String(args.data.artworkId), status: "live", title: "Auction Work", startsAt: args.data.startsAt as Date, endsAt: args.data.endsAt as Date, startingBidCents: Number(args.data.startingBidCents), reserveCents: null, minIncrementCents: 1000, currency: "RWF", winnerBidId: null, bids, createdAt: now, updatedAt: now };
        auctions.push(auction);
        return auction;
      },
      async findFirst() { return auctions[0] ?? null; },
      async update(args: { data: Partial<AuctionRecord> }) {
        Object.assign(auctions[0], args.data);
        return auctions[0];
      },
      async findMany() { return auctions; },
    },
    auctionBid: {
      async create(args: { data: Record<string, unknown> }) {
        const bid: AuctionBidRecord = { id: `bid_${bids.length + 1}`, auctionId: String(args.data.auctionId), bidderId: String(args.data.bidderId), amountCents: Number(args.data.amountCents), status: "winning", createdAt: now };
        bids.push(bid);
        return bid;
      },
      async updateMany() { return { count: 1 }; },
      async findFirst() { return bids.toSorted((a, b) => b.amountCents - a.amountCents)[0] ?? null; },
    },
    auditLog: { async create() { return {}; } },
  };
}

function createVirtualRoomDb(): VirtualRoomDatabase {
  const rooms: VirtualRoomRecord[] = [];
  return {
    virtualRoomState: {
      async create(args: { data: Record<string, unknown> }) {
        const room: VirtualRoomRecord = { id: "room_1", userId: String(args.data.userId), name: String(args.data.name), isPublic: args.data.isPublic === true, shareToken: String(args.data.shareToken), roomState: args.data.roomState, viewedArtworkIds: args.data.viewedArtworkIds as string[], createdAt: now, updatedAt: now };
        rooms.push(room);
        return room;
      },
      async update(args: { where: { id: string }; data: Partial<VirtualRoomRecord> }) {
        const room = rooms.find((item) => item.id === args.where.id);
        if (!room) throw new Error("missing room");
        Object.assign(room, args.data);
        return room;
      },
      async findFirst(args: { where: { shareToken?: unknown; isPublic?: unknown } }) {
        return rooms.find((item) => item.shareToken === args.where.shareToken && item.isPublic === args.where.isPublic) ?? null;
      },
      async findMany() { return rooms; },
    },
    artwork: { async findMany() { return []; } },
  };
}
