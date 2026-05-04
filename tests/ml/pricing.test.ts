import assert from "node:assert/strict";
import test from "node:test";
import {
  calculatePricingRecommendation,
  validatePricingInput,
} from "../../src/lib/ml/pricing";

test("validatePricingInput accepts the full Phase 1 pricing payload", () => {
  const result = validatePricingInput({
    category: "Sculpture",
    complexity: "complex",
    experienceLevel: "professional",
    materialWeight: 3,
    materials: ["Metal scraps", "Glass"],
    dimensions: "80cm x 120cm",
    hoursWorked: 28,
    views: 500,
    wishlistCount: 25,
    previousArtistSales: [45000, 60000, 90000],
  });

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.value.category, "Sculpture");
    assert.deepEqual(result.value.materials, ["Metal scraps", "Glass"]);
    assert.equal(result.value.previousArtistSales?.length, 3);
  }
});

test("validatePricingInput rejects invalid and unsafe values", () => {
  const result = validatePricingInput({
    category: "Painting",
    complexity: "advanced",
    experienceLevel: "master",
    materialWeight: 500,
    materials: ["Unknown material"],
    hoursWorked: 1000,
    previousArtistSales: ["buyer-a", -10, 999999999, 50000],
  });

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.errors.category, "Invalid category.");
    assert.equal(result.errors.complexity, "Invalid complexity.");
    assert.equal(result.errors.experienceLevel, "Invalid experience level.");
    assert.match(result.errors.materialWeight, /no more than 250/);
    assert.equal(result.errors.materials, "Select at least one known material.");
    assert.match(result.errors.hoursWorked, /between 0 and 500/);
    assert.match(result.errors.previousArtistSales, /between 0 and 5000000/);
  }
});

test("validatePricingInput rejects mixed known and unknown materials", () => {
  const result = validatePricingInput({
    category: "Wall Art",
    complexity: "moderate",
    experienceLevel: "emerging",
    materialWeight: 2,
    materials: ["PET bottles", "Unknown material"],
  });

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(
      result.errors.materials,
      "All materials must be known recyclable material types."
    );
  }
});

test("validatePricingInput accepts artistExperienceLevel alias and missing optional values", () => {
  const result = validatePricingInput({
    category: "Wall Art",
    complexity: "simple",
    artistExperienceLevel: "emerging",
    materialWeightKg: 0.5,
    materials: ["PET bottles"],
  });

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.value.experienceLevel, "emerging");
    assert.equal(result.value.materialWeight, 0.5);
    assert.equal(result.value.hoursWorked, undefined);
  }
});

test("validatePricingInput rejects JSON type coercion for numeric fields", () => {
  const result = validatePricingInput({
    category: "Wall Art",
    complexity: "simple",
    experienceLevel: "emerging",
    materialWeight: true,
    materials: ["PET bottles"],
    hoursWorked: "12",
    views: null,
    wishlistCount: "4",
    previousArtistSales: ["50000", true, null],
  });

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.match(result.errors.materialWeight, /Material weight/);
    assert.match(result.errors.hoursWorked, /must be a number/);
    assert.match(result.errors.views, /must be a number/);
    assert.match(result.errors.wishlistCount, /must be a number/);
    assert.match(result.errors.previousArtistSales, /contain only prices/);
  }
});

test("validatePricingInput rejects non-array previous sales", () => {
  const result = validatePricingInput({
    category: "Wall Art",
    complexity: "simple",
    experienceLevel: "emerging",
    materialWeight: 1,
    materials: ["PET bottles"],
    previousArtistSales: { last: 50000 },
  });

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.errors.previousArtistSales, "previousArtistSales must be an array of prices.");
  }
});

test("validatePricingInput rejects excessive previous sales arrays", () => {
  const result = validatePricingInput({
    category: "Wall Art",
    complexity: "simple",
    experienceLevel: "emerging",
    materialWeight: 1,
    materials: ["PET bottles"],
    previousArtistSales: Array.from({ length: 201 }, () => 50000),
  });

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.match(result.errors.previousArtistSales, /no more than 200/);
  }
});

test("validatePricingInput rejects malformed dimensions", () => {
  const objectDimensions = validatePricingInput({
    category: "Wall Art",
    complexity: "simple",
    experienceLevel: "emerging",
    materialWeight: 1,
    materials: ["PET bottles"],
    dimensions: { width: 50, height: 70 },
  });
  const excessiveDimensions = validatePricingInput({
    category: "Wall Art",
    complexity: "simple",
    experienceLevel: "emerging",
    materialWeight: 1,
    materials: ["PET bottles"],
    dimensions: "x".repeat(121),
  });

  assert.equal(objectDimensions.ok, false);
  assert.equal(excessiveDimensions.ok, false);
  if (!objectDimensions.ok) {
    assert.match(objectDimensions.errors.dimensions, /must be a string/);
  }
  if (!excessiveDimensions.ok) {
    assert.match(excessiveDimensions.errors.dimensions, /no longer than 120/);
  }
});

test("validatePricingInput rejects non-object payloads", () => {
  const result = validatePricingInput(null);

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.errors.category, "Invalid category.");
    assert.equal(result.errors.materials, "Select at least one known material.");
  }
});

test("calculatePricingRecommendation returns deterministic factorized pricing", () => {
  const quote = calculatePricingRecommendation({
    category: "Sculpture",
    complexity: "complex",
    experienceLevel: "professional",
    materialWeight: 3,
    materials: ["Metal scraps", "Glass"],
    hoursWorked: 28,
    views: 500,
    wishlistCount: 25,
    previousArtistSales: [45000, 60000, 90000],
  });

  assert.equal(quote.currency, "RWF");
  assert.equal(quote.suggested, 108000);
  assert.equal(quote.min, 84000);
  assert.equal(quote.max, 143000);
  assert.equal(quote.confidence, "high");
  assert.equal(quote.factors.length, 7);
  assert.match(quote.explanation, /comparable-sale signals/);
});

test("calculatePricingRecommendation caps manipulated demand signals", () => {
  const normal = calculatePricingRecommendation({
    category: "Wall Art",
    complexity: "simple",
    experienceLevel: "emerging",
    materialWeight: 1,
    materials: ["PET bottles"],
    views: 2000,
    wishlistCount: 250,
  });
  const manipulated = calculatePricingRecommendation({
    category: "Wall Art",
    complexity: "simple",
    experienceLevel: "emerging",
    materialWeight: 1,
    materials: ["PET bottles"],
    views: 100000,
    wishlistCount: 10000,
  });

  assert.equal(manipulated.suggested, normal.suggested);
  assert.match(
    manipulated.factors.find((factor) => factor.name === "demand")?.label ?? "",
    /capped at 2000 views and 250 wishlists/
  );
  assert.match(manipulated.explanation, /Demand is capped at 2,000 views and 250 wishlists/);
});

test("calculatePricingRecommendation handles low-confidence minimal pricing", () => {
  const quote = calculatePricingRecommendation({
    category: "Other",
    complexity: "simple",
    experienceLevel: "emerging",
    materialWeight: 0.2,
    materials: ["Other"],
  });

  assert.equal(quote.confidence, "low");
  assert.equal(
    quote.factors.find((factor) => factor.name === "labour")?.label,
    "hours worked not supplied"
  );
  assert.equal(
    quote.factors.find((factor) => factor.name === "comparables")?.label,
    "no comparable sales supplied"
  );
});

test("calculatePricingRecommendation handles even-numbered comparable sales", () => {
  const quote = calculatePricingRecommendation({
    category: "Wall Art",
    complexity: "moderate",
    experienceLevel: "intermediate",
    materialWeight: 2,
    materials: ["PET bottles", "Paper"],
    hoursWorked: 4,
    previousArtistSales: [20000, 60000],
  });

  assert.equal(quote.confidence, "high");
  assert.equal(
    quote.factors.find((factor) => factor.name === "comparables")?.amountRwf,
    10000
  );
});

test("calculatePricingRecommendation clamps very high recommendations", () => {
  const quote = calculatePricingRecommendation({
    category: "Installation",
    complexity: "very_complex",
    experienceLevel: "professional",
    materialWeight: 250,
    materials: ["Electronic waste", "Glass", "Metal scraps"],
    hoursWorked: 500,
    views: 100000,
    wishlistCount: 10000,
    previousArtistSales: [5000000, 5000000, 5000000],
  });

  assert.equal(quote.suggested, 750000);
  assert.equal(quote.max, 750000);
});
