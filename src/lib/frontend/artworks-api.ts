export type FrontendArtwork = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  ownerType: "artist" | "renewcanvas";
  status: string;
  priceAmount: number;
  currency: string;
  dimensions: string | null;
  kgDiverted: number;
  viewCount: number;
  favouriteCount: number;
  rejectionReason: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  createdAt: string;
  artist: { id: string; name: string; email: string } | null;
  images: Array<{ id: string; url: string; altText: string; sortOrder: number }>;
  materials: Array<{ id: string; material: string; weightKg: number; source: string | null; isVerified: boolean }>;
  latestPricingRecommendation: {
    id: string;
    methodologyVersion: string;
    currency: string;
    min: number;
    max: number;
    suggested: number;
    confidence: string;
    explanation: string;
    factors: unknown;
    input: unknown;
    createdAt: string;
  } | null;
  latestImpactEstimate: {
    id: string;
    methodologyVersion: string;
    kgDiverted: number;
    co2eAvoidedKg: number;
    landfillVolumeAvoidedLitres: number;
    confidence: string;
    assumptions: string[];
    input: unknown;
    result: unknown;
    createdAt: string;
  } | null;
};

type ArtworkListResponse = {
  ok: boolean;
  artworks: FrontendArtwork[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    pageCount: number;
  };
  message?: string;
};

type ArtworkResponse = {
  ok: boolean;
  artwork: FrontendArtwork;
  message?: string;
};

export type ArtworkPayload = {
  title: string;
  description: string;
  category: string;
  priceAmount: number;
  dimensions?: string;
  ownerType?: "artist" | "renewcanvas";
  images?: Array<{ url: string; altText?: string }>;
  materials: Array<{ material: string; weightKg: number; source?: string; isVerified?: boolean }>;
  complexity?: string;
  experienceLevel?: string;
  hoursWorked?: number;
};

export type ArtworkListParams = {
  scope?: "marketplace" | "artist" | "admin";
  search?: string;
  category?: string;
  material?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "price_low" | "price_high" | "popular";
  page?: number;
  pageSize?: number;
};

export async function listArtworks(scopeOrParams: "marketplace" | "artist" | "admin" | ArtworkListParams = "marketplace") {
  const params = typeof scopeOrParams === "string" ? { scope: scopeOrParams } : scopeOrParams;
  const searchParams = new URLSearchParams();
  if (params.scope && params.scope !== "marketplace") searchParams.set("scope", params.scope);
  for (const key of ["search", "category", "material", "sort"] as const) {
    if (params[key]) searchParams.set(key, String(params[key]));
  }
  for (const key of ["minPrice", "maxPrice", "page", "pageSize"] as const) {
    if (typeof params[key] === "number") searchParams.set(key, String(params[key]));
  }
  const query = searchParams.toString() ? `?${searchParams}` : "";
  const response = await fetch(`/api/artworks${query}`, { credentials: "include" });
  const payload = (await response.json()) as ArtworkListResponse;
  if (!response.ok || !payload.ok) throw new Error(payload.message ?? "Could not load artworks.");
  return { artworks: payload.artworks, pagination: payload.pagination ?? { page: 1, pageSize: payload.artworks.length, total: payload.artworks.length, pageCount: 1 } };
}

export async function readArtwork(id: string) {
  const response = await fetch(`/api/artworks/${encodeURIComponent(id)}`, { credentials: "include" });
  const payload = (await response.json()) as ArtworkResponse;
  if (!response.ok || !payload.ok) throw new Error(payload.message ?? "Could not load artwork.");
  return payload.artwork;
}

export async function createArtwork(payload: ArtworkPayload) {
  return sendArtwork("/api/artworks", "POST", payload);
}

export async function updateArtwork(id: string, payload: ArtworkPayload) {
  return sendArtwork(`/api/artworks/${encodeURIComponent(id)}`, "PATCH", payload);
}

export async function deleteArtwork(id: string) {
  const response = await fetch(`/api/artworks/${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "include",
  });
  const payload = (await response.json()) as { ok: boolean; message?: string };
  if (!response.ok || !payload.ok) throw new Error(payload.message ?? "Could not delete artwork.");
}

export async function reviewArtwork(id: string, decision: "approve" | "reject", rejectionReason?: string) {
  const response = await fetch(`/api/artworks/${encodeURIComponent(id)}/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ decision, rejectionReason }),
  });
  const payload = (await response.json()) as ArtworkResponse;
  if (!response.ok || !payload.ok) throw new Error(payload.message ?? "Could not review artwork.");
  return payload.artwork;
}

export async function recordArtworkView(id: string) {
  await fetch(`/api/artworks/${encodeURIComponent(id)}/view`, {
    method: "POST",
    credentials: "include",
  });
}

async function sendArtwork(url: string, method: "POST" | "PATCH", body: ArtworkPayload) {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const payload = (await response.json()) as ArtworkResponse;
  if (!response.ok || !payload.ok) throw new Error(payload.message ?? "Could not save artwork.");
  return payload.artwork;
}

type RecommendationsResponse = {
  ok: boolean;
  artworks: FrontendArtwork[];
  source: "personalized" | "recent";
  message?: string;
};

export async function listRecommendations(): Promise<{ artworks: FrontendArtwork[]; source: "personalized" | "recent" }> {
  const response = await fetch("/api/marketplace/recommendations", { credentials: "include" });
  const payload = (await response.json()) as RecommendationsResponse;
  if (!response.ok || !payload.ok) throw new Error(payload.message ?? "Could not load recommendations.");
  return { artworks: payload.artworks, source: payload.source };
}
