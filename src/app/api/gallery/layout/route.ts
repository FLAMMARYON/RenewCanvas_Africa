import { NextResponse } from "next/server";
import { getDatabaseClient } from "@/lib/backend/db";

export const dynamic = "force-dynamic";

// Room definitions with tag matching
const GALLERY_ROOMS = [
  {
    id: "pet-bottle-wing",
    name: "PET Bottle Wing",
    tags: ["pet", "bottle", "plastic", "recycled plastic"] as string[],
  },
  {
    id: "women-artists-gallery",
    name: "Women Artists Gallery",
    tags: ["women", "female", "girl", "she", "her"] as string[],
  },
  {
    id: "youth-climate-innovators",
    name: "Youth Climate Innovators",
    tags: ["youth", "student", "school", "climate", "young"] as string[],
  },
  {
    id: "ewaste-sculptures",
    name: "E-Waste Sculptures",
    tags: ["ewaste", "electronic", "circuit", "computer"] as string[],
  },
  {
    id: "kigali-recycled-futures",
    name: "Kigali Recycled Futures",
    tags: ["kigali", "rwanda", "african", "city"] as string[],
  },
  {
    id: "school-collection-showcase",
    name: "School Collection Showcase",
    tags: ["school", "education", "kids", "collection"] as string[],
  },
];

type RoomId = typeof GALLERY_ROOMS[number]["id"];

// In-memory cache
let cachedLayout: {
  rooms: Array<{
    id: string;
    name: string;
    artworks: unknown[];
  }>;
  timestamp: number;
} | null = null;

const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

function scoreArtworkForRoom(
  artworkTags: string[],
  roomTags: string[]
): number {
  const normalizedArtworkTags = artworkTags.map((tag) =>
    tag.trim().toLowerCase()
  );
  const normalizedRoomTags = roomTags.map((tag) => tag.trim().toLowerCase());

  let score = 0;
  for (const artworkTag of normalizedArtworkTags) {
    for (const roomTag of normalizedRoomTags) {
      if (artworkTag.includes(roomTag) || roomTag.includes(artworkTag)) {
        score += 1;
      }
    }
  }

  return score;
}

function assignArtworksToRooms(artworks: any[]) {
  const roomAssignments: Record<RoomId, any[]> = {
    "pet-bottle-wing": [],
    "women-artists-gallery": [],
    "youth-climate-innovators": [],
    "ewaste-sculptures": [],
    "kigali-recycled-futures": [],
    "school-collection-showcase": [],
  };

  const unmatched: any[] = [];

  for (const artwork of artworks) {
    const artworkTags = artwork.tags || [];
    let bestRoom: RoomId | null = null;
    let bestScore = 0;

    for (const room of GALLERY_ROOMS) {
      const score = scoreArtworkForRoom(artworkTags, room.tags);
      if (score > bestScore) {
        bestScore = score;
        bestRoom = room.id;
      } else if (score === bestScore && bestScore > 0) {
        // Tie-breaking: alphabetical by room name
        if (!bestRoom || room.name < GALLERY_ROOMS.find((r) => r.id === bestRoom)!.name) {
          bestRoom = room.id;
        }
      }
    }

    if (bestRoom && bestScore > 0) {
      roomAssignments[bestRoom].push(artwork);
    } else {
      unmatched.push(artwork);
    }
  }

  // Distribute unmatched artworks evenly across rooms
  let roomIndex = 0;
  for (const artwork of unmatched) {
    const room = GALLERY_ROOMS[roomIndex];
    roomAssignments[room.id].push(artwork);
    roomIndex = (roomIndex + 1) % GALLERY_ROOMS.length;
  }

  return roomAssignments;
}

export async function GET() {
  try {
    // Check cache
    if (cachedLayout && Date.now() - cachedLayout.timestamp < CACHE_DURATION_MS) {
      return NextResponse.json(cachedLayout);
    }

    let artworks: any[] = [];

    try {
      const db = getDatabaseClient();

      // Fetch artworks with tags
      artworks = await db.artwork.findMany({
        where: { status: "listed" },
        select: {
          id: true,
          title: true,
          category: true,
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
    } catch (error) {
      console.warn("Using demo gallery layout because artworks could not be loaded:", error);
    }

    // Fallback: If no artworks found or the database is unavailable, use mock data for demo
    if (artworks.length === 0) {
      artworks = [
        {
          id: "mock-1",
          title: "Ocean Waves",
          category: "Wall Art",
          tags: ["pet", "bottle", "plastic", "ocean"],
          theme: "Ocean Conservation",
          impactScore: 85,
          artistLocation: "Kigali",
          kgDiverted: 2.5,
          artist: { id: "artist-1", name: "Marie Uwimana" },
          images: [{ id: "img-1", url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800", altText: "Ocean Waves artwork" }],
          materials: [{ material: "PET bottles", weightKg: 2.5 }],
        },
        {
          id: "mock-2",
          title: "Women Rising",
          category: "Sculpture",
          tags: ["women", "female", "empowerment"],
          theme: "Women Empowerment",
          impactScore: 92,
          artistLocation: "Musanze",
          kgDiverted: 3.2,
          artist: { id: "artist-2", name: "Grace Mukamana" },
          images: [{ id: "img-2", url: "https://images.unsplash.com/photo-1513584684374-8bab748fbf90?w=800", altText: "Women Rising sculpture" }],
          materials: [{ material: "Metal scraps", weightKg: 3.2 }],
        },
        {
          id: "mock-3",
          title: "Climate Action",
          category: "Mixed Media",
          tags: ["youth", "student", "climate", "future"],
          theme: "Climate Action",
          impactScore: 88,
          artistLocation: "Huye",
          kgDiverted: 1.8,
          artist: { id: "artist-3", name: "Jean Paul Nkurunziza" },
          images: [{ id: "img-3", url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800", altText: "Climate Action artwork" }],
          materials: [{ material: "Cardboard", weightKg: 1.8 }],
        },
        {
          id: "mock-4",
          title: "Digital Dreams",
          category: "Sculpture",
          tags: ["ewaste", "electronic", "circuit", "technology"],
          theme: "Digital Age",
          impactScore: 90,
          artistLocation: "Kigali",
          kgDiverted: 4.5,
          artist: { id: "artist-4", name: "Emmanuel Ntaganda" },
          images: [{ id: "img-4", url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800", altText: "Digital Dreams sculpture" }],
          materials: [{ material: "Electronic waste", weightKg: 4.5 }],
        },
        {
          id: "mock-5",
          title: "Kigali Skyline",
          category: "Wall Art",
          tags: ["kigali", "rwanda", "african", "city"],
          theme: "Urban Renewal",
          impactScore: 87,
          artistLocation: "Kigali",
          kgDiverted: 2.1,
          artist: { id: "artist-5", name: "Claudine Uwera" },
          images: [{ id: "img-5", url: "https://images.unsplash.com/photo-1590004953392-5aba2e72269a?w=800", altText: "Kigali Skyline artwork" }],
          materials: [{ material: "Plastic bags", weightKg: 2.1 }],
        },
        {
          id: "mock-6",
          title: "School Pride",
          category: "Mixed Media",
          tags: ["school", "education", "kids", "collection"],
          theme: "Community",
          impactScore: 83,
          artistLocation: "Rubavu",
          kgDiverted: 1.5,
          artist: { id: "artist-6", name: "Patrick Mugabo" },
          images: [{ id: "img-6", url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800", altText: "School Pride artwork" }],
          materials: [{ material: "Paper", weightKg: 1.5 }],
        },
      ] as any;
    }

    const roomAssignments = assignArtworksToRooms(artworks);

    const rooms = GALLERY_ROOMS.map((room) => ({
      id: room.id,
      name: room.name,
      artworks: roomAssignments[room.id],
    }));

    const response = { rooms, timestamp: Date.now() };
    cachedLayout = response;

    return NextResponse.json(response);
  } catch (error) {
    console.error("Gallery layout error:", error);
    return NextResponse.json(
      { error: "Failed to generate gallery layout" },
      { status: 500 }
    );
  }
}
