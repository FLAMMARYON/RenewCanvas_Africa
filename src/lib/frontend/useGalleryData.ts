import { useEffect, useState } from "react";

export type GalleryArtwork = {
  id: string;
  title: string;
  category: string;
  tags: string[];
  theme: string | null;
  impactScore: number | null;
  artistLocation: string | null;
  kgDiverted: number;
  artist: {
    id: string;
    name: string;
  };
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
 * Fetches gallery layout data from /api/gallery/layout
 */
export function useGalleryData(): UseGalleryDataResult {
  const [result, setResult] = useState<UseGalleryDataResult>({
    status: "loading",
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const response = await fetch("/api/gallery/layout");

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

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
