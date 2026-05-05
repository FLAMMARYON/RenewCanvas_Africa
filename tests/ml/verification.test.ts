import assert from "node:assert/strict";
import test from "node:test";
import { buildVerificationQueue, type VerificationArtworkInput } from "../../src/lib/ml/verification";
import { curateMuseum } from "../../src/lib/ml/curator";
import { calculateImpactEstimate } from "../../src/lib/ml/impact";
import { calculatePricingRecommendation } from "../../src/lib/ml/pricing";
import { p1VerificationCopy, p1VerificationLocales } from "../../src/lib/i18n/p1-verification";

const readyPricing = calculatePricingRecommendation({
  category: "Wall Art",
  materials: ["PET bottles"],
  materialWeight: 2,
  complexity: "moderate",
  experienceLevel: "emerging",
});

const readyImpact = calculateImpactEstimate([
  { type: "PET bottles", weightKg: 2, verifiedByImage: true, confidenceScore: 0.86 },
]);

const readyArtwork: VerificationArtworkInput = {
  id: "ready-1",
  title: "Ocean Memory",
  artistName: "Marie Uwimana",
  category: "Wall Art",
  materials: ["PET bottles"],
  materialWeightKg: 2,
  verificationStatus: "needs_review",
  pricingRecommendation: readyPricing,
  impactEstimate: readyImpact,
};

test("buildVerificationQueue marks fully documented artwork as approve-ready", () => {
  const curationPlan = curateMuseum({
    artworks: [
      {
        id: readyArtwork.id,
        title: readyArtwork.title,
        artistName: readyArtwork.artistName,
        category: readyArtwork.category,
        materials: readyArtwork.materials,
        kgDiverted: 2,
      },
    ],
  });

  const queue = buildVerificationQueue([readyArtwork], curationPlan);

  assert.equal(queue.length, 1);
  assert.equal(queue[0].pricingStatus, "ready");
  assert.equal(queue[0].impactStatus, "ready");
  assert.equal(queue[0].museumStatus, "placed");
  assert.equal(queue[0].recommendedAction, "approve_ready");
  assert.match(queue[0].plainLanguageSummary, /placed in/);
});

test("buildVerificationQueue surfaces missing evidence without automatic rejection", () => {
  const queue = buildVerificationQueue([
    {
      id: "missing-1",
      title: "Incomplete Work",
      artistName: "Artist",
      category: "Sculpture",
      materials: ["Metal scraps"],
      materialWeightKg: 3,
      verificationStatus: "unverified",
    },
  ]);

  assert.equal(queue[0].pricingStatus, "missing");
  assert.equal(queue[0].impactStatus, "missing");
  assert.equal(queue[0].museumStatus, "missing");
  assert.equal(queue[0].recommendedAction, "request_more_info");
  assert.ok(queue[0].reviewFlags.length >= 3);
});

test("buildVerificationQueue sends a single readiness gap to manual review", () => {
  const queue = buildVerificationQueue([readyArtwork]);

  assert.equal(queue[0].pricingStatus, "ready");
  assert.equal(queue[0].impactStatus, "ready");
  assert.equal(queue[0].museumStatus, "missing");
  assert.equal(queue[0].recommendedAction, "manual_review");
  assert.deepEqual(queue[0].reviewFlags, ["Artwork is not placed in the museum curation plan."]);
  assert.match(queue[0].plainLanguageSummary, /not yet placed in the museum/);
});

test("buildVerificationQueue requests more information for rejected artwork", () => {
  const curationPlan = curateMuseum({
    artworks: [
      {
        id: readyArtwork.id,
        title: readyArtwork.title,
        artistName: readyArtwork.artistName,
        category: readyArtwork.category,
        materials: readyArtwork.materials,
        kgDiverted: 2,
      },
    ],
  });

  const queue = buildVerificationQueue(
    [{ ...readyArtwork, verificationStatus: "rejected" }],
    curationPlan
  );

  assert.equal(queue[0].pricingStatus, "ready");
  assert.equal(queue[0].impactStatus, "ready");
  assert.equal(queue[0].museumStatus, "placed");
  assert.equal(queue[0].recommendedAction, "request_more_info");
  assert.deepEqual(queue[0].reviewFlags, ["Artwork is currently rejected."]);
});

test("buildVerificationQueue prioritizes needs-review items deterministically", () => {
  const queue = buildVerificationQueue([
    { ...readyArtwork, id: "verified-1", title: "Verified Work", verificationStatus: "verified" },
    { ...readyArtwork, id: "needs-1", title: "Needs Work", verificationStatus: "needs_review" },
    { ...readyArtwork, id: "unverified-1", title: "Unverified Work", verificationStatus: "unverified" },
  ]);

  assert.deepEqual(
    queue.map((item) => item.artworkId),
    ["needs-1", "unverified-1", "verified-1"]
  );
});

test("P1 verification copy includes every first-tier locale", () => {
  assert.deepEqual([...p1VerificationLocales].sort(), ["en", "fr", "rw", "sw"]);

  for (const locale of p1VerificationLocales) {
    const copy = p1VerificationCopy[locale];

    assert.ok(copy.page.title);
    assert.ok(copy.page.description);
    assert.ok(copy.page.actionLabels.approve_ready);
    assert.ok(copy.queue.flags.missingPricing);
    assert.ok(copy.queue.summary({
      title: "Sample",
      pricingStatus: "ready",
      impactStatus: "ready",
      museumStatus: "missing",
    }));
  }
});

test("buildVerificationQueue can render localized review copy", () => {
  const queue = buildVerificationQueue(
    [
      {
        id: "missing-1",
        title: "Incomplete Work",
        artistName: "Artist",
        category: "Sculpture",
        materials: ["Metal scraps"],
        materialWeightKg: 3,
        verificationStatus: "unverified",
      },
    ],
    undefined,
    p1VerificationCopy.sw.queue
  );

  assert.equal(queue[0].reviewFlags[0], p1VerificationCopy.sw.queue.flags.missingPricing);
  assert.match(queue[0].plainLanguageSummary, /haijapangwa bado/);
});
