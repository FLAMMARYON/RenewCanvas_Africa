import {
  isOneOf,
  recyclableMaterials,
  type ImpactEstimate,
  type RecyclableMaterial,
} from "./schemas";

export const IMPACT_METHODOLOGY_VERSION = "impact-rule-v1";

export type ImpactMaterialInput = {
  type: RecyclableMaterial;
  weightKg: number;
  verifiedByImage: boolean;
  confidenceScore?: number;
};

export type ImpactCalculation = ImpactEstimate & {
  confidence: "low" | "medium" | "high";
  materialBreakdown: Array<{
    type: RecyclableMaterial;
    weightKg: number;
    co2eAvoidedKg: number;
    landfillVolumeAvoidedLitres: number;
  }>;
  plainLanguageSummary: string;
};

const MAX_MATERIAL_WEIGHT_KG = 250;
const MAX_TOTAL_WEIGHT_KG = 500;
const MAX_MATERIAL_ROWS = 50;
const MIN_MATERIAL_WEIGHT_KG = 0.001;
const allowedRootFields = new Set(["materials"]);
const allowedMaterialFields = new Set([
  "type",
  "weightKg",
  "verifiedByImage",
  "confidenceScore",
]);

const materialFactors: Record<
  RecyclableMaterial,
  {
    co2eAvoidedPerKg: number;
    landfillLitresPerKg: number;
    equivalentUnit: string;
    equivalentKg: number;
  }
> = {
  "PET bottles": {
    co2eAvoidedPerKg: 1.5,
    landfillLitresPerKg: 25,
    equivalentUnit: "500ml PET bottles reused",
    equivalentKg: 0.02,
  },
  "Bottle caps": {
    co2eAvoidedPerKg: 1.4,
    landfillLitresPerKg: 18,
    equivalentUnit: "plastic bottle caps reused",
    equivalentKg: 0.002,
  },
  Cardboard: {
    co2eAvoidedPerKg: 0.9,
    landfillLitresPerKg: 10,
    equivalentUnit: "flattened cardboard sheets reused",
    equivalentKg: 0.08,
  },
  Paper: {
    co2eAvoidedPerKg: 0.8,
    landfillLitresPerKg: 8,
    equivalentUnit: "paper sheets reused",
    equivalentKg: 0.005,
  },
  "Fabric scraps": {
    co2eAvoidedPerKg: 2.8,
    landfillLitresPerKg: 14,
    equivalentUnit: "textile scrap bundles reused",
    equivalentKg: 0.25,
  },
  "Aluminium cans": {
    co2eAvoidedPerKg: 8.5,
    landfillLitresPerKg: 16,
    equivalentUnit: "aluminium cans reused",
    equivalentKg: 0.014,
  },
  Glass: {
    co2eAvoidedPerKg: 0.35,
    landfillLitresPerKg: 4,
    equivalentUnit: "glass bottles reused",
    equivalentKg: 0.2,
  },
  "Electronic waste": {
    co2eAvoidedPerKg: 6,
    landfillLitresPerKg: 6,
    equivalentUnit: "small e-waste parts reused",
    equivalentKg: 0.1,
  },
  "Burlap/grain sacks": {
    co2eAvoidedPerKg: 1.2,
    landfillLitresPerKg: 12,
    equivalentUnit: "grain sacks reused",
    equivalentKg: 0.18,
  },
  "Plastic bags": {
    co2eAvoidedPerKg: 1.8,
    landfillLitresPerKg: 30,
    equivalentUnit: "plastic bags reused",
    equivalentKg: 0.006,
  },
  "Metal scraps": {
    co2eAvoidedPerKg: 3.2,
    landfillLitresPerKg: 5,
    equivalentUnit: "metal scrap pieces reused",
    equivalentKg: 0.15,
  },
  Other: {
    co2eAvoidedPerKg: 0.5,
    landfillLitresPerKg: 8,
    equivalentUnit: "kg of other reused material",
    equivalentKg: 1,
  },
};

function round(value: number, decimals = 6) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function validateConfidenceScore(
  value: unknown,
  field: string,
  errors: Record<string, string>
) {
  if (value === undefined) return undefined;
  if (!isFiniteNumber(value) || value < 0 || value > 1) {
    errors[field] = `${field} must be a number between 0 and 1.`;
    return undefined;
  }
  return value;
}

export function validateImpactInput(input: unknown) {
  const record =
    typeof input === "object" && input !== null
      ? (input as Record<string, unknown>)
      : {};
  const errors: Record<string, string> = {};
  const rawMaterials = Array.isArray(record.materials) ? record.materials : undefined;
  const extraRootFields = Object.keys(record).filter((field) => !allowedRootFields.has(field));

  if (extraRootFields.length > 0) {
    errors.extraFields = `Unsupported fields: ${extraRootFields.join(", ")}.`;
  }

  if (!rawMaterials || rawMaterials.length === 0) {
    errors.materials = "At least one material record is required.";
  } else if (rawMaterials.length > MAX_MATERIAL_ROWS) {
    errors.materials = `No more than ${MAX_MATERIAL_ROWS} material records are allowed.`;
  }

  const materials: ImpactMaterialInput[] = [];
  let totalWeightKg = 0;

  rawMaterials?.forEach((item, index) => {
    const prefix = `materials.${index}`;
    const material =
      typeof item === "object" && item !== null
        ? (item as Record<string, unknown>)
        : undefined;

    if (!material) {
      errors[prefix] = "Material record must be an object.";
      return;
    }

    const extraMaterialFields = Object.keys(material).filter(
      (field) => !allowedMaterialFields.has(field)
    );
    if (extraMaterialFields.length > 0) {
      errors[`${prefix}.extraFields`] = `Unsupported fields: ${extraMaterialFields.join(", ")}.`;
    }

    const type = material.type;
    const weightKg = material.weightKg;
    const verifiedByImage = material.verifiedByImage;

    if (!isOneOf(type, recyclableMaterials)) {
      errors[`${prefix}.type`] = "Unknown recyclable material type.";
    }

    if (!isFiniteNumber(weightKg)) {
      errors[`${prefix}.weightKg`] = "weightKg must be a number greater than 0.";
    } else if (weightKg < MIN_MATERIAL_WEIGHT_KG || weightKg > MAX_MATERIAL_WEIGHT_KG) {
      errors[
        `${prefix}.weightKg`
      ] = `weightKg must be at least ${MIN_MATERIAL_WEIGHT_KG} and no more than ${MAX_MATERIAL_WEIGHT_KG}.`;
    }

    if (typeof verifiedByImage !== "boolean") {
      errors[`${prefix}.verifiedByImage`] = "verifiedByImage must be boolean.";
    }

    const confidenceScore = validateConfidenceScore(
      material.confidenceScore,
      `${prefix}.confidenceScore`,
      errors
    );

    if (
      isOneOf(type, recyclableMaterials) &&
      isFiniteNumber(weightKg) &&
      weightKg >= MIN_MATERIAL_WEIGHT_KG &&
      weightKg <= MAX_MATERIAL_WEIGHT_KG &&
      typeof verifiedByImage === "boolean"
    ) {
      totalWeightKg += weightKg;
      materials.push({
        type,
        weightKg,
        verifiedByImage,
        confidenceScore,
      });
    }
  });

  if (totalWeightKg > MAX_TOTAL_WEIGHT_KG) {
    errors.totalWeightKg = `Total material weight must be no more than ${MAX_TOTAL_WEIGHT_KG} kg.`;
  }

  if (Object.keys(errors).length > 0) return { ok: false as const, errors };

  return { ok: true as const, value: { materials } };
}

function confidenceFor(materials: ImpactMaterialInput[]) {
  let verifiedCount = 0;
  let confidenceTotal = 0;
  let confidenceCount = 0;

  for (const material of materials) {
    if (material.verifiedByImage) verifiedCount += 1;
    if (material.confidenceScore !== undefined) {
      confidenceTotal += material.confidenceScore;
      confidenceCount += 1;
    }
  }

  const averageScore = confidenceCount > 0 ? confidenceTotal / confidenceCount : 0;

  if (verifiedCount === materials.length && averageScore >= 0.75) return "high";
  if (verifiedCount > 0 || averageScore >= 0.5) return "medium";
  return "low";
}

export function calculateImpactEstimate(materials: ImpactMaterialInput[]): ImpactCalculation {
  const materialBreakdown: ImpactCalculation["materialBreakdown"] = [];
  const equivalentTotals = new Map<string, number>();
  let rawKgDiverted = 0;
  let rawCo2eAvoidedKg = 0;
  let rawLandfillVolumeAvoidedLitres = 0;

  for (const material of materials) {
    const factors = materialFactors[material.type];
    const co2eAvoidedKg = material.weightKg * factors.co2eAvoidedPerKg;
    const landfillVolumeAvoidedLitres = material.weightKg * factors.landfillLitresPerKg;

    rawKgDiverted += material.weightKg;
    rawCo2eAvoidedKg += co2eAvoidedKg;
    rawLandfillVolumeAvoidedLitres += landfillVolumeAvoidedLitres;

    materialBreakdown.push({
      type: material.type,
      weightKg: round(material.weightKg),
      co2eAvoidedKg: round(co2eAvoidedKg),
      landfillVolumeAvoidedLitres: round(landfillVolumeAvoidedLitres),
    });
    const equivalentValue = Math.max(1, Math.round(material.weightKg / factors.equivalentKg));
    equivalentTotals.set(
      factors.equivalentUnit,
      (equivalentTotals.get(factors.equivalentUnit) ?? 0) + equivalentValue
    );
  }

  const kgDiverted = round(rawKgDiverted);
  const co2eAvoidedKg = round(rawCo2eAvoidedKg);
  const landfillVolumeAvoidedLitres = round(rawLandfillVolumeAvoidedLitres);
  const confidence = confidenceFor(materials);
  const hasLowImageConfidence = materials.some(
    (material) =>
      material.verifiedByImage &&
      material.confidenceScore !== undefined &&
      material.confidenceScore < 0.5
  );
  const hasMissingImageConfidence = materials.some(
    (material) => material.verifiedByImage && material.confidenceScore === undefined
  );
  const equivalents = Array.from(equivalentTotals, ([label, value]) => ({
    label,
    value,
  }));
  const assumptions = [
    "Impact figures are estimates for marketplace transparency, not certified carbon credits.",
    "CO2e and landfill factors are conservative prototype factors published in /open/impact.",
    "Image verification affects confidence only; it does not change the underlying factor math.",
  ];

  if (hasLowImageConfidence) {
    assumptions.push(
      "One or more image-verified materials had low confidence and should be reviewed manually."
    );
  }

  if (hasMissingImageConfidence) {
    assumptions.push(
      "One or more image-verified materials did not include a confidence score and should be reviewed manually."
    );
  }

  return {
    kgDiverted,
    co2eAvoidedKg,
    landfillVolumeAvoidedLitres,
    equivalents,
    methodologyVersion: IMPACT_METHODOLOGY_VERSION,
    confidence,
    materialBreakdown,
    assumptions,
    plainLanguageSummary: `${kgDiverted.toLocaleString()} kg of reclaimed material kept in productive use, with an estimated ${co2eAvoidedKg.toLocaleString()} kg CO2e avoided and ${landfillVolumeAvoidedLitres.toLocaleString()} litres of landfill volume avoided.`,
  };
}
