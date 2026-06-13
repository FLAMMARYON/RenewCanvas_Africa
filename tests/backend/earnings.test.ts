import assert from "node:assert/strict";
import test from "node:test";
import type { PrismaClient } from "@prisma/client";
import {
  getArtistEarnings,
  getPlatformConfirmedTotals,
  recordConfirmedOrderEarnings,
} from "@/lib/backend/earnings";

/**
 * Source-of-truth tests for EARNINGS.
 *
 * Money figures (artist dashboard "Estimated Earnings", analytics "Confirmed
 * Earnings", and the public impact page "Artist Earnings") all derive from the
 * confirmed-order running totals via getArtistEarnings / getPlatformConfirmedTotals
 * — an artist earns only when a payment is admin-confirmed (paid).
 *
 * (Waste-diverted is a SEPARATE, catalog metric — summed across every artwork
 * created, regardless of sale — so it is intentionally not tied to these.)
 */

type ProfileRow = { confirmedEarningsCents: number; confirmedKgDiverted: number };

function createDb(seed: {
  artistProfiles: Record<string, ProfileRow>;
  orders: Array<{ id: string; status: string; earningsRecorded: boolean }>;
  orderItems: Array<{
    orderId: string;
    artistId: string;
    ownerType: "artist" | "renewcanvas";
    unitCents: number;
    quantity: number;
    kgDiverted: number;
  }>;
}) {
  const artistProfiles = new Map(Object.entries(seed.artistProfiles));
  const orders = seed.orders.map((o) => ({ ...o }));
  const orderItems = seed.orderItems;

  return {
    order: {
      async updateMany({ where, data }: { where: Record<string, unknown>; data: Record<string, unknown> }) {
        let count = 0;
        for (const o of orders) {
          if (
            o.id === where.id &&
            o.status === where.status &&
            o.earningsRecorded === where.earningsRecorded
          ) {
            Object.assign(o, data);
            count += 1;
          }
        }
        return { count };
      },
    },
    orderItem: {
      async findMany({ where }: { where: { orderId: string } }) {
        return orderItems.filter((i) => i.orderId === where.orderId);
      },
    },
    artistProfile: {
      async findUnique({ where }: { where: { userId: string } }) {
        return artistProfiles.get(where.userId) ?? null;
      },
      async aggregate() {
        let cents = 0;
        let kg = 0;
        for (const p of artistProfiles.values()) {
          cents += p.confirmedEarningsCents;
          kg += p.confirmedKgDiverted;
        }
        return { _sum: { confirmedEarningsCents: cents, confirmedKgDiverted: kg } };
      },
      async update({ where, data }: { where: { userId: string }; data: Record<string, unknown> }) {
        const row = artistProfiles.get(where.userId);
        if (!row) throw new Error("profile not found");
        for (const [key, value] of Object.entries(data)) {
          if (value && typeof value === "object" && "increment" in (value as object)) {
            (row as Record<string, number>)[key] =
              Number((row as Record<string, number>)[key]) + Number((value as { increment: unknown }).increment);
          } else {
            (row as Record<string, unknown>)[key] = value;
          }
        }
        return row;
      },
    },
  };
}

test("artist + platform earnings come from confirmed (paid) orders only", async () => {
  const db = createDb({
    artistProfiles: {
      artist_1: { confirmedEarningsCents: 0, confirmedKgDiverted: 0 },
      artist_2: { confirmedEarningsCents: 0, confirmedKgDiverted: 0 },
    },
    orders: [
      { id: "order_paid", status: "paid", earningsRecorded: false },
      { id: "order_pending", status: "pending_payment", earningsRecorded: false },
    ],
    orderItems: [
      { orderId: "order_paid", artistId: "artist_1", ownerType: "artist", unitCents: 50000, quantity: 1, kgDiverted: 2.5 },
      // A pending order must NOT contribute to earnings.
      { orderId: "order_pending", artistId: "artist_2", ownerType: "artist", unitCents: 80000, quantity: 1, kgDiverted: 4 },
    ],
  }) as unknown as PrismaClient;

  // Only the paid order is recorded; the pending one is ignored.
  await recordConfirmedOrderEarnings(db, "order_paid");
  await recordConfirmedOrderEarnings(db, "order_pending");

  // Per-artist earnings (dashboard + analytics read this exact function).
  const a1 = await getArtistEarnings(db, "artist_1");
  assert.equal(a1.earningsRwf, 400); // 80% of 50,000 cents = 40,000 cents = 400 RWF
  const a2 = await getArtistEarnings(db, "artist_2");
  assert.equal(a2.earningsRwf, 0); // pending order earns nothing

  // Platform earnings (public impact page) = sum of the same confirmed totals.
  const platform = await getPlatformConfirmedTotals(db);
  assert.equal(platform.artistEarningsRwf, 400);

  // Idempotent: re-confirming the paid order does not double-count.
  await recordConfirmedOrderEarnings(db, "order_paid");
  assert.equal((await getArtistEarnings(db, "artist_1")).earningsRwf, 400);
});
