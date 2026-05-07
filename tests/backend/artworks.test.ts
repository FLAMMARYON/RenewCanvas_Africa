import assert from "node:assert/strict";
import test from "node:test";
import {
  createArtwork,
  getArtwork,
  listArtworks,
  normalizeArtwork,
  reviewArtwork,
  updateArtwork,
  type ArtworkDatabase,
  type ArtworkRecord,
} from "@/lib/backend/artworks";
import type { AuthPublicUser } from "@/lib/backend/auth";

const artist: AuthPublicUser = {
  id: "artist_1",
  email: "artist@example.com",
  name: "Artist",
  role: "artist",
  status: "active",
};

const admin: AuthPublicUser = {
  id: "admin_1",
  email: "admin@example.com",
  name: "Admin",
  role: "admin",
  status: "active",
};

test("artist creates submitted artwork with material impact records", async () => {
  const db = createMemoryArtworkDatabase();
  const artwork = await createArtwork(db, artist, validArtworkInput());

  assert.equal(artwork.status, "submitted");
  assert.equal(artwork.ownerType, "artist");
  assert.equal(Number(artwork.kgDiverted), 2.5);
  assert.equal(artwork.materials?.length, 1);
  assert.equal(artwork.pricingRecommendations?.length, 1);
  assert.equal(artwork.impactEstimates?.length, 1);
  assert.equal(artwork.pricingRecommendations?.[0]?.methodologyVersion, "pricing-rule-v1");
  assert.equal(artwork.impactEstimates?.[0]?.methodologyVersion, "impact-rule-v1");
});

test("marketplace lists only listed artwork", async () => {
  const db = createMemoryArtworkDatabase();
  const submitted = await createArtwork(db, artist, validArtworkInput({ title: "Pending Work" }));
  await reviewArtwork(db, admin, { artworkId: submitted.id, decision: "approve" });
  await createArtwork(db, artist, validArtworkInput({ title: "Still Pending" }));

  const listed = await listArtworks(db, null, "marketplace");
  assert.deepEqual(listed.items.map((artwork) => artwork.title), ["Pending Work"]);
  assert.equal(listed.pagination.total, 1);
});

test("admin can reject submitted artwork with a reason", async () => {
  const db = createMemoryArtworkDatabase();
  const artwork = await createArtwork(db, artist, validArtworkInput());
  const rejected = await reviewArtwork(db, admin, {
    artworkId: artwork.id,
    decision: "reject",
    rejectionReason: "Images need clearer material detail.",
  });

  assert.equal(rejected.status, "rejected");
  assert.equal(rejected.rejectionReason, "Images need clearer material detail.");
});

test("artist update resubmits artwork and replaces materials", async () => {
  const db = createMemoryArtworkDatabase();
  const artwork = await createArtwork(db, artist, validArtworkInput());
  await reviewArtwork(db, admin, { artworkId: artwork.id, decision: "reject", rejectionReason: "Revise." });

  const updated = await updateArtwork(db, artist, artwork.id, {
    ...validArtworkInput({ title: "Updated Work" }),
    materials: [{ material: "Glass", weightKg: 1.2, source: "Community cleanup" }],
  });

  assert.equal(updated.title, "Updated Work");
  assert.equal(updated.status, "submitted");
  assert.equal(updated.rejectionReason, null);
  assert.equal(updated.materials?.[0]?.material, "Glass");
  assert.equal(updated.pricingRecommendations?.length, 1);
  assert.equal((updated.pricingRecommendations?.[0]?.input as { views?: number }).views, 0);
  assert.equal(updated.impactEstimates?.[0]?.kgDiverted, 1.2);
});

test("public detail hides unlisted artwork from anonymous users", async () => {
  const db = createMemoryArtworkDatabase();
  const artwork = await createArtwork(db, artist, validArtworkInput());

  await assert.rejects(() => getArtwork(db, null, artwork.id), /Artwork was not found/);
  assert.equal((await getArtwork(db, artist, artwork.id)).id, artwork.id);
  assert.equal(normalizeArtwork(artwork).priceAmount, 42000);
});

test("stored pricing ignores client supplied demand inputs", async () => {
  const db = createMemoryArtworkDatabase();
  const artwork = await createArtwork(db, artist, {
    ...validArtworkInput(),
    views: 100000,
    wishlistCount: 10000,
    previousArtistSales: [5000000],
  } as Parameters<typeof createArtwork>[2] & {
    views: number;
    wishlistCount: number;
    previousArtistSales: number[];
  });

  const input = artwork.pricingRecommendations?.[0]?.input as {
    views?: number;
    wishlistCount?: number;
    previousArtistSales?: number[];
  };
  assert.equal(input.views, 0);
  assert.equal(input.wishlistCount, 0);
  assert.deepEqual(input.previousArtistSales, []);
});

function validArtworkInput(overrides: Partial<Parameters<typeof createArtwork>[2]> = {}) {
  return {
    title: "Ocean Waves",
    description: "Recovered PET bottles shaped into a wall artwork.",
    category: "Wall Art",
    priceAmount: 42000,
    dimensions: "60cm x 80cm",
    images: [{ url: "/placeholder-artwork/ocean-waves.jpg", altText: "Ocean Waves" }],
    materials: [{ material: "PET bottles", weightKg: 2.5, source: "Community cleanup" }],
    ...overrides,
  };
}

function createMemoryArtworkDatabase(): ArtworkDatabase {
  const artworks: ArtworkRecord[] = [];
  const pricingRecommendations: NonNullable<ArtworkRecord["pricingRecommendations"]> = [];
  const impactEstimates: NonNullable<ArtworkRecord["impactEstimates"]> = [];
  let sequence = 1;
  let recommendationSequence = 1;

  return {
    user: {
      async findFirst() {
        return { id: admin.id };
      },
    },
    artwork: {
      async create(args) {
        const now = new Date();
        const artwork: ArtworkRecord = {
          ...args.data,
          id: `artwork_${sequence++}`,
          viewCount: 0,
          favouriteCount: 0,
          rejectionReason: null,
          reviewedAt: null,
          createdAt: now,
          updatedAt: now,
          artist: args.data.artistId === admin.id ? admin : artist,
          images: args.data.images.create.map((image, index) => ({ id: `image_${index}`, ...image })),
          materials: args.data.materials.create.map((material, index) => ({ id: `material_${index}`, ...material })),
          pricingRecommendations: [],
          impactEstimates: [],
        };
        artworks.push(artwork);
        return withLatestRecommendations(artwork);
      },
      async findMany(args) {
        const filtered = artworks
          .filter((artwork) =>
            Object.entries(args.where).every(([key, value]) => (artwork as unknown as Record<string, unknown>)[key] === value)
          )
          .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
        return filtered
          .slice(args.skip ?? 0, (args.skip ?? 0) + (args.take ?? filtered.length))
          .map(withLatestRecommendations);
      },
      async count(args) {
        return artworks.filter((artwork) =>
          Object.entries(args.where).every(([key, value]) => (artwork as unknown as Record<string, unknown>)[key] === value)
        ).length;
      },
      async findFirst(args) {
        const clauses = args.where.OR as Array<{ id?: string; slug?: string }> | undefined;
        if (clauses) {
          const artwork = artworks.find((item) => {
            const idMatch = clauses.some((clause) => item.id === clause.id || item.slug === clause.slug);
            const statusMatch = !args.where.status || item.status === args.where.status;
            return idMatch && statusMatch;
          });
          return artwork ? withLatestRecommendations(artwork) : null;
        }
        return null;
      },
      async update(args) {
        const artwork = artworks.find((item) => item.id === args.where.id);
        assert.ok(artwork);
        Object.assign(artwork, args.data, { updatedAt: new Date() });
        return withLatestRecommendations(artwork);
      },
      async updateMany(args) {
        const matching = artworks.filter((artwork) =>
          Object.entries(args.where).every(([key, value]) => (artwork as unknown as Record<string, unknown>)[key] === value)
        );
        for (const artwork of matching) {
          if (typeof (args.data.viewCount as { increment?: number } | undefined)?.increment === "number") {
            artwork.viewCount += (args.data.viewCount as { increment: number }).increment;
          }
          if (typeof (args.data.favouriteCount as { increment?: number } | undefined)?.increment === "number") {
            artwork.favouriteCount += (args.data.favouriteCount as { increment: number }).increment;
          }
        }
        return { count: matching.length };
      },
      async delete(args) {
        const index = artworks.findIndex((item) => item.id === args.where.id);
        assert.notEqual(index, -1);
        return withLatestRecommendations(artworks.splice(index, 1)[0]);
      },
    },
    artworkImage: {
      async deleteMany(args) {
        const artwork = artworks.find((item) => item.id === args.where.artworkId);
        const count = artwork?.images?.length ?? 0;
        if (artwork) artwork.images = [];
        return { count };
      },
      async createMany(args) {
        const artwork = artworks.find((item) => item.id === args.data[0]?.artworkId);
        if (artwork) {
          artwork.images = args.data.map((image, index) => ({ id: `image_new_${index}`, ...image }));
        }
        return { count: args.data.length };
      },
    },
    artworkMaterial: {
      async deleteMany(args) {
        const artwork = artworks.find((item) => item.id === args.where.artworkId);
        const count = artwork?.materials?.length ?? 0;
        if (artwork) artwork.materials = [];
        return { count };
      },
      async createMany(args) {
        const artwork = artworks.find((item) => item.id === args.data[0]?.artworkId);
        if (artwork) {
          artwork.materials = args.data.map((material, index) => ({ id: `material_new_${index}`, ...material }));
        }
        return { count: args.data.length };
      },
    },
    pricingRecommendation: {
      async create(args) {
        const recommendation = {
          id: `pricing_${recommendationSequence++}`,
          createdAt: new Date(),
          ...args.data,
        };
        pricingRecommendations.push(recommendation);
        const artwork = artworks.find((item) => item.id === args.data.artworkId);
        if (artwork) artwork.pricingRecommendations = latestPricingFor(artwork.id);
        return recommendation;
      },
    },
    impactEstimate: {
      async create(args) {
        const estimate = {
          id: `impact_${recommendationSequence++}`,
          createdAt: new Date(),
          ...args.data,
        };
        impactEstimates.push(estimate);
        const artwork = artworks.find((item) => item.id === args.data.artworkId);
        if (artwork) artwork.impactEstimates = latestImpactFor(artwork.id);
        return estimate;
      },
    },
  };

  function withLatestRecommendations(artwork: ArtworkRecord): ArtworkRecord {
    return {
      ...artwork,
      pricingRecommendations: latestPricingFor(artwork.id),
      impactEstimates: latestImpactFor(artwork.id),
    };
  }

  function latestPricingFor(artworkId: string) {
    return pricingRecommendations
      .filter((recommendation) => recommendation.artworkId === artworkId)
      .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
      .slice(0, 1);
  }

  function latestImpactFor(artworkId: string) {
    return impactEstimates
      .filter((estimate) => estimate.artworkId === artworkId)
      .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
      .slice(0, 1);
  }
}
