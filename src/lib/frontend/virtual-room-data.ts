import type { ArtworkCategory } from "@/lib/ml/schemas";

export type VirtualRoomArtwork = {
  id: number;
  title: string;
  artist: string;
  category: ArtworkCategory;
  price: number;
  image: string;
  fallbackColor: string;
  materials: string[];
  kgDiverted: number;
};

export const virtualRoomArtworks: VirtualRoomArtwork[] = [
  {
    id: 1,
    title: "Ocean Waves",
    artist: "Marie Uwimana",
    category: "Wall Art",
    price: 45000,
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1200",
    fallbackColor: "#1f8a9c",
    materials: ["PET bottles", "fabric"],
    kgDiverted: 2.5,
  },
  {
    id: 2,
    title: "Sunset Dreams",
    artist: "Jean Baptiste",
    category: "Mixed Media",
    price: 38000,
    image: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=1200",
    fallbackColor: "#c8643a",
    materials: ["cardboard", "paper"],
    kgDiverted: 1.8,
  },
  {
    id: 3,
    title: "Forest Spirit",
    artist: "Claudine Mukiza",
    category: "Sculpture",
    price: 52000,
    image: "https://images.unsplash.com/photo-1549887534-1541e9326642?w=1200",
    fallbackColor: "#63764f",
    materials: ["bottle caps", "metal"],
    kgDiverted: 3.2,
  },
  {
    id: 4,
    title: "Urban Rhythm",
    artist: "Patrick Nshimiye",
    category: "Functional Art",
    price: 41000,
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1200",
    fallbackColor: "#594d65",
    materials: ["aluminum cans", "fabric"],
    kgDiverted: 2.1,
  },
  {
    id: 5,
    title: "Mountain Echo",
    artist: "Grace Ingabire",
    category: "Installation",
    price: 67000,
    image: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=1200",
    fallbackColor: "#826c4f",
    materials: ["glass", "PET bottles"],
    kgDiverted: 4.5,
  },
  {
    id: 6,
    title: "River Dance",
    artist: "Emmanuel Habimana",
    category: "Home Decor",
    price: 35000,
    image: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=1200",
    fallbackColor: "#446d83",
    materials: ["fabric scraps", "cardboard"],
    kgDiverted: 1.5,
  },
  {
    id: 7,
    title: "Golden Hour",
    artist: "Alice Uwase",
    category: "Jewelry",
    price: 48000,
    image: "https://images.unsplash.com/photo-1582201942988-13e60e4556ee?w=1200",
    fallbackColor: "#b9852f",
    materials: ["bottle caps", "paper"],
    kgDiverted: 2.8,
  },
  {
    id: 8,
    title: "Serene Landscape",
    artist: "David Mugabo",
    category: "Wall Art",
    price: 55000,
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1200",
    fallbackColor: "#597d64",
    materials: ["PET bottles", "burlap"],
    kgDiverted: 3.7,
  },
];
