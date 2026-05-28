import { NextResponse } from "next/server";
import { getDatabaseClient } from "@/lib/backend/db";

export const dynamic = "force-dynamic";

const GALLERY_ROOMS = [
  { id: "sculpture-room", name: "Sculpture Room", categories: ["Sculpture"] },
  { id: "painting-room", name: "Painting Room", categories: ["Wall Art", "Painting"] },
  { id: "wearables-room", name: "Wearables Room", categories: ["Jewelry", "Fashion"] },
  { id: "living-space-room", name: "Living Space Room", categories: ["Home Decor", "Furniture"] },
  { id: "mixed-media-room", name: "Mixed Media Room", categories: ["Mixed Media", "Other"] },
] as const;

type RoomId = (typeof GALLERY_ROOMS)[number]["id"];

let cachedLayout: {
  rooms: Array<{
    id: string;
    name: string;
    artworks: unknown[];
  }>;
  timestamp: number;
} | null = null;

const CACHE_DURATION_MS = 60_000;

export async function GET() {
  try {
    if (cachedLayout && Date.now() - cachedLayout.timestamp < CACHE_DURATION_MS) {
      return NextResponse.json(cachedLayout);
    }

    const db = getDatabaseClient();
    const artworks = await db.artwork.findMany({
      where: { status: "listed" },
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
        artist: {
          select: {
            id: true,
            name: true,
          },
        },
        images: {
          select: {
            id: true,
            url: true,
            altText: true,
          },
          take: 1,
          orderBy: {
            sortOrder: "asc",
          },
        },
        materials: {
          select: {
            material: true,
            weightKg: true,
          },
        },
      },
      take: 100,
      orderBy: { updatedAt: "desc" },
    });

    const assignments = GALLERY_ROOMS.reduce(
      (acc, room) => {
        acc[room.id] = [];
        return acc;
      },
      {} as Record<RoomId, unknown[]>
    );

    artworks.forEach((artwork) => {
      const room = roomForCategory(artwork.category);
      assignments[room].push({
        ...artwork,
        priceAmount: Math.round(Number(artwork.priceCents ?? 0) / 100),
      });
    });

    const response = {
      rooms: GALLERY_ROOMS.map((room) => ({
        id: room.id,
        name: room.name,
        artworks: assignments[room.id],
      })),
      timestamp: Date.now(),
    };
    cachedLayout = response;
    return NextResponse.json(response);
  } catch (error) {
    console.error("Gallery layout error:", error);
    return NextResponse.json({ error: "Failed to load gallery artworks" }, { status: 500 });
  }
}

function roomForCategory(category: string): RoomId {
  const match = GALLERY_ROOMS.find((room) => room.categories.includes(category as never));
  return match?.id ?? "mixed-media-room";
}
