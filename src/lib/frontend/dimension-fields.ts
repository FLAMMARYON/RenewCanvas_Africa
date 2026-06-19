/**
 * Category → dimension input configuration.
 *
 * ONE place to add new categories / dimension field sets. Each artwork category
 * maps to a "kind" of dimension input set:
 *   - "2d"   width × height           (flat / wall-mounted pieces)
 *   - "3d"   width × height × depth   (sculptural / free-standing pieces)
 *   - "size" a single size / length   (jewelry & wearables)
 * Any category not listed in CATEGORY_DIMENSION_KIND falls back to
 * DEFAULT_DIMENSION_KIND ("2d", i.e. width × height).
 *
 * To support a new category: add a line to CATEGORY_DIMENSION_KIND.
 * To support a new SHAPE of input set: add an entry to DIMENSION_FIELD_SETS.
 */
export type DimensionFieldKind = "2d" | "3d" | "size";

export type DimensionFieldKey = "width" | "height" | "depth" | "size";

export type DimensionField = {
  key: DimensionFieldKey;
  /** i18n key suffix under `artistDashboard.create.*`. */
  labelKey: string;
  defaultLabel: string;
  placeholder: string;
  /** "number" → centimetre dimension; "text" → free value (e.g. "Adjustable"). */
  type: "number" | "text";
};

const WIDTH: DimensionField = { key: "width", labelKey: "dimWidth", defaultLabel: "Width (cm)", placeholder: "e.g. 60", type: "number" };
const HEIGHT: DimensionField = { key: "height", labelKey: "dimHeight", defaultLabel: "Height (cm)", placeholder: "e.g. 80", type: "number" };
const DEPTH: DimensionField = { key: "depth", labelKey: "dimDepth", defaultLabel: "Depth (cm)", placeholder: "e.g. 30", type: "number" };
const SIZE: DimensionField = { key: "size", labelKey: "dimSize", defaultLabel: "Size / length", placeholder: 'e.g. 45cm or "Adjustable"', type: "text" };

export const DIMENSION_FIELD_SETS: Record<DimensionFieldKind, DimensionField[]> = {
  "2d": [WIDTH, HEIGHT],
  "3d": [WIDTH, HEIGHT, DEPTH],
  size: [SIZE],
};

export const DEFAULT_DIMENSION_KIND: DimensionFieldKind = "2d";

// Categories mirror `artworkCategories` in src/lib/ml/schemas.ts (+ "Painting"
// for future use). Unmapped categories fall back to DEFAULT_DIMENSION_KIND.
export const CATEGORY_DIMENSION_KIND: Record<string, DimensionFieldKind> = {
  "Wall Art": "2d",
  Painting: "2d",
  "Mixed Media": "2d",
  Sculpture: "3d",
  Installation: "3d",
  "Functional Art": "3d",
  "Home Decor": "3d",
  Jewelry: "size",
};

export function dimensionKindForCategory(category: string): DimensionFieldKind {
  return CATEGORY_DIMENSION_KIND[category] ?? DEFAULT_DIMENSION_KIND;
}

export function dimensionFieldsForCategory(category: string): DimensionField[] {
  return DIMENSION_FIELD_SETS[dimensionKindForCategory(category)];
}

export type DimensionValues = Partial<Record<DimensionFieldKey, string>>;

/**
 * Compose the structured dimension parts into the single display/storage string
 * that the rest of the app already expects (e.g. "60cm x 80cm (W x H)").
 */
export function composeDimensions(category: string, values: DimensionValues): string {
  const fields = dimensionFieldsForCategory(category);
  if (fields.some((field) => field.key === "size")) {
    return (values.size ?? "").trim();
  }
  const parts = fields
    .map((field) => (values[field.key] ?? "").trim())
    .filter(Boolean)
    .map((value) => `${value}cm`);
  if (parts.length === 0) return "";
  const label = fields.length >= 3 ? "(W x H x D)" : "(W x H)";
  return `${parts.join(" x ")} ${label}`;
}

/**
 * Best-effort parse of a free-form dimension string (e.g. an AI suggestion) back
 * into structured parts for the current category, so the inputs stay in sync.
 */
export function parseDimensions(category: string, value: string): DimensionValues {
  const fields = dimensionFieldsForCategory(category);
  if (fields.some((field) => field.key === "size")) {
    return { size: value.trim() };
  }
  const numbers = value.match(/\d+(?:\.\d+)?/g) ?? [];
  const parts: DimensionValues = {};
  fields.forEach((field, index) => {
    if (numbers[index] !== undefined) parts[field.key] = numbers[index];
  });
  return parts;
}
