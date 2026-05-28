import { useEffect, useState } from "react";

export type GalleryArtwork = {
  id: string;
  slug: string;
  title: string;
  category: string;
  ownerType: "artist" | "renewcanvas";
  priceAmount: number;
  currency: string;
  tags: string[];
  theme: string | null;
  impactScore: number | null;
  artistLocation: string | null;
  kgDiverted: number;
  artist: {
    id: string;
    name: string;
  } | null;
  images: Array<{
    id: string;
    url: string;
    altText: string;
  }>;
  materials: Array<{
    material: string;
    weightKg: number;
  }>;
};

export type GalleryRoom = {
  id: string;
  name: string;
  artworks: GalleryArtwork[];
};

export type GalleryData = {
  rooms: GalleryRoom[];
  timestamp: number;
};

export type UseGalleryDataResult =
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "success"; data: GalleryData };

const GALLERY_ROOMS = [
  { id: "sculpture-room", name: "Sculpture Room", categories: ["Sculpture"] },
  { id: "painting-room", name: "Painting Room", categories: ["Wall Art", "Painting"] },
  { id: "wearables-room", name: "Wearables Room", categories: ["Jewelry", "Fashion"] },
  { id: "living-space-room", name: "Living Space Room", categories: ["Home Decor", "Furniture"] },
  { id: "mixed-media-room", name: "Mixed Media Room", categories: ["Mixed Media", "Other"] },
] as const;

/**
 * Fetches listed marketplace artworks and groups them into gallery rooms.
 */
export function useGalleryData(): UseGalleryDataResult {
  const [result, setResult] = useState<UseGalleryDataResult>({
    status: "loading",
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const response = await fetch("/api/artworks?scope=marketplace&pageSize=100", { credentials: "include" });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const payload = (await response.json()) as { ok?: boolean; artworks?: GalleryArtwork[]; message?: string };
        if (!payload.ok || !payload.artworks) {
          throw new Error(payload.message ?? "Failed to fetch gallery data");
        }
        const data = groupArtworksByRoom(payload.artworks);

        if (!cancelled) {
          setResult({ status: "success", data });
        }
      } catch (error) {
        if (!cancelled) {
          setResult({
            status: "error",
            error: error instanceof Error ? error.message : "Failed to fetch gallery data",
          });
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  return result;
}

function groupArtworksByRoom(artworks: GalleryArtwork[]): GalleryData {
  const roomMap = new Map(GALLERY_ROOMS.map((room) => [room.id, { ...room, artworks: [] as GalleryArtwork[] }]));
  artworks.forEach((artwork) => {
    const room = GALLERY_ROOMS.find((candidate) => candidate.categories.includes(artwork.category as never));
    roomMap.get(room?.id ?? "mixed-media-room")?.artworks.push(artwork);
  });

  return {
    rooms: GALLERY_ROOMS.map((room) => {
      const groupedRoom = roomMap.get(room.id);
      return {
        id: room.id,
        name: room.name,
        artworks: groupedRoom?.artworks ?? [],
      };
    }),
    timestamp: Date.now(),
  };
}
