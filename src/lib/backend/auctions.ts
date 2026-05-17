import { AuthError, type AuthPublicUser } from "./auth";

export type AuctionStatus = "draft" | "scheduled" | "live" | "ended" | "cancelled" | "settled";
export type BidStatus = "active" | "outbid" | "winning" | "rejected" | "cancelled";

export type AuctionRecord = {
  id: string;
  artworkId: string;
  status: AuctionStatus;
  title: string;
  startsAt: Date;
  endsAt: Date;
  startingBidCents: number;
  reserveCents: number | null;
  minIncrementCents: number;
  currency: string;
  winnerBidId: string | null;
  bids?: AuctionBidRecord[];
  createdAt: Date;
  updatedAt: Date;
};

export type AuctionBidRecord = {
  id: string;
  auctionId: string;
  bidderId: string;
  amountCents: number;
  status: BidStatus;
  createdAt: Date;
};

export type AuctionDatabase = {
  artwork: { findFirst(args: { where: Record<string, unknown> }): Promise<{ id: string; title: string; status: string; currency: string } | null> };
  auction: {
    create(args: { data: Record<string, unknown>; include?: unknown }): Promise<AuctionRecord>;
    findFirst(args: { where: Record<string, unknown>; include?: unknown; orderBy?: unknown }): Promise<AuctionRecord | null>;
    update(args: { where: { id: string }; data: Record<string, unknown>; include?: unknown }): Promise<AuctionRecord>;
    findMany(args: { where: Record<string, unknown>; include?: unknown; orderBy: { startsAt: "asc" } }): Promise<AuctionRecord[]>;
  };
  auctionBid: {
    create(args: { data: Record<string, unknown> }): Promise<AuctionBidRecord>;
    updateMany(args: { where: Record<string, unknown>; data: Record<string, unknown> }): Promise<{ count: number }>;
    findFirst(args: { where: Record<string, unknown>; orderBy: { amountCents: "desc" } }): Promise<AuctionBidRecord | null>;
  };
  auditLog: { create(args: { data: { actorId?: string; action: string; entity: string; entityId: string; metadata?: unknown } }): Promise<unknown> };
};

export async function scheduleAuction(
  db: AuctionDatabase,
  admin: AuthPublicUser,
  input: { artworkId?: string; startsAt?: Date; endsAt?: Date; startingBidCents?: number; reserveCents?: number; minIncrementCents?: number },
  now = new Date()
) {
  if (admin.role !== "admin") throw new AuthError("forbidden", "Only admins can schedule auctions.", 403);
  const artworkId = cleanText(input.artworkId, 120);
  if (!artworkId) throw new AuthError("invalid_artwork", "Artwork is required.", 400);
  const artwork = await db.artwork.findFirst({ where: { id: artworkId, status: { in: ["approved", "listed"] } } });
  if (!artwork) throw new AuthError("artwork_not_found", "Auction artwork must be approved or listed.", 404);
  const startsAt = input.startsAt ?? now;
  const endsAt = input.endsAt ?? new Date(startsAt.getTime() + 1000 * 60 * 60 * 24);
  if (endsAt <= startsAt) throw new AuthError("invalid_auction_window", "Auction end must be after start.", 400);
  const auction = await db.auction.create({
    data: {
      artworkId,
      title: artwork.title,
      status: startsAt <= now ? "live" : "scheduled",
      startsAt,
      endsAt,
      startingBidCents: positiveCents(input.startingBidCents, 1000),
      reserveCents: input.reserveCents,
      minIncrementCents: positiveCents(input.minIncrementCents, 1000),
      currency: artwork.currency,
    },
    include: { bids: true },
  });
  await db.auditLog.create({ data: { actorId: admin.id, action: "auction.schedule", entity: "Auction", entityId: auction.id } });
  return normalizeAuction(auction);
}

export async function placeBid(db: AuctionDatabase, bidder: AuthPublicUser, auctionId: string, amountCents: number, now = new Date()) {
  if (bidder.role !== "buyer") throw new AuthError("forbidden", "Only buyers can bid.", 403);
  const auction = await db.auction.findFirst({ where: { id: auctionId }, include: { bids: true } });
  if (!auction || auction.status !== "live" || auction.startsAt > now || auction.endsAt <= now) {
    throw new AuthError("auction_not_live", "Auction is not accepting bids.", 409);
  }
  const topBid = await db.auctionBid.findFirst({ where: { auctionId, status: { in: ["active", "winning"] } }, orderBy: { amountCents: "desc" } });
  const minimum = topBid ? topBid.amountCents + auction.minIncrementCents : auction.startingBidCents;
  if (amountCents < minimum) throw new AuthError("bid_too_low", `Bid must be at least ${minimum}.`, 400);
  await db.auctionBid.updateMany({ where: { auctionId, status: "winning" }, data: { status: "outbid" } });
  const bid = await db.auctionBid.create({ data: { auctionId, bidderId: bidder.id, amountCents, status: "winning" } });
  await db.auditLog.create({ data: { actorId: bidder.id, action: "auction.bid", entity: "AuctionBid", entityId: bid.id, metadata: { auctionId } } });
  return normalizeBid(bid);
}

export async function closeAuction(db: AuctionDatabase, admin: AuthPublicUser, auctionId: string, now = new Date()) {
  if (admin.role !== "admin") throw new AuthError("forbidden", "Only admins can close auctions.", 403);
  const auction = await db.auction.findFirst({ where: { id: auctionId }, include: { bids: true } });
  if (!auction) throw new AuthError("auction_not_found", "Auction was not found.", 404);
  const topBid = await db.auctionBid.findFirst({ where: { auctionId, status: "winning" }, orderBy: { amountCents: "desc" } });
  const hasMetReserve = !auction.reserveCents || (topBid?.amountCents ?? 0) >= auction.reserveCents;
  const updated = await db.auction.update({
    where: { id: auction.id },
    data: { status: hasMetReserve && topBid ? "ended" : "cancelled", winnerBidId: hasMetReserve ? topBid?.id ?? null : null, endsAt: now },
    include: { bids: true },
  });
  await db.auditLog.create({ data: { actorId: admin.id, action: "auction.close", entity: "Auction", entityId: auction.id } });
  return normalizeAuction(updated);
}

export async function listAuctions(db: AuctionDatabase) {
  return (await db.auction.findMany({ where: {}, include: { bids: true }, orderBy: { startsAt: "asc" } })).map(normalizeAuction);
}

export function normalizeAuction(auction: AuctionRecord) {
  return {
    id: auction.id,
    artworkId: auction.artworkId,
    status: auction.status,
    title: auction.title,
    startsAt: auction.startsAt.toISOString(),
    endsAt: auction.endsAt.toISOString(),
    startingBidAmount: auction.startingBidCents / 100,
    reserveAmount: auction.reserveCents === null ? null : auction.reserveCents / 100,
    minIncrementAmount: auction.minIncrementCents / 100,
    currency: auction.currency,
    winnerBidId: auction.winnerBidId,
    bids: (auction.bids ?? []).map(normalizeBid),
  };
}

function normalizeBid(bid: AuctionBidRecord) {
  return { id: bid.id, auctionId: bid.auctionId, bidderId: bid.bidderId, amount: bid.amountCents / 100, status: bid.status, createdAt: bid.createdAt.toISOString() };
}

function positiveCents(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.round(value) : fallback;
}

function cleanText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : null;
}
