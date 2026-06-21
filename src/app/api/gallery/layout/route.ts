import { NextResponse } from "next/server";
import { getDatabaseClient } from "@/lib/backend/db";
import { GALLERY_ROOMS, roomIdForCategory } from "@/lib/gallery/rooms";
import { artworkPerformanceScore } from "@/lib/ml/artwork-performance";

export const dynamic = "force-dynamic";

const CACHE_DURATION_MS = 60_000;
// Safety ceiling on rows scanned for ranking. The gallery only ever SHOWS the
// sum of the room capacities (a few dozen), but we must read enough rows to rank
// fairly. This is NOT a room/slot count — it just bounds the DB scan.
const MAX_RANKED_ARTWORKS = 1000;

type CuratedRoom = {
  id: string;
  name: string;
  artworks: unknown[];
};

let cachedLayout: { rooms: CuratedRoom[]; timestamp: number } | null = null;

export async function GET() {
  try {
    if (cachedLayout && Date.now() - cachedLayout.timestamp < CACHE_DURATION_MS) {
      return NextResponse.json(cachedLayout);
    }

    const db = getDatabaseClient();
    const artworks = await db.artwork.findMany({
      // Eligibility: only listed/approved/reserved artworks appear in the gallery
      // (same status filter the marketplace uses). RenewCanvas/admin-owned pieces
      // are ranked exactly like artist pieces (no ownerType filter).
      where: { status: { in: ["listed", "approved", "reserved"] } },
      select: {
        id: true,
        slug: true,
        title: true,
        category: true,
        ownerType: true,
        priceCents: true,
        currency: true,
        tags: true,
        theme: true,
        impactScore: true,
        artistLocation: true,
        kgDiverted: true,
        // Performance inputs — the SAME signals the analytics "Top Performing"
        // list uses: views + favourites + total units ordered.
        viewCount: true,
        favouriteCount: true,
        artist: { select: { id: true, name: true } },
        images: { select: { id: true, url: true, altText: true }, take: 1, orderBy: { sortOrder: "asc" } },
        materials: { select: { material: true, weightKg: true } },
        orderItems: { select: { quantity: true } },
      },
      take: MAX_RANKED_ARTWORKS,
    });

    // Normalise + compute the shared performance score for each artwork.
    const scored = artworks.map((artwork) => {
      const orders = artwork.orderItems.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
      const score = artworkPerformanceScore({
        views: artwork.viewCount ?? 0,
        favourites: artwork.favouriteCount ?? 0,
        orders,
      });
      return {
        score,
        roomId: roomIdForCategory(artwork.category),
        artwork: {
          id: artwork.id,
          slug: artwork.slug,
          title: artwork.title,
          category: artwork.category,
          ownerType: artwork.ownerType,
          priceAmount: Math.round(Number(artwork.priceCents ?? 0) / 100),
          currency: artwork.currency,
          tags: artwork.tags,
          theme: artwork.theme,
          impactScore: artwork.impactScore == null ? null : Number(artwork.impactScore),
          artistLocation: artwork.artistLocation,
          kgDiverted: Number(artwork.kgDiverted ?? 0),
          artist: artwork.artist,
          images: artwork.images,
          materials: artwork.materials.map((m) => ({ material: m.material, weightKg: Number(m.weightKg ?? 0) })),
        },
      };
    });

    // Bucket by fixed room, rank by score (desc), and take only the top
    // `capacity` per room. Rooms are ALWAYS the predefined set — never generated
    // from the artwork count. Artworks beyond capacity are simply not shown; a
    // room with fewer artworks than capacity keeps its remaining slots empty.
    const byRoom = new Map<string, typeof scored>();
    for (const entry of scored) {
      const list = byRoom.get(entry.roomId) ?? [];
      list.push(entry);
      byRoom.set(entry.roomId, list);
    }

    const rooms: CuratedRoom[] = GALLERY_ROOMS.map((room) => {
      const ranked = (byRoom.get(room.id) ?? [])
        // Highest score first; deterministic id tiebreak so the order is stable.
        .sort((a, b) => b.score - a.score || a.artwork.id.localeCompare(b.artwork.id))
        .slice(0, room.capacity)
        .map((entry) => entry.artwork);
      return { id: room.id, name: room.name, artworks: ranked };
    });

    const response = { rooms, timestamp: Date.now() };
    cachedLayout = response;
    return NextResponse.json(response);
  } catch (error) {
    console.error("Gallery layout error:", error);
    return NextResponse.json({ error: "Failed to load gallery artworks" }, { status: 500 });
  }
}
