import assert from "node:assert/strict";
import test from "node:test";
import { addWishlistItem, listWishlist, removeWishlistItem, type WishlistDatabase } from "@/lib/backend/wishlist";
import type { AuthPublicUser } from "@/lib/backend/auth";
import type { ArtworkRecord } from "@/lib/backend/artworks";

const buyer: AuthPublicUser = {
  id: "buyer_1",
  email: "buyer@example.com",
  name: "Buyer",
  role: "buyer",
  status: "active",
};

const artist = { id: "artist_1", email: "artist@example.com", name: "Artist" };

test("buyer wishlist persists artwork and increments favourite count once", async () => {
  const db = createMemoryWishlistDatabase();

  await addWishlistItem(db, buyer, "artwork_1");
  await addWishlistItem(db, buyer, "artwork_1");

  const items = await listWishlist(db, buyer);
  assert.equal(items.length, 1);
  assert.equal(items[0].artwork.title, "Ocean Waves");
  assert.equal(db.artworks[0].favouriteCount, 1);
});

test("buyer can remove wishlist item and decrement favourite count", async () => {
  const db = createMemoryWishlistDatabase();
  await addWishlistItem(db, buyer, "artwork_1");
  await removeWishlistItem(db, buyer, "artwork_1");

  assert.equal((await listWishlist(db, buyer)).length, 0);
  assert.equal(db.artworks[0].favouriteCount, 0);
});

function createMemoryWishlistDatabase(): WishlistDatabase & { artworks: ArtworkRecord[] } {
  const artworks: ArtworkRecord[] = [
    {
      id: "artwork_1",
      artistId: artist.id,
      slug: "ocean-waves",
      title: "Ocean Waves",
      description: "Listed artwork",
      category: "Wall Art",
      ownerType: "artist",
      status: "listed",
      priceCents: 4200000,
      currency: "RWF",
      dimensions: null,
      kgDiverted: 2.5,
      viewCount: 0,
      favouriteCount: 0,
      rejectionReason: null,
      submittedAt: null,
      reviewedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      artist,
      images: [],
      materials: [],
    },
  ];
  const wishlist = new Map<string, { id: string; buyerId: string; artworkId: string; createdAt: Date }>();

  const db: WishlistDatabase & { artworks: ArtworkRecord[] } = {
    artworks,
    artwork: {
      async findFirst(args) {
        return artworks.find((artwork) => matchesWhere(artwork, args.where)) ?? null;
      },
      async updateMany(args) {
        const matching = artworks.filter((artwork) => matchesWhere(artwork, args.where));
        for (const artwork of matching) {
          const favouriteUpdate = args.data.favouriteCount as { increment?: number; decrement?: number } | undefined;
          if (typeof favouriteUpdate?.increment === "number") artwork.favouriteCount += favouriteUpdate.increment;
          if (typeof favouriteUpdate?.decrement === "number") artwork.favouriteCount -= favouriteUpdate.decrement;
        }
        return { count: matching.length };
      },
    },
    wishlistItem: {
      async findMany(args) {
        return Array.from(wishlist.values())
          .filter((item) => item.buyerId === args.where.buyerId)
          .map((item) => ({ ...item, artwork: artworks.find((artwork) => artwork.id === item.artworkId)! }));
      },
      async findUnique(args) {
        return wishlist.get(key(args.where.buyerId_artworkId.buyerId, args.where.buyerId_artworkId.artworkId)) ?? null;
      },
      async create(args) {
        const item = { id: `wishlist_${wishlist.size + 1}`, ...args.data, createdAt: new Date() };
        wishlist.set(key(item.buyerId, item.artworkId), item);
        return item;
      },
      async delete(args) {
        const itemKey = key(args.where.buyerId_artworkId.buyerId, args.where.buyerId_artworkId.artworkId);
        const item = wishlist.get(itemKey);
        assert.ok(item);
        wishlist.delete(itemKey);
        return item;
      },
    },
  };

  return db;
}

function key(buyerId: string, artworkId: string) {
  return `${buyerId}:${artworkId}`;
}

function matchesWhere(artwork: ArtworkRecord, where: Record<string, unknown>) {
  return Object.entries(where).every(([field, value]) => {
    if (field === "favouriteCount" && value && typeof value === "object" && "gt" in value) {
      return artwork.favouriteCount > Number((value as { gt: number }).gt);
    }
    return (artwork as unknown as Record<string, unknown>)[field] === value;
  });
}
