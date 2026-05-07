import { AuthError, type AuthPublicUser } from "./auth";
import { normalizeArtwork, type ArtworkRecord } from "./artworks";

type WishlistRecord = {
  id: string;
  buyerId: string;
  artworkId: string;
  createdAt: Date;
  artwork: ArtworkRecord;
};

export type WishlistDatabase = {
  artwork: {
    findFirst(args: { where: Record<string, unknown> }): Promise<{ id: string } | null>;
    updateMany(args: { where: Record<string, unknown>; data: Record<string, unknown> }): Promise<{ count: number }>;
  };
  wishlistItem: {
    findMany(args: {
      where: { buyerId: string };
      include: WishlistInclude;
      orderBy: { createdAt: "desc" };
    }): Promise<WishlistRecord[]>;
    findUnique(args: { where: { buyerId_artworkId: { buyerId: string; artworkId: string } } }): Promise<{ id: string } | null>;
    create(args: { data: { buyerId: string; artworkId: string } }): Promise<{ id: string }>;
    delete(args: { where: { buyerId_artworkId: { buyerId: string; artworkId: string } } }): Promise<{ id: string }>;
  };
};

type WishlistInclude = {
  artwork: {
    include: {
      artist: { select: { id: true; name: true; email: true } };
      images: { orderBy: { sortOrder: "asc" } };
      materials: true;
    };
  };
};

const includeWishlistArtwork = {
  artwork: {
    include: {
      artist: { select: { id: true, name: true, email: true } },
      images: { orderBy: { sortOrder: "asc" as const } },
      materials: true,
    },
  },
} as const;

export async function listWishlist(db: WishlistDatabase, user: AuthPublicUser) {
  assertBuyer(user);
  const items = await db.wishlistItem.findMany({
    where: { buyerId: user.id },
    include: includeWishlistArtwork,
    orderBy: { createdAt: "desc" },
  });

  return items.map((item) => ({
    id: item.id,
    savedAt: item.createdAt.toISOString(),
    artwork: normalizeArtwork(item.artwork),
  }));
}

export async function addWishlistItem(db: WishlistDatabase, user: AuthPublicUser, artworkId: string) {
  assertBuyer(user);
  const artwork = await db.artwork.findFirst({ where: { id: artworkId, status: "listed" } });
  if (!artwork) {
    throw new AuthError("artwork_not_found", "Artwork was not found.", 404);
  }

  const existing = await db.wishlistItem.findUnique({
    where: { buyerId_artworkId: { buyerId: user.id, artworkId: artwork.id } },
  });
  if (!existing) {
    await db.wishlistItem.create({ data: { buyerId: user.id, artworkId: artwork.id } });
    await db.artwork.updateMany({
      where: { id: artwork.id },
      data: { favouriteCount: { increment: 1 } },
    });
  }
}

export async function removeWishlistItem(db: WishlistDatabase, user: AuthPublicUser, artworkId: string) {
  assertBuyer(user);
  const existing = await db.wishlistItem.findUnique({
    where: { buyerId_artworkId: { buyerId: user.id, artworkId } },
  });
  if (!existing) return;

  await db.wishlistItem.delete({ where: { buyerId_artworkId: { buyerId: user.id, artworkId } } });
  await db.artwork.updateMany({
    where: { id: artworkId, favouriteCount: { gt: 0 } },
    data: { favouriteCount: { decrement: 1 } },
  });
}

function assertBuyer(user: AuthPublicUser): void {
  if (user.role !== "buyer") {
    throw new AuthError("forbidden", "Only buyers can manage wishlist items.", 403);
  }
}
