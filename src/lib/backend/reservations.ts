import type { PrismaClient } from "@prisma/client";

/**
 * Reservation lifecycle.
 *
 * When a buyer places an order the artwork is set to `reserved` with a
 * `reservedAt` timestamp and hidden from the marketplace + gallery. The
 * reservation holds for RESERVATION_WINDOW_MS (30 minutes):
 *   - admin confirms payment within the window → artwork becomes `sold`;
 *   - otherwise the reservation auto-cancels → order `cancelled`, artwork back
 *     to `listed` (and reappears on the marketplace + gallery).
 *
 * Auto-cancel runs two ways:
 *   1. A Vercel cron (`/api/cron/expire-reservations`) on a short cadence.
 *   2. A lazy safety check (`expireStaleReservations`) run on every
 *      marketplace / gallery / artwork read, so stale reservations never display
 *      even before the cron fires.
 */
export const RESERVATION_WINDOW_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Find reservations older than the 30-minute window, cancel their pending
 * orders, and return the artworks to `listed`. Idempotent and cheap when nothing
 * is stale (a single indexed lookup). Returns the count + ids of artworks freed.
 */
export async function expireStaleReservations(
  db: PrismaClient,
  now: Date = new Date()
): Promise<{ expired: number; artworkIds: string[] }> {
  const cutoff = new Date(now.getTime() - RESERVATION_WINDOW_MS);

  const stale = await db.artwork.findMany({
    where: { status: "reserved", reservedAt: { lt: cutoff } },
    select: { id: true },
  });
  if (stale.length === 0) return { expired: 0, artworkIds: [] };

  const artworkIds = stale.map((artwork) => artwork.id);

  // Cancel the still-pending orders that reserved these artworks.
  await db.order.updateMany({
    where: { status: "pending_payment", items: { some: { artworkId: { in: artworkIds } } } },
    data: { status: "cancelled" },
  });

  // Return the artworks to the marketplace + gallery.
  await db.artwork.updateMany({
    where: { id: { in: artworkIds }, status: "reserved" },
    data: { status: "listed", reservedAt: null },
  });

  return { expired: artworkIds.length, artworkIds };
}
