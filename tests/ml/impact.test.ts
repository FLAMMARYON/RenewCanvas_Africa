import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateImpactEstimate,
  validateImpactInput,
} from "../../src/lib/ml/impact";

test("validateImpactInput accepts verified material records", () => {
  const result = validateImpactInput({
    materials: [
      {
        type: "PET bottles",
        weightKg: 2.5,
        verifiedByImage: true,
        confidenceScore: 0.82,
      },
    ],
  });

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.value.materials[0].type, "PET bottles");
    assert.equal(result.value.materials[0].weightKg, 2.5);
  }
});

test("validateImpactInput rejects malformed request bodies", () => {
  const result = validateImpactInput({
    materials: [
      "not-object",
      {
        type: "Unknown",
        weightKg: "4",
        verifiedByImage: "yes",
        confidenceScore: 3,
      },
    ],
  });

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.errors["materials.0"], "Material record must be an object.");
    assert.equal(result.errors["materials.1.type"], "Unknown recyclable material type.");
    assert.match(result.errors["materials.1.weightKg"], /must be a number/);
    assert.equal(result.errors["materials.1.verifiedByImage"], "verifiedByImage must be boolean.");
    assert.match(result.errors["materials.1.confidenceScore"], /between 0 and 1/);
  }
});

test("validateImpactInput rejects unsupported extra fields", () => {
  const result = validateImpactInput({
    certifiedCarbonCredits: true,
    materials: [
      {
        type: "PET bottles",
        weightKg: 1,
        verifiedByImage: true,
        claim: "carbon neutral",
      },
    ],
  });

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.match(result.errors.extraFields, /certifiedCarbonCredits/);
    assert.match(result.errors["materials.0.extraFields"], /claim/);
  }
});

test("validateImpactInput rejects empty, excessive, and unrealistic material payloads", () => {
  const empty = validateImpactInput({ materials: [] });
  const tooManyRows = validateImpactInput({
    materials: Array.from({ length: 51 }, () => ({
      type: "Paper",
      weightKg: 1,
      verifiedByImage: false,
    })),
  });
  const tooHeavyItem = validateImpactInput({
    materials: [{ type: "Glass", weightKg: 251, verifiedByImage: false }],
  });
  const tooHeavyTotal = validateImpactInput({
    materials: [
      { type: "Glass", weightKg: 250, verifiedByImage: false },
      { type: "Paper", weightKg: 250, verifiedByImage: false },
      { type: "PET bottles", weightKg: 1, verifiedByImage: false },
    ],
  });

  assert.equal(empty.ok, false);
  assert.equal(tooManyRows.ok, false);
  assert.equal(tooHeavyItem.ok, false);
  assert.equal(tooHeavyTotal.ok, false);
  if (!empty.ok) assert.match(empty.errors.materials, /At least one/);
  if (!tooManyRows.ok) assert.match(tooManyRows.errors.materials, /No more than 50/);
  if (!tooHeavyItem.ok) assert.match(tooHeavyItem.errors["materials.0.weightKg"], /no more than 250/);
  if (!tooHeavyTotal.ok) assert.match(tooHeavyTotal.errors.totalWeightKg, /no more than 500/);
});

test("validateImpactInput rejects weights below practical precision", () => {
  const result = validateImpactInput({
    materials: [{ type: "Glass", weightKg: 0.0001, verifiedByImage: true }],
  });

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.match(result.errors["materials.0.weightKg"], /at least 0.001/);
  }
});

test("validateImpactInput rejects non-object root payloads", () => {
  const result = validateImpactInput(null);

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.errors.materials, "At least one material record is required.");
  }
});

test("calculateImpactEstimate returns deterministic receipt-ready impact", () => {
  const estimate = calculateImpactEstimate([
    {
      type: "PET bottles",
      weightKg: 2.5,
      verifiedByImage: true,
      confidenceScore: 0.82,
    },
    {
      type: "Aluminium cans",
      weightKg: 1,
      verifiedByImage: true,
      confidenceScore: 0.9,
    },
  ]);

  assert.equal(estimate.kgDiverted, 3.5);
  assert.equal(estimate.co2eAvoidedKg, 12.25);
  assert.equal(estimate.landfillVolumeAvoidedLitres, 78.5);
  assert.equal(estimate.confidence, "high");
  assert.equal(estimate.methodologyVersion, "impact-rule-v1");
  assert.match(estimate.plainLanguageSummary, /3.5 kg/);
  assert.equal(estimate.materialBreakdown.length, 2);
  assert.equal(estimate.equivalents[0].label, "500ml PET bottles reused");
});

test("calculateImpactEstimate reports medium and low confidence without changing math", () => {
  const medium = calculateImpactEstimate([
    { type: "Paper", weightKg: 1, verifiedByImage: true, confidenceScore: 0.4 },
  ]);
  const low = calculateImpactEstimate([
    { type: "Paper", weightKg: 1, verifiedByImage: false },
  ]);

  assert.equal(medium.co2eAvoidedKg, low.co2eAvoidedKg);
  assert.equal(medium.confidence, "medium");
  assert.equal(low.confidence, "low");
});

test("calculateImpactEstimate exposes low image confidence in assumptions", () => {
  const estimate = calculateImpactEstimate([
    { type: "Paper", weightKg: 1, verifiedByImage: true, confidenceScore: 0.01 },
  ]);

  assert.equal(estimate.confidence, "medium");
  assert.ok(
    estimate.assumptions.some((assumption) => assumption.includes("low confidence"))
  );
});

test("calculateImpactEstimate exposes missing image confidence in assumptions", () => {
  const estimate = calculateImpactEstimate([
    { type: "Paper", weightKg: 1, verifiedByImage: true },
  ]);

  assert.ok(
    estimate.assumptions.some((assumption) => assumption.includes("did not include a confidence score"))
  );
});

test("calculateImpactEstimate covers all published material factors", () => {
  const estimate = calculateImpactEstimate([
    { type: "Bottle caps", weightKg: 1, verifiedByImage: false },
    { type: "Cardboard", weightKg: 1, verifiedByImage: false },
    { type: "Fabric scraps", weightKg: 1, verifiedByImage: false },
    { type: "Glass", weightKg: 1, verifiedByImage: false },
    { type: "Electronic waste", weightKg: 1, verifiedByImage: false },
    { type: "Burlap/grain sacks", weightKg: 1, verifiedByImage: false },
    { type: "Plastic bags", weightKg: 1, verifiedByImage: false },
    { type: "Metal scraps", weightKg: 1, verifiedByImage: false },
    { type: "Other", weightKg: 1, verifiedByImage: false },
  ]);

  assert.equal(estimate.kgDiverted, 9);
  assert.equal(estimate.materialBreakdown.length, 9);
  assert.ok(estimate.co2eAvoidedKg > 0);
  assert.ok(estimate.landfillVolumeAvoidedLitres > 0);
});

test("calculateImpactEstimate sums raw gram-scale rows before rounding", () => {
  const estimate = calculateImpactEstimate(
    Array.from({ length: 50 }, () => ({
      type: "Bottle caps",
      weightKg: 0.002,
      verifiedByImage: true,
      confidenceScore: 0.8,
    }))
  );

  assert.equal(estimate.kgDiverted, 0.1);
  assert.equal(estimate.co2eAvoidedKg, 0.14);
  assert.equal(estimate.landfillVolumeAvoidedLitres, 1.8);
  assert.equal(estimate.confidence, "high");
  assert.equal(estimate.equivalents.length, 1);
  assert.equal(estimate.equivalents[0].value, 50);
});

test("calculateImpactEstimate keeps single gram-scale rows visible", () => {
  const estimate = calculateImpactEstimate([
    {
      type: "Bottle caps",
      weightKg: 0.002,
      verifiedByImage: true,
      confidenceScore: 0.8,
    },
  ]);

  assert.equal(estimate.kgDiverted, 0.002);
  assert.equal(estimate.co2eAvoidedKg, 0.0028);
  assert.equal(estimate.landfillVolumeAvoidedLitres, 0.036);
  assert.match(estimate.plainLanguageSummary, /0.002 kg/);
});
