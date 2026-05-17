import { AuthError, type AuthPublicUser } from "./auth";
import { calculateImpactEstimate, IMPACT_METHODOLOGY_VERSION, type ImpactMaterialInput } from "@/lib/ml/impact";
import { calculatePricingRecommendation, PRICING_METHODOLOGY_VERSION, type PricingInput } from "@/lib/ml/pricing";
import {
  artistExperienceLevels,
  artworkCategories,
  artworkComplexities,
  isOneOf,
  recyclableMaterials,
  type ArtworkCategory,
  type RecyclableMaterial,
} from "@/lib/ml/schemas";

export type ArtworkOwnerType = "artist" | "renewcanvas";
export type ArtworkStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "listed"
  | "reserved"
  | "sold"
  | "archived";

export type ArtworkRecord = {
  id: string;
  artistId: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  ownerType: ArtworkOwnerType;
  status: ArtworkStatus;
  priceCents: number;
  currency: string;
  dimensions: string | null;
  kgDiverted: unknown;
  viewCount: number;
  favouriteCount: number;
  rejectionReason: string | null;
  submittedAt: Date | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  artist?: { id: string; name: string; email: string } | null;
  images?: Array<{ id: string; url: string; altText: string; sortOrder: number }>;
  materials?: Array<{ id: string; material: string; weightKg: unknown; source: string | null; isVerified: boolean }>;
  pricingRecommendations?: PricingRecommendationRecord[];
  impactEstimates?: ImpactEstimateRecord[];
};

export type PricingRecommendationRecord = {
  id: string;
  artworkId: string;
  artistId: string;
  methodologyVersion: string;
  currency: string;
  minCents: number;
  maxCents: number;
  suggestedCents: number;
  confidence: string;
  explanation: string;
  factors: unknown;
  input: unknown;
  createdAt: Date;
};

export type ImpactEstimateRecord = {
  id: string;
  artworkId: string;
  artistId: string;
  methodologyVersion: string;
  kgDiverted: unknown;
  co2eAvoidedKg: unknown;
  landfillVolumeAvoidedLitres: unknown;
  confidence: string;
  assumptions: string[];
  input: unknown;
  result: unknown;
  createdAt: Date;
};

type ArtworkCreateData = {
  artistId: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  ownerType: ArtworkOwnerType;
  status: ArtworkStatus;
  priceCents: number;
  currency: string;
  dimensions: string | null;
  kgDiverted: number;
  submittedAt: Date;
  images: { create: Array<{ url: string; altText: string; sortOrder: number }> };
  materials: { create: Array<{ material: string; weightKg: number; source: string | null; isVerified: boolean }> };
};

export type ArtworkDatabase = {
  user: {
    findFirst(args: { where: { role: "admin"; status?: "active" } }): Promise<{ id: string } | null>;
  };
  artwork: {
    create(args: { data: ArtworkCreateData; include: ArtworkInclude }): Promise<ArtworkRecord>;
    findMany(args: {
      where: Record<string, unknown>;
      include: ArtworkInclude;
      orderBy: Record<string, "asc" | "desc">;
      skip?: number;
      take?: number;
    }): Promise<ArtworkRecord[]>;
    count(args: { where: Record<string, unknown> }): Promise<number>;
    findFirst(args: { where: Record<string, unknown>; include: ArtworkInclude }): Promise<ArtworkRecord | null>;
    update(args: { where: { id: string }; data: Record<string, unknown>; include: ArtworkInclude }): Promise<ArtworkRecord>;
    updateMany(args: { where: Record<string, unknown>; data: Record<string, unknown> }): Promise<{ count: number }>;
    delete(args: { where: { id: string } }): Promise<ArtworkRecord>;
  };
  artworkImage: {
    deleteMany(args: { where: { artworkId: string } }): Promise<{ count: number }>;
    createMany(args: { data: Array<{ artworkId: string; url: string; altText: string; sortOrder: number }> }): Promise<{ count: number }>;
  };
  artworkMaterial: {
    deleteMany(args: { where: { artworkId: string } }): Promise<{ count: number }>;
    createMany(args: {
      data: Array<{ artworkId: string; material: string; weightKg: number; source: string | null; isVerified: boolean }>;
    }): Promise<{ count: number }>;
  };
  pricingRecommendation: {
    create(args: {
      data: {
        artworkId: string;
        artistId: string;
        methodologyVersion: string;
        currency: string;
        minCents: number;
        maxCents: number;
        suggestedCents: number;
        confidence: string;
        explanation: string;
        factors: unknown;
        input: unknown;
      };
    }): Promise<PricingRecommendationRecord>;
  };
  impactEstimate: {
    create(args: {
      data: {
        artworkId: string;
        artistId: string;
        methodologyVersion: string;
        kgDiverted: number;
        co2eAvoidedKg: number;
        landfillVolumeAvoidedLitres: number;
        confidence: string;
        assumptions: string[];
        input: unknown;
        result: unknown;
      };
    }): Promise<ImpactEstimateRecord>;
  };
};

type ArtworkInclude = {
  artist: { select: { id: true; name: true; email: true } };
  images: { orderBy: { sortOrder: "asc" } };
  materials: true;
  pricingRecommendations: { orderBy: { createdAt: "desc" }; take: 1 };
  impactEstimates: { orderBy: { createdAt: "desc" }; take: 1 };
};

export type ArtworkInput = {
  title?: string;
  description?: string;
  category?: string;
  priceAmount?: number;
  dimensions?: string;
  ownerType?: ArtworkOwnerType;
  images?: Array<{ url?: string; altText?: string }>;
  materials?: Array<{ material?: string; weightKg?: number; source?: string; isVerified?: boolean }>;
  complexity?: string;
  experienceLevel?: string;
  hoursWorked?: number;
};

export type ArtworkListQuery = {
  search?: string | null;
  category?: string | null;
  material?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  sort?: "newest" | "price_low" | "price_high" | "popular" | null;
  page?: number | null;
  pageSize?: number | null;
};

const includeArtwork = {
  artist: { select: { id: true, name: true, email: true } },
  images: { orderBy: { sortOrder: "asc" as const } },
  materials: true,
  pricingRecommendations: { orderBy: { createdAt: "desc" as const }, take: 1 },
  impactEstimates: { orderBy: { createdAt: "desc" as const }, take: 1 },
} as const;

export async function listArtworks(
  db: ArtworkDatabase,
  viewer: AuthPublicUser | null,
  scope: "marketplace" | "artist" | "admin",
  query: ArtworkListQuery = {}
) {
  const where: Record<string, unknown> = {};

  if (scope === "marketplace") {
    where.status = "listed";
  } else if (scope === "artist") {
    assertRole(viewer, "artist");
    where.artistId = viewer.id;
  } else {
    assertRole(viewer, "admin");
  }

  const filteredWhere = withMarketplaceFilters(where, query);
  const page = boundedPage(query.page);
  const pageSize = boundedPageSize(query.pageSize);
  const [items, total] = await Promise.all([
    db.artwork.findMany({
      where: filteredWhere,
      include: includeArtwork,
      orderBy: orderByFor(query.sort),
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.artwork.count({ where: filteredWhere }),
  ]);

  return {
    items,
    pagination: {
      page,
      pageSize,
      total,
      pageCount: Math.max(1, Math.ceil(total / pageSize)),
    },
  };
}

export async function getArtwork(
  db: ArtworkDatabase,
  viewer: AuthPublicUser | null,
  idOrSlug: string
) {
  const artwork = await db.artwork.findFirst({
    where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
    include: includeArtwork,
  });

  if (!artwork) {
    throw new AuthError("artwork_not_found", "Artwork was not found.", 404);
  }

  if (artwork.status !== "listed" && !canManageArtwork(viewer, artwork)) {
    throw new AuthError("artwork_not_found", "Artwork was not found.", 404);
  }

  return artwork;
}

export async function recordArtworkView(db: ArtworkDatabase, idOrSlug: string) {
  const artwork = await db.artwork.findFirst({
    where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }], status: "listed" },
    include: includeArtwork,
  });

  if (!artwork) {
    throw new AuthError("artwork_not_found", "Artwork was not found.", 404);
  }

  await db.artwork.updateMany({
    where: { id: artwork.id },
    data: { viewCount: { increment: 1 } },
  });
}

export async function createArtwork(
  db: ArtworkDatabase,
  user: AuthPublicUser,
  input: ArtworkInput
) {
  if (user.role !== "artist" && user.role !== "admin") {
    throw new AuthError("forbidden", "Only artists and admins can create artwork.", 403);
  }

  const data = normalizeArtworkInput(input);
  const ownerType = user.role === "admin" && input.ownerType === "renewcanvas" ? "renewcanvas" : "artist";
  const artistId = ownerType === "renewcanvas" ? await platformArtistId(db, user) : user.id;

  const artwork = await db.artwork.create({
    data: {
      artistId,
      slug: await uniqueSlug(db, data.title),
      title: data.title,
      description: data.description,
      category: data.category,
      ownerType,
      status: ownerType === "renewcanvas" ? "listed" : "submitted",
      priceCents: data.priceCents,
      currency: "RWF",
      dimensions: data.dimensions,
      kgDiverted: totalWeight(data.materials),
      submittedAt: new Date(),
      images: { create: data.images },
      materials: { create: data.materials },
    },
    include: includeArtwork,
  });
  await persistRecommendationSnapshots(db, artwork.id, artistId, data);
  return getArtwork(db, user, artwork.id);
}

export async function updateArtwork(
  db: ArtworkDatabase,
  user: AuthPublicUser,
  artworkId: string,
  input: ArtworkInput
) {
  const current = await getArtwork(db, user, artworkId);

  if (!canManageArtwork(user, current)) {
    throw new AuthError("forbidden", "You cannot edit this artwork.", 403);
  }

  const data = normalizeArtworkInput(input);

  await db.artworkImage.deleteMany({ where: { artworkId: current.id } });
  await db.artworkMaterial.deleteMany({ where: { artworkId: current.id } });
  await db.artworkImage.createMany({
    data: data.images.map((image) => ({ artworkId: current.id, ...image })),
  });
  await db.artworkMaterial.createMany({
    data: data.materials.map((material) => ({ artworkId: current.id, ...material })),
  });

  await db.artwork.update({
    where: { id: current.id },
    data: {
      title: data.title,
      description: data.description,
      category: data.category,
      priceCents: data.priceCents,
      dimensions: data.dimensions,
      kgDiverted: totalWeight(data.materials),
      status: user.role === "artist" ? "submitted" : current.status,
      rejectionReason: null,
      submittedAt: user.role === "artist" ? new Date() : current.submittedAt,
    },
    include: includeArtwork,
  });
  await persistRecommendationSnapshots(db, current.id, current.artistId, data);
  return getArtwork(db, user, current.id);
}

export async function deleteArtwork(db: ArtworkDatabase, user: AuthPublicUser, artworkId: string) {
  const current = await getArtwork(db, user, artworkId);
  if (!canManageArtwork(user, current)) {
    throw new AuthError("forbidden", "You cannot delete this artwork.", 403);
  }
  return db.artwork.delete({ where: { id: current.id } });
}

export async function reviewArtwork(
  db: ArtworkDatabase,
  user: AuthPublicUser,
  input: { artworkId: string; decision: "approve" | "reject"; rejectionReason?: string }
) {
  assertRole(user, "admin");
  const current = await getArtwork(db, user, input.artworkId);

  if (input.decision === "reject" && !input.rejectionReason?.trim()) {
    throw new AuthError("invalid_rejection", "Rejection reason is required.", 400);
  }

  return db.artwork.update({
    where: { id: current.id },
    data: {
      status: input.decision === "approve" ? "listed" : "rejected",
      reviewedAt: new Date(),
      rejectionReason: input.decision === "reject" ? input.rejectionReason?.trim() : null,
    },
    include: includeArtwork,
  });
}

export function normalizeArtwork(artwork: ArtworkRecord) {
  const materials = artwork.materials ?? [];
  const pricingRecommendation = artwork.pricingRecommendations?.[0] ?? null;
  const impactEstimate = artwork.impactEstimates?.[0] ?? null;
  return {
    id: artwork.id,
    slug: artwork.slug,
    title: artwork.title,
    description: artwork.description,
    category: artwork.category,
    ownerType: artwork.ownerType,
    status: artwork.status,
    priceAmount: Math.round(artwork.priceCents / 100),
    currency: artwork.currency,
    dimensions: artwork.dimensions,
    kgDiverted: decimalNumber(artwork.kgDiverted),
    viewCount: artwork.viewCount,
    favouriteCount: artwork.favouriteCount,
    rejectionReason: artwork.rejectionReason,
    submittedAt: artwork.submittedAt?.toISOString() ?? null,
    reviewedAt: artwork.reviewedAt?.toISOString() ?? null,
    createdAt: artwork.createdAt.toISOString(),
    artist: artwork.artist
      ? { id: artwork.artist.id, name: artwork.artist.name, email: artwork.artist.email }
      : null,
    images: (artwork.images ?? []).map((image) => ({
      id: image.id,
      url: image.url,
      altText: image.altText,
      sortOrder: image.sortOrder,
    })),
    materials: materials.map((material) => ({
      id: material.id,
      material: material.material,
      weightKg: decimalNumber(material.weightKg),
      source: material.source,
      isVerified: material.isVerified,
    })),
    latestPricingRecommendation: pricingRecommendation
      ? {
          id: pricingRecommendation.id,
          methodologyVersion: pricingRecommendation.methodologyVersion,
          currency: pricingRecommendation.currency,
          min: Math.round(pricingRecommendation.minCents / 100),
          max: Math.round(pricingRecommendation.maxCents / 100),
          suggested: Math.round(pricingRecommendation.suggestedCents / 100),
          confidence: pricingRecommendation.confidence,
          explanation: pricingRecommendation.explanation,
          factors: pricingRecommendation.factors,
          input: pricingRecommendation.input,
          createdAt: pricingRecommendation.createdAt.toISOString(),
        }
      : null,
    latestImpactEstimate: impactEstimate
      ? {
          id: impactEstimate.id,
          methodologyVersion: impactEstimate.methodologyVersion,
          kgDiverted: decimalNumber(impactEstimate.kgDiverted),
          co2eAvoidedKg: decimalNumber(impactEstimate.co2eAvoidedKg),
          landfillVolumeAvoidedLitres: decimalNumber(impactEstimate.landfillVolumeAvoidedLitres),
          confidence: impactEstimate.confidence,
          assumptions: impactEstimate.assumptions,
          input: impactEstimate.input,
          result: impactEstimate.result,
          createdAt: impactEstimate.createdAt.toISOString(),
        }
      : null,
  };
}

function normalizeArtworkInput(input: ArtworkInput) {
  const title = cleanText(input.title, 120);
  const description = cleanText(input.description, 1200);
  const category = cleanText(input.category, 80);
  const priceAmount = boundedNumber(input.priceAmount, 1, 1_000_000_000);

  if (!title || !description || !category || !priceAmount) {
    throw new AuthError("invalid_artwork", "Artwork title, description, category, and price are required.", 400);
  }

  const materials = (input.materials ?? [])
    .map((material) => ({
      material: cleanText(material.material, 80),
      weightKg: boundedNumber(material.weightKg, 0.01, 10_000),
      source: cleanText(material.source, 100),
      isVerified: material.isVerified === true,
    }))
    .filter((material): material is { material: string; weightKg: number; source: string | null; isVerified: boolean } =>
      Boolean(material.material && material.weightKg)
    );

  if (materials.length === 0) {
    throw new AuthError("invalid_materials", "At least one material with weight is required.", 400);
  }

  const images = (input.images?.length ? input.images : [{ url: "/placeholder-artwork/ocean-waves.jpg" }]).map(
    (image, index) => ({
      url: cleanUrl(image.url) ?? "/placeholder-artwork/ocean-waves.jpg",
      altText: cleanText(image.altText, 140) ?? `${title} image ${index + 1}`,
      sortOrder: index,
    })
  );

  return {
    title,
    description,
    category,
    priceCents: Math.round(priceAmount * 100),
    dimensions: cleanText(input.dimensions, 100),
    images,
    materials,
    complexity: isOneOf(input.complexity, artworkComplexities) ? input.complexity : "moderate",
    experienceLevel: isOneOf(input.experienceLevel, artistExperienceLevels) ? input.experienceLevel : "intermediate",
    hoursWorked: boundedNumber(input.hoursWorked, 0, 500) ?? undefined,
  };
}

async function persistRecommendationSnapshots(
  db: ArtworkDatabase,
  artworkId: string,
  artistId: string,
  data: ReturnType<typeof normalizeArtworkInput>
) {
  const pricingInput = pricingInputFor(data);
  const pricing = calculatePricingRecommendation(pricingInput);
  await db.pricingRecommendation.create({
    data: {
      artworkId,
      artistId,
      methodologyVersion: PRICING_METHODOLOGY_VERSION,
      currency: pricing.currency,
      minCents: pricing.min * 100,
      maxCents: pricing.max * 100,
      suggestedCents: pricing.suggested * 100,
      confidence: pricing.confidence,
      explanation: pricing.explanation,
      factors: pricing.factors,
      input: pricingInput,
    },
  });

  const impactInput = impactInputFor(data.materials);
  const impact = calculateImpactEstimate(impactInput.materials);
  await db.impactEstimate.create({
    data: {
      artworkId,
      artistId,
      methodologyVersion: IMPACT_METHODOLOGY_VERSION,
      kgDiverted: impact.kgDiverted,
      co2eAvoidedKg: impact.co2eAvoidedKg,
      landfillVolumeAvoidedLitres: impact.landfillVolumeAvoidedLitres,
      confidence: impact.confidence,
      assumptions: impact.assumptions,
      input: impactInput,
      result: impact,
    },
  });
}

function pricingInputFor(data: ReturnType<typeof normalizeArtworkInput>): PricingInput {
  return {
    category: categoryFor(data.category),
    materials: materialsFor(data.materials.map((material) => material.material)),
    materialWeight: totalWeight(data.materials),
    complexity: data.complexity,
    experienceLevel: data.experienceLevel,
    dimensions: data.dimensions ?? undefined,
    hoursWorked: data.hoursWorked,
    views: 0,
    wishlistCount: 0,
    previousArtistSales: [],
  };
}

function impactInputFor(materials: ReturnType<typeof normalizeArtworkInput>["materials"]) {
  return {
    materials: materials.map((material): ImpactMaterialInput => ({
      type: materialFor(material.material),
      weightKg: material.weightKg,
      verifiedByImage: material.isVerified,
    })),
  };
}

function categoryFor(value: string): ArtworkCategory {
  return isOneOf(value, artworkCategories) ? value : "Other";
}

function materialsFor(values: string[]): RecyclableMaterial[] {
  const materials = values.map(materialFor);
  return materials.length > 0 ? materials : ["Other"];
}

function materialFor(value: string): RecyclableMaterial {
  return isOneOf(value, recyclableMaterials) ? value : "Other";
}

async function uniqueSlug(db: ArtworkDatabase, title: string): Promise<string> {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || "artwork";
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
}

async function platformArtistId(db: ArtworkDatabase, user: AuthPublicUser): Promise<string> {
  const admin = await db.user.findFirst({ where: { role: "admin", status: "active" } });
  return admin?.id ?? user.id;
}

function canManageArtwork(user: AuthPublicUser | null, artwork: ArtworkRecord): boolean {
  return user?.role === "admin" || (user?.role === "artist" && artwork.artistId === user.id);
}

function withMarketplaceFilters(where: Record<string, unknown>, query: ArtworkListQuery) {
  const filters: Record<string, unknown> = { ...where };
  const AND: Array<Record<string, unknown>> = [];

  const search = cleanText(query.search, 100);
  if (search) {
    AND.push({
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
        { artist: { name: { contains: search, mode: "insensitive" } } },
      ],
    });
  }

  const category = cleanText(query.category, 80);
  if (category && category !== "All") filters.category = category;

  const material = cleanText(query.material, 80);
  if (material && material !== "All") {
    filters.materials = { some: { material: { contains: material, mode: "insensitive" } } };
  }

  const minPrice = boundedNumber(query.minPrice, 0, 1_000_000_000);
  const maxPrice = boundedNumber(query.maxPrice, 0, 1_000_000_000);
  if (minPrice || maxPrice) {
    filters.priceCents = {
      ...(minPrice ? { gte: Math.round(minPrice * 100) } : {}),
      ...(maxPrice ? { lte: Math.round(maxPrice * 100) } : {}),
    };
  }

  if (AND.length > 0) filters.AND = AND;
  return filters;
}

function orderByFor(sort: ArtworkListQuery["sort"]): Record<string, "asc" | "desc"> {
  if (sort === "price_low") return { priceCents: "asc" };
  if (sort === "price_high") return { priceCents: "desc" };
  if (sort === "popular") return { favouriteCount: "desc" };
  return { createdAt: "desc" };
}

function boundedPage(value: unknown): number {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? Math.min(page, 1000) : 1;
}

function boundedPageSize(value: unknown): number {
  const pageSize = Number(value);
  return Number.isInteger(pageSize) && pageSize > 0 ? Math.min(pageSize, 48) : 12;
}

function assertRole(user: AuthPublicUser | null, role: AuthPublicUser["role"]): asserts user is AuthPublicUser {
  if (!user || user.role !== role) {
    throw new AuthError("forbidden", "You do not have access to this resource.", 403);
  }
}

function totalWeight(materials: Array<{ weightKg: number }>): number {
  return Number(materials.reduce((sum, material) => sum + material.weightKg, 0).toFixed(2));
}

function cleanText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : null;
}

function cleanUrl(value: unknown): string | null {
  const url = cleanText(value, 300);
  if (!url || (!url.startsWith("/") && !/^https?:\/\//.test(url))) return null;
  return url;
}

function boundedNumber(value: unknown, min: number, max: number): number | null {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number) || number < min) return null;
  return Math.min(number, max);
}

function decimalNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (value && typeof value === "object" && "toString" in value) return Number(value.toString());
  return Number(value) || 0;
}
