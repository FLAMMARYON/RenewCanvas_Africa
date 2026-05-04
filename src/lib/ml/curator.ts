import {
  artworkCategories,
  recyclableMaterials,
  type ArtworkCategory,
  type RecyclableMaterial,
} from "./schemas";

export type CurationArtworkInput = {
  id: string;
  title: string;
  artistName: string;
  category: ArtworkCategory;
  materials: RecyclableMaterial[];
  imageUrl?: string;
  colorPalette?: string[];
  mlTags?: string[];
  artistLocation?: string;
  impactScore?: number;
  kgDiverted?: number;
};

export type CuratedMuseumRoom = {
  id: string;
  wingIndex: number;
  roomIndex: number;
  title: string;
  roomKind: "main_gallery" | "side_gallery" | "court" | "cabinet";
  grouping: "type" | "material" | "impact" | "mixed";
  groupingValue: string;
  capacity: number;
  accessibilityLabel: string;
};

export type CuratedArtworkPlacement = {
  artworkId: string;
  roomId: string;
  wingIndex: number;
  slotIndex: number;
  wallSide: "north" | "south" | "east" | "west" | "floor";
  arrangementExplanation: string;
};

export type MuseumCurationPlan = {
  seed: string;
  totalArtworks: number;
  rooms: CuratedMuseumRoom[];
  placements: CuratedArtworkPlacement[];
  accessibilitySummary: string;
};

export type CurationInput = {
  artworks: CurationArtworkInput[];
};

export type CurationValidationResult =
  | { ok: true; value: CurationInput }
  | { ok: false; errors: Record<string, string> };

const MAX_ARTWORKS = 500;
const ROOM_CAPACITY = 8;
const allowedRootFields = new Set(["artworks"]);
const allowedArtworkFields = new Set([
  "id",
  "title",
  "artistName",
  "category",
  "materials",
  "imageUrl",
  "colorPalette",
  "mlTags",
  "artistLocation",
  "impactScore",
  "kgDiverted",
]);

const categoryRoomKind: Record<ArtworkCategory, CuratedMuseumRoom["roomKind"]> = {
  "Wall Art": "main_gallery",
  Sculpture: "court",
  "Home Decor": "side_gallery",
  Jewelry: "cabinet",
  "Functional Art": "side_gallery",
  "Mixed Media": "main_gallery",
  Installation: "court",
  Other: "cabinet",
};

const categoryTheme: Record<ArtworkCategory, string> = {
  "Wall Art": "Wall Art Gallery",
  Sculpture: "Sculpture Court",
  "Home Decor": "Home Decor Gallery",
  Jewelry: "Jewelry Cabinet",
  "Functional Art": "Functional Art Gallery",
  "Mixed Media": "Mixed Media Gallery",
  Installation: "Installation Court",
  Other: "Open Materials Cabinet",
};

const materialTheme: Partial<Record<RecyclableMaterial, string>> = {
  "PET bottles": "PET Bottle Wing",
  "Bottle caps": "Bottle Cap Gallery",
  Cardboard: "Paper and Cardboard Hall",
  Paper: "Paper and Cardboard Hall",
  "Fabric scraps": "Textile Reuse Room",
  "Aluminium cans": "Aluminium Futures Gallery",
  Glass: "Glass Renewal Gallery",
  "Electronic waste": "E-Waste Assemblage Wing",
  "Burlap/grain sacks": "Textile Reuse Room",
  "Plastic bags": "Plastic Reuse Gallery",
  "Metal scraps": "Metal Reuse Court",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOneOf<T extends readonly string[]>(value: unknown, options: T): value is T[number] {
  return typeof value === "string" && options.includes(value);
}

function stableSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

function boundedString(value: unknown, max: number): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= max;
}

function validateOptionalStringList(
  value: unknown,
  maxItems: number,
  maxLength: number
): string[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.length > maxItems) return undefined;
  if (value.some((item) => !boundedString(item, maxLength))) return undefined;
  return value.map((item) => item.trim());
}

function validateUrl(value: unknown) {
  if (value === undefined) return true;
  if (!boundedString(value, 500)) return false;
  if (value.startsWith("//")) return false;
  if (value.startsWith("/")) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function numericOptional(value: unknown, min: number, max: number) {
  return value === undefined || (typeof value === "number" && Number.isFinite(value) && value >= min && value <= max);
}

export function validateCurationInput(input: unknown): CurationValidationResult {
  const errors: Record<string, string> = {};

  if (!isRecord(input)) {
    return { ok: false, errors: { body: "Request body must be an object." } };
  }

  const extraRootFields = Object.keys(input).filter((field) => !allowedRootFields.has(field));
  if (extraRootFields.length > 0) {
    errors.extraFields = `Unsupported fields: ${extraRootFields.join(", ")}.`;
  }

  if (!Array.isArray(input.artworks)) {
    errors.artworks = "artworks must be an array.";
    return { ok: false, errors };
  }

  if (input.artworks.length === 0) {
    errors.artworks = "At least one artwork is required.";
  }

  if (input.artworks.length > MAX_ARTWORKS) {
    errors.artworks = `No more than ${MAX_ARTWORKS} artworks can be curated at once.`;
  }

  const artworks: CurationArtworkInput[] = [];

  input.artworks.forEach((rawArtwork, index) => {
    const prefix = `artworks.${index}`;
    if (!isRecord(rawArtwork)) {
      errors[prefix] = "Artwork must be an object.";
      return;
    }

    const extraArtworkFields = Object.keys(rawArtwork).filter((field) => !allowedArtworkFields.has(field));
    if (extraArtworkFields.length > 0) {
      errors[`${prefix}.extraFields`] = `Unsupported fields: ${extraArtworkFields.join(", ")}.`;
    }

    if (!boundedString(rawArtwork.id, 120)) errors[`${prefix}.id`] = "id is required.";
    if (!boundedString(rawArtwork.title, 180)) errors[`${prefix}.title`] = "title is required.";
    if (!boundedString(rawArtwork.artistName, 180)) {
      errors[`${prefix}.artistName`] = "artistName is required.";
    }
    if (!isOneOf(rawArtwork.category, artworkCategories)) {
      errors[`${prefix}.category`] = "Unknown artwork category.";
    }

    const materials = Array.isArray(rawArtwork.materials) ? rawArtwork.materials : [];
    const unknownMaterials = materials.filter((material) => !isOneOf(material, recyclableMaterials));
    if (!Array.isArray(rawArtwork.materials) || materials.length === 0) {
      errors[`${prefix}.materials`] = "Select at least one known recyclable material.";
    } else if (materials.length > 12 || unknownMaterials.length > 0) {
      errors[`${prefix}.materials`] = "All materials must be known recyclable material types.";
    }

    if (!validateUrl(rawArtwork.imageUrl)) {
      errors[`${prefix}.imageUrl`] = "imageUrl must be a valid http(s) or site-relative URL.";
    }

    const colorPalette = validateOptionalStringList(rawArtwork.colorPalette, 8, 32);
    if (rawArtwork.colorPalette !== undefined && colorPalette === undefined) {
      errors[`${prefix}.colorPalette`] = "colorPalette must contain up to 8 short strings.";
    }

    const mlTags = validateOptionalStringList(rawArtwork.mlTags, 24, 48);
    if (rawArtwork.mlTags !== undefined && mlTags === undefined) {
      errors[`${prefix}.mlTags`] = "mlTags must contain up to 24 short strings.";
    }

    if (rawArtwork.artistLocation !== undefined && !boundedString(rawArtwork.artistLocation, 120)) {
      errors[`${prefix}.artistLocation`] = "artistLocation must be a short public location string.";
    }

    if (!numericOptional(rawArtwork.impactScore, 0, 100)) {
      errors[`${prefix}.impactScore`] = "impactScore must be a number from 0 to 100.";
    }

    if (!numericOptional(rawArtwork.kgDiverted, 0, 500)) {
      errors[`${prefix}.kgDiverted`] = "kgDiverted must be a number from 0 to 500.";
    }

    if (
      boundedString(rawArtwork.id, 120) &&
      boundedString(rawArtwork.title, 180) &&
      boundedString(rawArtwork.artistName, 180) &&
      isOneOf(rawArtwork.category, artworkCategories) &&
      Array.isArray(rawArtwork.materials) &&
      materials.length > 0 &&
      materials.length <= 12 &&
      unknownMaterials.length === 0 &&
      validateUrl(rawArtwork.imageUrl) &&
      (rawArtwork.colorPalette === undefined || colorPalette !== undefined) &&
      (rawArtwork.mlTags === undefined || mlTags !== undefined) &&
      (rawArtwork.artistLocation === undefined || boundedString(rawArtwork.artistLocation, 120)) &&
      numericOptional(rawArtwork.impactScore, 0, 100) &&
      numericOptional(rawArtwork.kgDiverted, 0, 500)
    ) {
      const id = rawArtwork.id;
      const title = rawArtwork.title;
      const artistName = rawArtwork.artistName;
      const category = rawArtwork.category;
      const validMaterials = rawArtwork.materials.filter((material): material is RecyclableMaterial =>
        isOneOf(material, recyclableMaterials)
      );
      const imageUrl = rawArtwork.imageUrl;
      const artistLocation = rawArtwork.artistLocation;
      const impactScore = rawArtwork.impactScore;
      const kgDiverted = rawArtwork.kgDiverted;

      artworks.push({
        id: id.trim(),
        title: title.trim(),
        artistName: artistName.trim(),
        category,
        materials: validMaterials,
        imageUrl: typeof imageUrl === "string" ? imageUrl : undefined,
        colorPalette,
        mlTags,
        artistLocation: typeof artistLocation === "string" ? artistLocation.trim() : undefined,
        impactScore: typeof impactScore === "number" ? impactScore : undefined,
        kgDiverted: typeof kgDiverted === "number" ? kgDiverted : undefined,
      });
    }
  });

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, value: { artworks } };
}

function impactStrength(artwork: CurationArtworkInput) {
  const score = artwork.impactScore ?? Math.min(100, (artwork.kgDiverted ?? 0) * 12);
  if (score >= 70) return "high-impact";
  if (score >= 35) return "measured-impact";
  return "emerging-impact";
}

function primaryTheme(artwork: CurationArtworkInput) {
  const material = artwork.materials[0];
  const materialName = materialTheme[material];

  if ((artwork.impactScore ?? 0) >= 80 || (artwork.kgDiverted ?? 0) >= 8) {
    return {
      grouping: "impact" as const,
      value: "High Impact Works",
      title: "High Impact Works",
    };
  }

  if (materialName && artwork.materials.length === 1) {
    return {
      grouping: "material" as const,
      value: material,
      title: materialName,
    };
  }

  return {
    grouping: "type" as const,
    value: artwork.category,
    title: categoryTheme[artwork.category],
  };
}

function sortForCuration(left: CurationArtworkInput, right: CurationArtworkInput) {
  const leftTheme = primaryTheme(left);
  const rightTheme = primaryTheme(right);
  const themeCompare = leftTheme.title.localeCompare(rightTheme.title);
  if (themeCompare !== 0) return themeCompare;

  const impactCompare = (right.impactScore ?? right.kgDiverted ?? 0) - (left.impactScore ?? left.kgDiverted ?? 0);
  if (impactCompare !== 0) return impactCompare;

  const titleCompare = left.title.localeCompare(right.title);
  if (titleCompare !== 0) return titleCompare;

  return left.id.localeCompare(right.id);
}

function wallSideFor(roomKind: CuratedMuseumRoom["roomKind"], slotIndex: number): CuratedArtworkPlacement["wallSide"] {
  if (roomKind === "court") return "floor";
  return (["north", "east", "south", "west"] as const)[slotIndex % 4];
}

export function curateMuseum(input: CurationInput): MuseumCurationPlan {
  const sortedArtworks = [...input.artworks].sort(sortForCuration);
  const rooms: CuratedMuseumRoom[] = [];
  const placements: CuratedArtworkPlacement[] = [];
  const roomIndexByKey = new Map<string, number>();

  for (const artwork of sortedArtworks) {
    const theme = primaryTheme(artwork);
    const roomKind = categoryRoomKind[artwork.category];
    const roomKey = `${theme.grouping}:${theme.title}:${roomKind}`;
    const existingBaseIndex = roomIndexByKey.get(roomKey);
    const matchingRooms =
      existingBaseIndex === undefined
        ? []
        : rooms.filter((room) => room.id.startsWith(`${stableSlug(theme.title)}-${roomKind}`));
    const lastRoom = matchingRooms.at(-1);
    const occupied = lastRoom
      ? placements.filter((placement) => placement.roomId === lastRoom.id).length
      : ROOM_CAPACITY;

    let room = lastRoom;
    if (!room || occupied >= ROOM_CAPACITY) {
      const themeRoomCount = matchingRooms.length;
      const roomIndex = rooms.length;
      const wingIndex = Math.floor(roomIndex / 6);
      room = {
        id: `${stableSlug(theme.title)}-${roomKind}-${themeRoomCount + 1}`,
        wingIndex,
        roomIndex,
        title: themeRoomCount === 0 ? theme.title : `${theme.title} ${themeRoomCount + 1}`,
        roomKind,
        grouping: theme.grouping,
        groupingValue: theme.value,
        capacity: ROOM_CAPACITY,
        accessibilityLabel: `${theme.title}, arranged by ${theme.grouping} ${theme.value}.`,
      };
      rooms.push(room);
      if (existingBaseIndex === undefined) roomIndexByKey.set(roomKey, roomIndex);
    }

    const slotIndex = placements.filter((placement) => placement.roomId === room.id).length;
    placements.push({
      artworkId: artwork.id,
      roomId: room.id,
      wingIndex: room.wingIndex,
      slotIndex,
      wallSide: wallSideFor(room.roomKind, slotIndex),
      arrangementExplanation: `${artwork.title} is placed in ${room.title} because it matches ${room.grouping} grouping "${room.groupingValue}" with ${impactStrength(artwork)} metadata.`,
    });
  }

  return {
    seed: `rule-v1:${sortedArtworks.map((artwork) => artwork.id).join("|")}`,
    totalArtworks: sortedArtworks.length,
    rooms,
    placements,
    accessibilitySummary: `${sortedArtworks.length} artworks arranged into ${rooms.length} rooms by type, material, and impact metadata.`,
  };
}
