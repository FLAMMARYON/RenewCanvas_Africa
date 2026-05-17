import { AuthError, type AuthPublicUser } from "./auth";
import { buildVerificationQueue, type VerificationArtworkInput } from "@/lib/ml/verification";
import { curateMuseum } from "@/lib/ml/curator";
import { defaultP1VerificationCopy } from "@/lib/i18n/p1-verification";
import { isOneOf, artworkCategories, recyclableMaterials, type ArtworkCategory, type RecyclableMaterial } from "@/lib/ml/schemas";

export type VerificationReviewStatus = "pending" | "approved" | "rejected" | "more_info_requested";
export type VerificationDecision = "approve" | "reject" | "request_more_info";
export type VerificationEvidenceType = "material_photo" | "process_photo" | "identity_document" | "note" | "other";

export type VerificationArtworkRecord = {
  id: string;
  artistId: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  status: string;
  rejectionReason: string | null;
  kgDiverted: unknown;
  artist?: { id: string; name: string; email: string } | null;
  materials?: Array<{ material: string; weightKg: unknown; isVerified: boolean; source: string | null }>;
  pricingRecommendations?: Array<{
    currency: string;
    minCents: number;
    maxCents: number;
    suggestedCents: number;
    confidence: "low" | "medium" | "high" | string;
    factors: unknown;
    explanation: string;
  }>;
  impactEstimates?: Array<{
    kgDiverted: unknown;
    co2eAvoidedKg: unknown;
    landfillVolumeAvoidedLitres: unknown;
    assumptions: string[];
    result: unknown;
  }>;
  verificationReview?: VerificationReviewRecord | null;
};

export type VerificationReviewRecord = {
  id: string;
  artworkId: string;
  status: VerificationReviewStatus;
  recommendedAction: string | null;
  reviewFlags: string[];
  adminNotes: string | null;
  artistMessage: string | null;
  decidedById: string | null;
  decidedAt: Date | null;
  requestedInfoAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  evidence?: VerificationEvidenceRecord[];
};

export type VerificationEvidenceRecord = {
  id: string;
  reviewId: string;
  artworkId: string;
  uploaderId: string;
  type: VerificationEvidenceType;
  url: string;
  label: string;
  notes: string | null;
  createdAt: Date;
};

type VerificationInclude = {
  artist: { select: { id: true; name: true; email: true } };
  materials: true;
  pricingRecommendations: { orderBy: { createdAt: "desc" }; take: 1 };
  impactEstimates: { orderBy: { createdAt: "desc" }; take: 1 };
  verificationReview: { include: { evidence: { orderBy: { createdAt: "desc" } } } };
};

export type VerificationDatabase = {
  artwork: {
    findMany(args: {
      where: Record<string, unknown>;
      include: VerificationInclude;
      orderBy: { submittedAt?: "asc" | "desc"; updatedAt?: "asc" | "desc"; createdAt?: "asc" | "desc" };
    }): Promise<VerificationArtworkRecord[]>;
    findFirst(args: { where: Record<string, unknown>; include: VerificationInclude }): Promise<VerificationArtworkRecord | null>;
    update(args: {
      where: { id: string };
      data: Record<string, unknown>;
      include?: VerificationInclude;
    }): Promise<VerificationArtworkRecord>;
  };
  verificationReview: {
    upsert(args: {
      where: { artworkId: string };
      update: Partial<VerificationReviewRecord>;
      create: {
        artworkId: string;
        status?: VerificationReviewStatus;
        recommendedAction?: string;
        reviewFlags?: string[];
      };
      include?: { evidence: { orderBy: { createdAt: "desc" } } };
    }): Promise<VerificationReviewRecord>;
    update(args: {
      where: { artworkId: string };
      data: Partial<VerificationReviewRecord>;
      include?: { evidence: { orderBy: { createdAt: "desc" } } };
    }): Promise<VerificationReviewRecord>;
    findUnique(args: {
      where: { artworkId: string };
      include: { evidence: { orderBy: { createdAt: "desc" } } };
    }): Promise<VerificationReviewRecord | null>;
  };
  verificationEvidenceAttachment: {
    create(args: {
      data: {
        reviewId: string;
        artworkId: string;
        uploaderId: string;
        type: VerificationEvidenceType;
        url: string;
        label: string;
        notes?: string;
      };
    }): Promise<VerificationEvidenceRecord>;
  };
  auditLog: {
    create(args: {
      data: {
        actorId: string;
        action: string;
        entity: string;
        entityId: string;
        metadata?: unknown;
      };
    }): Promise<unknown>;
  };
};

const verificationInclude = {
  artist: { select: { id: true, name: true, email: true } },
  materials: true,
  pricingRecommendations: { orderBy: { createdAt: "desc" as const }, take: 1 },
  impactEstimates: { orderBy: { createdAt: "desc" as const }, take: 1 },
  verificationReview: { include: { evidence: { orderBy: { createdAt: "desc" as const } } } },
} as const;

export async function listVerificationQueue(db: VerificationDatabase, user: AuthPublicUser) {
  if (user.role !== "admin" && user.role !== "artist") {
    throw new AuthError("forbidden", "Only artists and admins can view verification reviews.", 403);
  }

  const artworks = await db.artwork.findMany({
    where:
      user.role === "admin"
        ? { status: { in: ["submitted", "under_review", "rejected"] } }
        : { artistId: user.id, verificationReview: { status: "more_info_requested" } },
    include: verificationInclude,
    orderBy: { submittedAt: "desc" },
  });

  const queueItems = queueForArtworks(artworks);
  const reviews = await Promise.all(
    artworks.map((artwork) => ensureReview(db, artwork, queueItems.get(artwork.id)))
  );

  return artworks.map((artwork, index) => normalizeVerificationItem(artwork, reviews[index], queueItems.get(artwork.id)));
}

export type VerificationDecisionResult = {
  review: VerificationReviewRecord;
  artwork: {
    id: string;
    title: string;
    artistId: string;
    artistName: string;
    artistEmail: string;
  };
  decision: VerificationDecision;
  note: string | null;
};

export async function decideVerificationReview(
  db: VerificationDatabase,
  admin: AuthPublicUser,
  input: { artworkId: string; decision: VerificationDecision; note?: string },
  now = new Date()
): Promise<VerificationDecisionResult> {
  if (admin.role !== "admin") {
    throw new AuthError("forbidden", "Only admins can decide verification reviews.", 403);
  }

  const artwork = await db.artwork.findFirst({
    where: { id: input.artworkId },
    include: verificationInclude,
  });
  if (!artwork) throw new AuthError("not_found", "Artwork was not found.", 404);

  const queueItem = queueForArtworks([artwork]).get(artwork.id);
  await ensureReview(db, artwork, queueItem);
  const note = normalizeOptionalText(input.note) ?? null;

  if (input.decision === "reject" && !note) {
    throw new AuthError("missing_note", "A rejection note is required.", 400);
  }
  if (input.decision === "request_more_info" && !note) {
    throw new AuthError("missing_note", "Describe what the artist needs to provide.", 400);
  }

  const status: VerificationReviewStatus =
    input.decision === "approve" ? "approved" : input.decision === "reject" ? "rejected" : "more_info_requested";
  const artworkStatus = input.decision === "approve" ? "listed" : input.decision === "reject" ? "rejected" : "under_review";

  const review = await db.verificationReview.update({
    where: { artworkId: artwork.id },
    data: {
      status,
      adminNotes: note,
      decidedById: admin.id,
      decidedAt: now,
      requestedInfoAt: input.decision === "request_more_info" ? now : null,
      recommendedAction: queueItem?.recommendedAction ?? null,
      reviewFlags: queueItem?.reviewFlags ?? [],
    },
    include: { evidence: { orderBy: { createdAt: "desc" } } },
  });

  await db.artwork.update({
    where: { id: artwork.id },
    data: {
      status: artworkStatus,
      rejectionReason: input.decision === "reject" ? note : null,
      reviewedAt: input.decision === "request_more_info" ? null : now,
    },
  });

  await db.auditLog.create({
    data: {
      actorId: admin.id,
      action: `verification.${input.decision}`,
      entity: "Artwork",
      entityId: artwork.id,
      metadata: { note, reviewId: review.id, previousStatus: artwork.status, nextStatus: artworkStatus },
    },
  });

  return {
    review,
    artwork: {
      id: artwork.id,
      title: artwork.title,
      artistId: artwork.artistId,
      artistName: artwork.artist?.name ?? "Artist",
      artistEmail: artwork.artist?.email ?? "",
    },
    decision: input.decision,
    note,
  };
}

export async function submitVerificationEvidence(
  db: VerificationDatabase,
  artist: AuthPublicUser,
  input: { artworkId: string; type?: VerificationEvidenceType; url?: string; label?: string; notes?: string }
) {
  if (artist.role !== "artist") {
    throw new AuthError("forbidden", "Only artists can submit verification evidence.", 403);
  }

  const artwork = await db.artwork.findFirst({
    where: { id: input.artworkId },
    include: verificationInclude,
  });
  if (!artwork || artwork.artistId !== artist.id) {
    throw new AuthError("not_found", "Verification review was not found.", 404);
  }

  const review = artwork.verificationReview ?? (await ensureReview(db, artwork, queueForArtworks([artwork]).get(artwork.id)));
  if (review.status !== "more_info_requested") {
    throw new AuthError("invalid_status", "Evidence can only be added after an admin requests more information.", 400);
  }

  const url = normalizeUrl(input.url);
  const label = normalizeText(input.label, 120);
  if (!url || !label) {
    throw new AuthError("invalid_evidence", "Evidence URL and label are required.", 400);
  }

  const evidence = await db.verificationEvidenceAttachment.create({
    data: {
      reviewId: review.id,
      artworkId: artwork.id,
      uploaderId: artist.id,
      type: isEvidenceType(input.type) ? input.type : "other",
      url,
      label,
      notes: normalizeOptionalText(input.notes),
    },
  });

  await db.verificationReview.update({
    where: { artworkId: artwork.id },
    data: {
      status: "pending",
      artistMessage: normalizeOptionalText(input.notes) ?? null,
    },
  });
  await db.artwork.update({ where: { id: artwork.id }, data: { status: "submitted" } });

  return evidence;
}

function queueForArtworks(artworks: VerificationArtworkRecord[]) {
  const inputs = artworks.map(verificationInputFor);
  const curationPlan = curateMuseum({
    artworks: inputs.map((artwork) => ({
      id: artwork.id,
      title: artwork.title,
      artistName: artwork.artistName,
      category: artwork.category,
      materials: artwork.materials,
      kgDiverted: artwork.impactEstimate?.kgDiverted ?? artwork.materialWeightKg,
    })),
  });
  const queue = buildVerificationQueue(inputs, curationPlan, defaultP1VerificationCopy.queue);
  return new Map(queue.map((item) => [item.artworkId, item]));
}

async function ensureReview(
  db: VerificationDatabase,
  artwork: VerificationArtworkRecord,
  queueItem: ReturnType<typeof buildVerificationQueue>[number] | undefined
) {
  return db.verificationReview.upsert({
    where: { artworkId: artwork.id },
    update: {
      recommendedAction: queueItem?.recommendedAction ?? null,
      reviewFlags: queueItem?.reviewFlags ?? [],
    },
    create: {
      artworkId: artwork.id,
      status: "pending",
      recommendedAction: queueItem?.recommendedAction,
      reviewFlags: queueItem?.reviewFlags ?? [],
    },
    include: { evidence: { orderBy: { createdAt: "desc" } } },
  });
}

function normalizeVerificationItem(
  artwork: VerificationArtworkRecord,
  review: VerificationReviewRecord,
  queueItem: ReturnType<typeof buildVerificationQueue>[number] | undefined
) {
  return {
    id: review.id,
    artworkId: artwork.id,
    title: artwork.title,
    slug: artwork.slug,
    artist: artwork.artist ?? null,
    artworkStatus: artwork.status,
    reviewStatus: review.status,
    adminNotes: review.adminNotes,
    artistMessage: review.artistMessage,
    decidedById: review.decidedById,
    decidedAt: review.decidedAt?.toISOString() ?? null,
    requestedInfoAt: review.requestedInfoAt?.toISOString() ?? null,
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
    recommendedAction: queueItem?.recommendedAction ?? review.recommendedAction,
    reviewFlags: queueItem?.reviewFlags ?? review.reviewFlags,
    pricingStatus: queueItem?.pricingStatus ?? "missing",
    impactStatus: queueItem?.impactStatus ?? "missing",
    museumStatus: queueItem?.museumStatus ?? "missing",
    museumRoom: queueItem?.museumRoom ?? null,
    plainLanguageSummary: queueItem?.plainLanguageSummary ?? "",
    evidence: (review.evidence ?? []).map((item) => ({
      id: item.id,
      type: item.type,
      url: item.url,
      label: item.label,
      notes: item.notes,
      createdAt: item.createdAt.toISOString(),
    })),
  };
}

function verificationInputFor(artwork: VerificationArtworkRecord): VerificationArtworkInput {
  const materials = (artwork.materials ?? []).map((item) => materialFor(item.material));
  const pricing = artwork.pricingRecommendations?.[0];
  const impact = artwork.impactEstimates?.[0];

  return {
    id: artwork.id,
    title: artwork.title,
    artistName: artwork.artist?.name ?? "Unknown artist",
    category: categoryFor(artwork.category),
    materials: materials.length > 0 ? materials : ["Other"],
    materialWeightKg: Number((artwork.materials ?? []).reduce((sum, item) => sum + decimalNumber(item.weightKg), 0).toFixed(3)),
    verificationStatus:
      artwork.status === "rejected"
        ? "rejected"
        : artwork.status === "under_review"
        ? "needs_review"
        : "unverified",
    pricingRecommendation: pricing
      ? {
          currency: "RWF",
          min: Math.round(pricing.minCents / 100),
          max: Math.round(pricing.maxCents / 100),
          suggested: Math.round(pricing.suggestedCents / 100),
          confidence: pricing.confidence === "high" || pricing.confidence === "low" ? pricing.confidence : "medium",
          factors: Array.isArray(pricing.factors) ? pricing.factors : [],
          explanation: pricing.explanation,
        }
      : undefined,
    impactEstimate: impact
      ? {
          kgDiverted: decimalNumber(impact.kgDiverted),
          co2eAvoidedKg: decimalNumber(impact.co2eAvoidedKg),
          landfillVolumeAvoidedLitres: decimalNumber(impact.landfillVolumeAvoidedLitres),
          equivalents:
            impact.result && typeof impact.result === "object" && "equivalents" in impact.result && Array.isArray(impact.result.equivalents)
              ? impact.result.equivalents
              : [],
          methodologyVersion:
            impact.result && typeof impact.result === "object" && "methodologyVersion" in impact.result
              ? String(impact.result.methodologyVersion)
              : "impact-rule-v1",
          assumptions: impact.assumptions,
        }
      : undefined,
  };
}

function categoryFor(value: string): ArtworkCategory {
  return isOneOf(value, artworkCategories) ? value : "Other";
}

function materialFor(value: string): RecyclableMaterial {
  return isOneOf(value, recyclableMaterials) ? value : "Other";
}

function isEvidenceType(value: unknown): value is VerificationEvidenceType {
  return ["material_photo", "process_photo", "identity_document", "note", "other"].includes(String(value));
}

function normalizeText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : null;
}

function normalizeOptionalText(value: unknown): string | undefined {
  return normalizeText(value, 2000) ?? undefined;
}

function normalizeUrl(value: unknown): string | null {
  const url = normalizeText(value, 500);
  if (!url || (!url.startsWith("/") && !/^https?:\/\//.test(url))) return null;
  return url;
}

function decimalNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (value && typeof value === "object" && "toString" in value) return Number(value.toString());
  return Number(value) || 0;
}
