import assert from "node:assert/strict";
import test from "node:test";
import { POST } from "../../src/app/api/pricing/route";
import { clearInMemoryRateLimits } from "../../src/lib/foundation/rate-limit";

function pricingRequest(body: unknown, ip = "198.51.100.10") {
  return new Request("http://localhost/api/pricing", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": ip,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

test("POST /api/pricing returns factorized recommendations", async () => {
  clearInMemoryRateLimits();

  const response = await POST(
    pricingRequest({
      category: "Sculpture",
      complexity: "complex",
      experienceLevel: "professional",
      materialWeight: 3,
      materials: ["Metal scraps", "Glass"],
      hoursWorked: 28,
      views: 500,
      wishlistCount: 25,
      previousArtistSales: [45000, 60000, 90000],
    })
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.suggested, 108000);
  assert.equal(body.methodologyVersion, "pricing-rule-v1");
  assert.equal(body.factors.length, 7);
  assert.ok(body.requestId);
  assert.equal(response.headers.get("x-ratelimit-limit"), "30");
});

test("POST /api/pricing rejects malformed JSON", async () => {
  clearInMemoryRateLimits();

  const response = await POST(pricingRequest("{", "198.51.100.11"));
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.errors.category, "Invalid category.");
});

test("POST /api/pricing rejects coerced numeric JSON types", async () => {
  clearInMemoryRateLimits();

  const response = await POST(
    pricingRequest(
      {
        category: "Wall Art",
        complexity: "simple",
        experienceLevel: "emerging",
        materialWeight: true,
        materials: ["PET bottles"],
        hoursWorked: "12",
        previousArtistSales: ["50000", true, null],
      },
      "198.51.100.13"
    )
  );
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.match(body.errors.materialWeight, /Material weight/);
  assert.match(body.errors.hoursWorked, /must be a number/);
  assert.match(body.errors.previousArtistSales, /contain only prices/);
});

test("POST /api/pricing rejects malformed dimensions", async () => {
  clearInMemoryRateLimits();

  const response = await POST(
    pricingRequest(
      {
        category: "Wall Art",
        complexity: "simple",
        experienceLevel: "emerging",
        materialWeight: 1,
        materials: ["PET bottles"],
        dimensions: "x".repeat(100000),
      },
      "198.51.100.14"
    )
  );
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.match(body.errors.dimensions, /no longer than 120/);
});

test("POST /api/pricing rejects excessive previous sales arrays", async () => {
  clearInMemoryRateLimits();

  const response = await POST(
    pricingRequest(
      {
        category: "Wall Art",
        complexity: "simple",
        experienceLevel: "emerging",
        materialWeight: 1,
        materials: ["PET bottles"],
        previousArtistSales: Array.from({ length: 201 }, () => 50000),
      },
      "198.51.100.15"
    )
  );
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.match(body.errors.previousArtistSales, /no more than 200/);
});

test("POST /api/pricing rate limits repeated requests", async () => {
  clearInMemoryRateLimits();

  let response = await POST(
    pricingRequest(
      {
        category: "Wall Art",
        complexity: "simple",
        experienceLevel: "emerging",
        materialWeight: 1,
        materials: ["PET bottles"],
      },
      "198.51.100.12"
    )
  );

  for (let index = 0; index < 30; index += 1) {
    response = await POST(
      pricingRequest(
        {
          category: "Wall Art",
          complexity: "simple",
          experienceLevel: "emerging",
          materialWeight: 1,
          materials: ["PET bottles"],
        },
        "198.51.100.12"
      )
    );
  }

  const body = await response.json();

  assert.equal(response.status, 429);
  assert.match(body.error, /Too many pricing requests/);
});
