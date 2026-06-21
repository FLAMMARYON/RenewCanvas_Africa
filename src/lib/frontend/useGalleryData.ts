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

/**
 * Loads the CURATED gallery layout from the server.
 *
 * The server (`/api/gallery/layout`) returns a fixed, predefined set of rooms,
 * each already filled with only the top-performing artworks of its category up
 * to that room's capacity, ranked by the shared performance score. The client
 * does NOT group, rank, or cap — it renders exactly what the server curated, so
 * the gallery and the artist analytics share one source of truth.
 */
export function useGalleryData(): UseGalleryDataResult {
  const [result, setResult] = useState<UseGalleryDataResult>({
    status: "loading",
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const response = await fetch("/api/gallery/layout", { credentials: "include" });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const payload = (await response.json()) as { rooms?: GalleryRoom[]; timestamp?: number; error?: string };
        if (!payload.rooms) {
          throw new Error(payload.error ?? "Failed to fetch gallery data");
        }

        const data: GalleryData = { rooms: payload.rooms, timestamp: payload.timestamp ?? Date.now() };

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
