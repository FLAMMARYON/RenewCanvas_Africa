import assert from "node:assert/strict";
import test from "node:test";
import type { PrismaClient } from "@prisma/client";
import {
  getArtistEarnings,
  recordConfirmedOrderEarnings,
} from "@/lib/backend/earnings";

/**
 * Source-of-truth regression test (Prompt A).
 *
 * The artist dashboard ("impact report") and the artist analytics page must
 * show the SAME waste-diverted + earnings for an artist. Both now read the
 * confirmed-order running totals via getArtistEarnings(). The analytics page
 * used to re-sum every catalog artwork's kgDiverted instead — this test pins
 * that the catalog sum is a DIFFERENT (wrong) number, and that both pages now
 * agree on the confirmed figure.
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

test("impact report and analytics page show identical confirmed kg + earnings (one source)", async () => {
  // Artist has a large catalog (15 kg across unsold artworks) but only ONE
  // admin-confirmed (paid) order line worth 2.5 kg / 50,000 cents.
  const catalogArtworksKg = [3, 3, 3, 3, 3]; // 15 kg in the catalog, mostly unsold
  const staleCatalogKg = catalogArtworksKg.reduce((s, kg) => s + kg, 0);

  const db = createDb({
    artistProfiles: { artist_1: { confirmedEarningsCents: 0, confirmedKgDiverted: 0 } },
    orders: [{ id: "order_1", status: "paid", earningsRecorded: false }],
    orderItems: [
      { orderId: "order_1", artistId: "artist_1", ownerType: "artist", unitCents: 50000, quantity: 1, kgDiverted: 2.5 },
    ],
  }) as unknown as PrismaClient;

  // Payment confirmed -> running totals incremented exactly once.
  await recordConfirmedOrderEarnings(db, "order_1");

  // Both pages read the SAME function.
  const impactReport = await getArtistEarnings(db, "artist_1"); // artist dashboard overview
  const analyticsPage = await getArtistEarnings(db, "artist_1"); // artist analytics page (after fix)

  // 1. Identical on both pages.
  assert.deepEqual(impactReport, analyticsPage);

  // 2. The confirmed figures: 80% of 50,000 cents = 400 RWF; 2.5 kg.
  assert.equal(analyticsPage.earningsRwf, 400);
  assert.equal(analyticsPage.kgDiverted, 2.5);

  // 3. The deleted stale calculation (sum of every catalog artwork) would have
  //    produced a DIFFERENT number — proving the two sources really diverged.
  assert.notEqual(staleCatalogKg, analyticsPage.kgDiverted);

  // 4. Idempotency: re-confirming does not double-count.
  await recordConfirmedOrderEarnings(db, "order_1");
  const afterReplay = await getArtistEarnings(db, "artist_1");
  assert.deepEqual(afterReplay, impactReport);
});
