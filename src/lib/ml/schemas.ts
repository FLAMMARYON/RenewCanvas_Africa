export const artworkCategories = [
  "Wall Art",
  "Sculpture",
  "Home Decor",
  "Jewelry",
  "Functional Art",
  "Mixed Media",
  "Installation",
  "Other",
] as const;

export const recyclableMaterials = [
  "PET bottles",
  "Bottle caps",
  "Cardboard",
  "Paper",
  "Fabric scraps",
  "Aluminium cans",
  "Glass",
  "Electronic waste",
  "Burlap/grain sacks",
  "Plastic bags",
  "Metal scraps",
  "Other",
] as const;

export const artworkComplexities = [
  "simple",
  "moderate",
  "complex",
  "very_complex",
] as const;

export const artistExperienceLevels = [
  "emerging",
  "intermediate",
  "professional",
] as const;

export type ArtworkCategory = (typeof artworkCategories)[number];
export type RecyclableMaterial = (typeof recyclableMaterials)[number];
export type ArtworkComplexity = (typeof artworkComplexities)[number];
export type ArtistExperienceLevel = (typeof artistExperienceLevels)[number];

export type ArtworkRecord = {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  category: ArtworkCategory;
  materials: RecyclableMaterial[];
  materialWeightKg: number;
  dimensions?: string;
  complexity: ArtworkComplexity;
  artistExperienceLevel: ArtistExperienceLevel;
  hoursWorked?: number;
  sourceOfMaterials?: string;
  verificationStatus: "unverified" | "needs_review" | "verified" | "rejected";
  impactEstimate?: ImpactEstimate;
  mlTags: string[];
  embeddingId?: string;
  pricingRecommendation?: PricingRecommendation;
  imageUrls: string[];
  priceRwf?: number;
  views?: number;
  wishlistCount?: number;
  previousArtistSales?: number[];
};

export type PricingRecommendation = {
  currency: "RWF";
  min: number;
  max: number;
  suggested: number;
  confidence: "low" | "medium" | "high";
  factors: Array<{
    name: string;
    label: string;
    multiplier?: number;
    amountRwf?: number;
  }>;
  explanation: string;
};

export type MaterialRecord = {
  type: RecyclableMaterial;
  weightKg: number;
  source?: string;
  collectionMethod?: string;
  verifiedByImage: boolean;
  confidenceScore: number;
  co2eAvoidedKg: number;
};

export type ImpactEstimate = {
  kgDiverted: number;
  co2eAvoidedKg: number;
  landfillVolumeAvoidedLitres: number;
  equivalents: Array<{
    label: string;
    value: number;
  }>;
  methodologyVersion: string;
  assumptions: string[];
};

export type ImpactCertificate = {
  artworkId: string;
  materialSummary: Array<Pick<MaterialRecord, "type" | "weightKg">>;
  kgDiverted: number;
  verificationStatus: ArtworkRecord["verificationStatus"];
  saleTimestamp?: string;
  certificateHash: string;
};

export function isOneOf<T extends readonly string[]>(
  value: unknown,
  options: T
): value is T[number] {
  return typeof value === "string" && options.includes(value);
}
