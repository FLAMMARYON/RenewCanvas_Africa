import type { GalleryArtwork, GalleryRoom } from "@/lib/frontend/useGalleryData";

export type VirtualRoomArtwork = {
  id: string;
  slug: string;
  title: string;
  artist: string;
  ownerType: "artist" | "renewcanvas";
  category: string;
  price: number;
  image: string;
  fallbackColor: string;
  materials: string[];
  kgDiverted: number;
};

export function toVirtualRoomArtwork(artwork: GalleryArtwork): VirtualRoomArtwork {
  return {
    id: artwork.id,
    slug: artwork.slug,
    title: artwork.title,
    artist: artwork.artist?.name ?? "RenewCanvas Africa",
    ownerType: artwork.ownerType,
    category: artwork.category,
    price: artwork.priceAmount,
    image: artwork.images[0]?.url ?? "",
    fallbackColor: colorForCategory(artwork.category),
    materials: artwork.materials.map((material) => material.material),
    kgDiverted: artwork.kgDiverted,
  };
}

export function flattenGalleryRooms(rooms: GalleryRoom[]) {
  return rooms.flatMap((room) => room.artworks.map((artwork) => toVirtualRoomArtwork(artwork)));
}

function colorForCategory(category: string) {
  const colors: Record<string, string> = {
    Sculpture: "#63764f",
    "Wall Art": "#1f8a9c",
    Painting: "#1f8a9c",
    Jewelry: "#b9852f",
    Fashion: "#b9852f",
    "Home Decor": "#446d83",
    Furniture: "#446d83",
    "Mixed Media": "#594d65",
    Other: "#594d65",
  };
  return colors[category] ?? "#594d65";
}
