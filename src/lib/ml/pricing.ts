import {
  artistExperienceLevels,
  artworkCategories,
  artworkComplexities,
  isOneOf,
  recyclableMaterials,
  type ArtistExperienceLevel,
  type ArtworkCategory,
  type ArtworkComplexity,
  type PricingRecommendation,
  type RecyclableMaterial,
} from "./schemas";

export const PRICING_METHODOLOGY_VERSION = "pricing-rule-v1";
const MAX_PREVIOUS_ARTIST_SALES = 200;

export type PricingInput = {
  category: ArtworkCategory;
  materials: RecyclableMaterial[];
  materialWeight: number;
  complexity: ArtworkComplexity;
  experienceLevel: ArtistExperienceLevel;
  dimensions?: string;
  hoursWorked?: number;
  views?: number;
  wishlistCount?: number;
  previousArtistSales?: number[];
};

const categoryMultiplier: Record<ArtworkCategory, number> = {
  "Wall Art": 1,
  Sculpture: 1.3,
  "Home Decor": 1.1,
  Jewelry: 1.2,
  "Functional Art": 1.15,
  "Mixed Media": 1.25,
  Installation: 1.5,
  Other: 1,
};

const complexityMultiplier: Record<ArtworkComplexity, number> = {
  simple: 1,
  moderate: 1.3,
  complex: 1.8,
  very_complex: 2.5,
};

const experienceMultiplier: Record<ArtistExperienceLevel, number> = {
  emerging: 1,
  intermediate: 1.2,
  professional: 1.5,
};

const materialPremium: Partial<Record<RecyclableMaterial, number>> = {
  "Electronic waste": 1.08,
  Glass: 1.05,
  "Metal scraps": 1.05,
  "Aluminium cans": 1.04,
  "Fabric scraps": 1.03,
  "Burlap/grain sacks": 1.03,
};

function roundToThousand(value: number) {
  return Math.round(value / 1000) * 1000;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function median(values: number[]) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function boundedOptionalNumber(
  record: Record<string, unknown>,
  key: string,
  value: unknown,
  min: number,
  max: number,
  field: string,
  errors: Record<string, string>
) {
  if (!Object.hasOwn(record, key)) return undefined;
  if (typeof value !== "number" || !Number.isFinite(value)) {
    errors[field] = `${field} must be a number between ${min} and ${max}.`;
    return undefined;
  }
  if (value < min || value > max) {
    errors[field] = `${field} must be between ${min} and ${max}.`;
    return undefined;
  }
  return value;
}

export function validatePricingInput(input: unknown) {
  const record =
    typeof input === "object" && input !== null
      ? (input as Record<string, unknown>)
      : {};
  const errors: Record<string, string> = {};
  const category = record.category;
  const complexity = record.complexity;
  const experienceLevel = record.experienceLevel ?? record.artistExperienceLevel;
  const materialWeightRaw = Object.hasOwn(record, "materialWeight")
    ? record.materialWeight
    : record.materialWeightKg;
  const rawMaterials = Array.isArray(record.materials) ? record.materials : [];
  const invalidMaterials = rawMaterials.filter(
    (material) => !isOneOf(material, recyclableMaterials)
  );
  const materials = rawMaterials.filter((material): material is RecyclableMaterial =>
    isOneOf(material, recyclableMaterials)
  );

  if (!isOneOf(category, artworkCategories)) errors.category = "Invalid category.";
  if (!isOneOf(complexity, artworkComplexities)) errors.complexity = "Invalid complexity.";
  if (!isOneOf(experienceLevel, artistExperienceLevels)) {
    errors.experienceLevel = "Invalid experience level.";
  }
  if (
    typeof materialWeightRaw !== "number" ||
    !Number.isFinite(materialWeightRaw) ||
    materialWeightRaw <= 0 ||
    materialWeightRaw > 250
  ) {
    errors.materialWeight = "Material weight must be greater than 0 and no more than 250 kg.";
  }
  if (!Array.isArray(record.materials) || materials.length === 0) {
    errors.materials = "Select at least one known material.";
  } else if (invalidMaterials.length > 0) {
    errors.materials = "All materials must be known recyclable material types.";
  }

  const hoursWorked = boundedOptionalNumber(
    record,
    "hoursWorked",
    record.hoursWorked,
    0,
    500,
    "hoursWorked",
    errors
  );
  const views = boundedOptionalNumber(record, "views", record.views, 0, 100000, "views", errors);
  const wishlistCount = boundedOptionalNumber(
    record,
    "wishlistCount",
    record.wishlistCount,
    0,
    10000,
    "wishlistCount",
    errors
  );
  let dimensions: string | undefined;
  if (Object.hasOwn(record, "dimensions")) {
    if (typeof record.dimensions !== "string") {
      errors.dimensions = "dimensions must be a string no longer than 120 characters.";
    } else if (record.dimensions.length > 120) {
      errors.dimensions = "dimensions must be no longer than 120 characters.";
    } else {
      dimensions = record.dimensions;
    }
  }
  const previousArtistSales = Array.isArray(record.previousArtistSales)
    ? record.previousArtistSales
    : undefined;
  if (Object.hasOwn(record, "previousArtistSales") && previousArtistSales === undefined) {
    errors.previousArtistSales = "previousArtistSales must be an array of prices.";
  } else if (previousArtistSales && previousArtistSales.length > MAX_PREVIOUS_ARTIST_SALES) {
    errors.previousArtistSales = `previousArtistSales must include no more than ${MAX_PREVIOUS_ARTIST_SALES} prices.`;
  } else if (
    previousArtistSales?.some(
      (sale) => typeof sale !== "number" || !Number.isFinite(sale) || sale < 0 || sale > 5000000
    )
  ) {
    errors.previousArtistSales =
      "previousArtistSales must contain only prices between 0 and 5000000.";
  }

  if (Object.keys(errors).length > 0) return { ok: false as const, errors };

  return {
    ok: true as const,
    value: {
      category: category as ArtworkCategory,
      complexity: complexity as ArtworkComplexity,
      experienceLevel: experienceLevel as ArtistExperienceLevel,
      materialWeight: materialWeightRaw as number,
      materials,
      dimensions,
      hoursWorked,
      views,
      wishlistCount,
      previousArtistSales: previousArtistSales as number[] | undefined,
    } satisfies PricingInput,
  };
}

export function calculatePricingRecommendation(input: PricingInput): PricingRecommendation {
  const basePrice = 15000;
  const materialValue = input.materialWeight * 2200;
  const hoursValue = input.hoursWorked ? Math.min(input.hoursWorked, 120) * 900 : 0;
  const demandMultiplier =
    1 +
    Math.min(input.views ?? 0, 2000) / 20000 +
    Math.min(input.wishlistCount ?? 0, 250) / 1000;
  const materialMultiplier = input.materials.reduce(
    (total, material) => total * (materialPremium[material] ?? 1),
    1
  );
  const comparableMedian = median(input.previousArtistSales ?? []);
  const comparableAnchor = comparableMedian ? comparableMedian * 0.25 : 0;
  const multiplier =
    categoryMultiplier[input.category] *
    complexityMultiplier[input.complexity] *
    experienceMultiplier[input.experienceLevel] *
    materialMultiplier *
    demandMultiplier;
  const rawSuggested = basePrice * multiplier + materialValue + hoursValue + comparableAnchor;
  const suggested = clamp(roundToThousand(rawSuggested), 8000, 750000);
  const min = clamp(roundToThousand(suggested * 0.78), 8000, 750000);
  const max = clamp(roundToThousand(suggested * 1.32), 8000, 750000);
  const confidence =
    input.materials.length >= 2 && input.hoursWorked && input.previousArtistSales?.length
      ? "high"
      : input.materialWeight >= 1 && input.materials.length >= 1
      ? "medium"
      : "low";

  return {
    currency: "RWF",
    min,
    max,
    suggested,
    confidence,
    factors: [
      {
        name: "category",
        label: `${input.category} category`,
        multiplier: categoryMultiplier[input.category],
      },
      {
        name: "complexity",
        label: `${input.complexity.replace("_", " ")} complexity`,
        multiplier: complexityMultiplier[input.complexity],
      },
      {
        name: "experience",
        label: `${input.experienceLevel} artist level`,
        multiplier: experienceMultiplier[input.experienceLevel],
      },
      {
        name: "materials",
        label: `${input.materialWeight} kg recycled material value`,
        multiplier: Number(materialMultiplier.toFixed(3)),
        amountRwf: roundToThousand(materialValue),
      },
      {
        name: "labour",
        label: input.hoursWorked ? `${input.hoursWorked} hours worked` : "hours worked not supplied",
        amountRwf: roundToThousand(hoursValue),
      },
      {
        name: "demand",
        label: "views and wishlist demand signal capped at 2000 views and 250 wishlists",
        multiplier: Number(demandMultiplier.toFixed(3)),
      },
      {
        name: "comparables",
        label: comparableMedian ? "artist comparable sales anchor" : "no comparable sales supplied",
        amountRwf: roundToThousand(comparableAnchor),
      },
    ],
    explanation: `Suggested ${suggested.toLocaleString()} RWF from ${input.category.toLowerCase()}, ${input.complexity.replace(
      "_",
      " "
    )} complexity, ${input.experienceLevel} artist level, ${input.materialWeight} kg of recycled materials, labour, capped demand signals, and comparable-sale signals where available. Demand is capped at 2,000 views and 250 wishlists to reduce manipulation.`,
  };
}
