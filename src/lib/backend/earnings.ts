import { Prisma, type PrismaClient } from "@prisma/client";

/**
 * Artist earnings & impact — single source of truth.
 *
 * Earnings and kg-of-waste-diverted are counted ONLY from admin-confirmed
 * (paid) orders. The artist keeps an 80% share of the confirmed sale price; the
 * rest covers platform fees, payment processing, and operations.
 *
 * Totals are stored as running totals on ArtistProfile and incremented exactly
 * once per order when its payment is confirmed (guarded by Order.earningsRecorded
 * so a webhook + a status poll can't double-count). Reads come straight from the
 * stored totals — they are never recomputed on page load.
 */

export const ARTIST_SHARE = 0.8;

/** The artist's share (80%) of a line total, in cents. */
export function artistShareCents(unitCents: number, quantity: number): number {
  return Math.round(unitCents * quantity * ARTIST_SHARE);
}

/**
 * Idempotently add a newly-confirmed order's earnings + kg to each artist's
 * running totals. No-op unless the order is `paid` and not yet recorded.
 */
export async function recordConfirmedOrderEarnings(db: PrismaClient, orderId: string): Promise<void> {
  // Atomically claim this order so concurrent confirmations can't double-count.
  const claim = await db.order.updateMany({
    where: { id: orderId, status: "paid", earningsRecorded: false },
    data: { earningsRecorded: true },
  });
  if (claim.count !== 1) return;

  const items = await db.orderItem.findMany({ where: { orderId } });

  const byArtist = new Map<string, { cents: number; kg: number }>();
  for (const item of items) {
    if (item.ownerType !== "artist") continue; // RenewCanvas-owned: no artist payout
    const acc = byArtist.get(item.artistId) ?? { cents: 0, kg: 0 };
    acc.cents += artistShareCents(item.unitCents, item.quantity);
    acc.kg += Number(item.kgDiverted) * item.quantity;
    byArtist.set(item.artistId, acc);
  }

  for (const [artistId, totals] of byArtist) {
    try {
      await db.artistProfile.update({
        where: { userId: artistId },
        data: {
          confirmedEarningsCents: { increment: totals.cents },
          confirmedKgDiverted: { increment: new Prisma.Decimal(totals.kg) },
        },
      });
    } catch (error) {
      // Artist may not have a profile row yet; never block payment confirmation.
      console.error("recordConfirmedOrderEarnings: artist profile update failed", { artistId, error });
    }
  }
}

export type ArtistEarnings = { earningsRwf: number; kgDiverted: number };

/** Read an artist's stored confirmed earnings + kg (no recomputation). */
export async function getArtistEarnings(db: PrismaClient, artistId: string): Promise<ArtistEarnings> {
  const profile = await db.artistProfile.findUnique({
    where: { userId: artistId },
    select: { confirmedEarningsCents: true, confirmedKgDiverted: true },
  });
  return {
    earningsRwf: Math.round((profile?.confirmedEarningsCents ?? 0) / 100),
    kgDiverted: Number(profile?.confirmedKgDiverted ?? 0),
  };
}
