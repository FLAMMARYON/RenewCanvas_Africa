import assert from "node:assert/strict";
import test from "node:test";
import {
  decideVerificationReview,
  listVerificationQueue,
  submitVerificationEvidence,
  type VerificationArtworkRecord,
  type VerificationDatabase,
  type VerificationEvidenceRecord,
  type VerificationReviewRecord,
} from "@/lib/backend/verification";
import type { AuthPublicUser } from "@/lib/backend/auth";

const admin: AuthPublicUser = {
  id: "admin_1",
  email: "hello.renewcanvas.africa@gmail.com",
  name: "Admin",
  role: "admin",
  status: "active",
};

const artist: AuthPublicUser = {
  id: "artist_1",
  email: "artist@example.com",
  name: "Artist",
  role: "artist",
  status: "active",
};

test("verification queue persists review rows for submitted artworks", async () => {
  const db = createMemoryVerificationDatabase();
  const queue = await listVerificationQueue(db, admin);

  assert.equal(queue.length, 1);
  assert.equal(queue[0].reviewStatus, "pending");
  assert.equal(db.reviews.length, 1);
  assert.equal(db.reviews[0].artworkId, "artwork_1");
});

test("admin verification decisions update artwork and create audit logs", async () => {
  const db = createMemoryVerificationDatabase();
  await listVerificationQueue(db, admin);

  const result = await decideVerificationReview(db, admin, {
    artworkId: "artwork_1",
    decision: "request_more_info",
    note: "Add clearer material source photos.",
  });

  assert.equal(result.review.status, "more_info_requested");
  assert.equal(db.artworks[0].status, "under_review");
  assert.equal(db.auditLogs.length, 1);
  assert.equal(db.auditLogs[0].action, "verification.request_more_info");
});

test("artist can submit requested evidence and return review to pending", async () => {
  const db = createMemoryVerificationDatabase();
  await listVerificationQueue(db, admin);
  await decideVerificationReview(db, admin, {
    artworkId: "artwork_1",
    decision: "request_more_info",
    note: "Add clearer material source photos.",
  });

  const evidence = await submitVerificationEvidence(db, artist, {
    artworkId: "artwork_1",
    type: "material_photo",
    url: "/placeholder-artwork/material-detail.jpg",
    label: "Material detail",
    notes: "Close-up of PET bottle fragments before assembly.",
  });

  assert.equal(evidence.type, "material_photo");
  assert.equal(db.reviews[0].status, "pending");
  assert.equal(db.artworks[0].status, "submitted");
});

function createMemoryVerificationDatabase(): VerificationDatabase & {
  artworks: VerificationArtworkRecord[];
  reviews: VerificationReviewRecord[];
  auditLogs: Array<{ action: string; entityId: string }>;
} {
  const now = new Date();
  const artworks: VerificationArtworkRecord[] = [
    {
      id: "artwork_1",
      artistId: artist.id,
      slug: "ocean-waves",
      title: "Ocean Waves",
      description: "Recovered PET bottles shaped into wall art.",
      category: "Wall Art",
      status: "submitted",
      rejectionReason: null,
      kgDiverted: 2.5,
      artist,
      materials: [{ material: "PET bottles", weightKg: 2.5, isVerified: true, source: "Community cleanup" }],
      pricingRecommendations: [
        {
          currency: "RWF",
          minCents: 3200000,
          maxCents: 5400000,
          suggestedCents: 4200000,
          confidence: "medium",
          factors: [],
          explanation: "Server recommendation.",
        },
      ],
      impactEstimates: [
        {
          kgDiverted: 2.5,
          co2eAvoidedKg: 3.75,
          landfillVolumeAvoidedLitres: 62.5,
          assumptions: ["Impact figures are estimates for marketplace transparency, not certified carbon credits."],
          result: { equivalents: [], methodologyVersion: "impact-rule-v1" },
        },
      ],
      verificationReview: null,
    },
  ];
  const reviews: VerificationReviewRecord[] = [];
  const evidence: VerificationEvidenceRecord[] = [];
  const auditLogs: Array<{ action: string; entityId: string }> = [];

  const db: VerificationDatabase & {
    artworks: VerificationArtworkRecord[];
    reviews: VerificationReviewRecord[];
    auditLogs: Array<{ action: string; entityId: string }>;
  } = {
    artworks,
    reviews,
    auditLogs,
    artwork: {
      async findMany(args) {
        if (isArtistReviewWhere(args.where)) {
          return artworks
            .filter((artwork) => artwork.artistId === args.where.artistId)
            .filter((artwork) => reviewFor(artwork.id)?.status === "more_info_requested")
            .map(withReview);
        }
        return artworks.filter((artwork) => ["submitted", "under_review", "rejected"].includes(artwork.status)).map(withReview);
      },
      async findFirst(args) {
        const id = typeof args.where.id === "string" ? args.where.id : "";
        return artworks.find((artwork) => artwork.id === id) ? withReview(artworks.find((artwork) => artwork.id === id)!) : null;
      },
      async update(args) {
        const artwork = artworks.find((item) => item.id === args.where.id);
        assert.ok(artwork);
        Object.assign(artwork, args.data);
        return withReview(artwork);
      },
    },
    verificationReview: {
      async upsert(args) {
        const existing = reviewFor(args.where.artworkId);
        if (existing) {
          Object.assign(existing, args.update, { updatedAt: now });
          return withEvidence(existing);
        }
        const review: VerificationReviewRecord = {
          id: `review_${reviews.length + 1}`,
          artworkId: args.create.artworkId,
          status: args.create.status ?? "pending",
          recommendedAction: args.create.recommendedAction ?? null,
          reviewFlags: args.create.reviewFlags ?? [],
          adminNotes: null,
          artistMessage: null,
          decidedById: null,
          decidedAt: null,
          requestedInfoAt: null,
          createdAt: now,
          updatedAt: now,
          evidence: [],
        };
        reviews.push(review);
        return withEvidence(review);
      },
      async update(args) {
        const review = reviewFor(args.where.artworkId);
        assert.ok(review);
        Object.assign(review, args.data, { updatedAt: now });
        return withEvidence(review);
      },
      async findUnique(args) {
        const review = reviewFor(args.where.artworkId);
        return review ? withEvidence(review) : null;
      },
    },
    verificationEvidenceAttachment: {
      async create(args) {
        const item: VerificationEvidenceRecord = {
          id: `evidence_${evidence.length + 1}`,
          createdAt: now,
          notes: args.data.notes ?? null,
          ...args.data,
        };
        evidence.push(item);
        return item;
      },
    },
    auditLog: {
      async create(args) {
        auditLogs.push({ action: args.data.action, entityId: args.data.entityId });
        return args.data;
      },
    },
  };

  return db;

  function reviewFor(artworkId: string) {
    return reviews.find((review) => review.artworkId === artworkId);
  }

  function withReview(artwork: VerificationArtworkRecord): VerificationArtworkRecord {
    return { ...artwork, verificationReview: reviewFor(artwork.id) ? withEvidence(reviewFor(artwork.id)!) : null };
  }

  function withEvidence(review: VerificationReviewRecord): VerificationReviewRecord {
    return { ...review, evidence: evidence.filter((item) => item.reviewId === review.id) };
  }
}

function isArtistReviewWhere(where: Record<string, unknown>): where is { artistId: string; verificationReview: { status: string } } {
  return typeof where.artistId === "string";
}
