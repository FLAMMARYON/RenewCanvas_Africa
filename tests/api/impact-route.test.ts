import assert from "node:assert/strict";
import test from "node:test";
import { POST } from "../../src/app/api/impact/route";
import { clearInMemoryRateLimits } from "../../src/lib/foundation/rate-limit";

function impactRequest(body: unknown, ip = "203.0.113.10") {
  return new Request("http://localhost/api/impact", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": ip,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

const validImpactPayload = {
  materials: [
    {
      type: "PET bottles",
      weightKg: 2.5,
      verifiedByImage: true,
      confidenceScore: 0.82,
    },
  ],
};

test("POST /api/impact returns receipt-ready estimates", async () => {
  clearInMemoryRateLimits();

  const response = await POST(impactRequest(validImpactPayload));
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.kgDiverted, 2.5);
  assert.equal(body.co2eAvoidedKg, 3.75);
  assert.equal(body.landfillVolumeAvoidedLitres, 62.5);
  assert.equal(body.methodologyVersion, "impact-rule-v1");
  assert.equal(body.confidence, "high");
  assert.match(body.plainLanguageSummary, /reclaimed material/);
  assert.ok(body.requestId);
  assert.equal(response.headers.get("x-ratelimit-limit"), "30");
});

test("POST /api/impact rejects malformed JSON", async () => {
  clearInMemoryRateLimits();

  const response = await POST(impactRequest("{", "203.0.113.11"));
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.errors.materials, "At least one material record is required.");
});

test("POST /api/impact rejects invalid material rows", async () => {
  clearInMemoryRateLimits();

  const response = await POST(
    impactRequest(
      {
        materials: [
          {
            type: "Unknown",
            weightKg: true,
            verifiedByImage: "yes",
            confidenceScore: -1,
          },
        ],
      },
      "203.0.113.12"
    )
  );
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.errors["materials.0.type"], "Unknown recyclable material type.");
  assert.match(body.errors["materials.0.weightKg"], /must be a number/);
  assert.equal(body.errors["materials.0.verifiedByImage"], "verifiedByImage must be boolean.");
  assert.match(body.errors["materials.0.confidenceScore"], /between 0 and 1/);
});

test("POST /api/impact rejects unsupported environmental claim fields", async () => {
  clearInMemoryRateLimits();

  const response = await POST(
    impactRequest(
      {
        certifiedCarbonCredits: true,
        materials: [
          {
            type: "PET bottles",
            weightKg: 1,
            verifiedByImage: true,
            claim: "carbon neutral",
          },
        ],
      },
      "203.0.113.16"
    )
  );
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.match(body.errors.extraFields, /certifiedCarbonCredits/);
  assert.match(body.errors["materials.0.extraFields"], /claim/);
});

test("POST /api/impact rejects weights below practical precision", async () => {
  clearInMemoryRateLimits();

  const response = await POST(
    impactRequest(
      {
        materials: [{ type: "Glass", weightKg: 0.0001, verifiedByImage: true }],
      },
      "203.0.113.17"
    )
  );
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.match(body.errors["materials.0.weightKg"], /at least 0.001/);
});

test("POST /api/impact preserves gram-scale material totals", async () => {
  clearInMemoryRateLimits();

  const response = await POST(
    impactRequest(
      {
        materials: Array.from({ length: 50 }, () => ({
          type: "Bottle caps",
          weightKg: 0.002,
          verifiedByImage: true,
          confidenceScore: 0.8,
        })),
      },
      "203.0.113.14"
    )
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.kgDiverted, 0.1);
  assert.equal(body.co2eAvoidedKg, 0.14);
  assert.equal(body.landfillVolumeAvoidedLitres, 1.8);
  assert.equal(body.equivalents.length, 1);
  assert.equal(body.equivalents[0].value, 50);
});

test("POST /api/impact keeps a single gram-scale row visible", async () => {
  clearInMemoryRateLimits();

  const response = await POST(
    impactRequest(
      {
        materials: [
          {
            type: "Bottle caps",
            weightKg: 0.002,
            verifiedByImage: true,
            confidenceScore: 0.8,
          },
        ],
      },
      "203.0.113.15"
    )
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.kgDiverted, 0.002);
  assert.equal(body.co2eAvoidedKg, 0.0028);
  assert.equal(body.landfillVolumeAvoidedLitres, 0.036);
  assert.match(body.plainLanguageSummary, /0.002 kg/);
});

test("POST /api/impact rate limits repeated requests", async () => {
  clearInMemoryRateLimits();

  let response = await POST(impactRequest(validImpactPayload, "203.0.113.13"));

  for (let index = 0; index < 30; index += 1) {
    response = await POST(impactRequest(validImpactPayload, "203.0.113.13"));
  }

  const body = await response.json();

  assert.equal(response.status, 429);
  assert.match(body.error, /Too many impact requests/);
});
