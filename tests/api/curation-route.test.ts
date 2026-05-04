import assert from "node:assert/strict";
import test from "node:test";
import { POST } from "../../src/app/api/museum/curation/route";
import { clearInMemoryRateLimits } from "../../src/lib/foundation/rate-limit";

function curationRequest(body: unknown, ip = "203.0.113.60") {
  return new Request("http://localhost/api/museum/curation", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": ip,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

const validPayload = {
  artworks: [
    {
      id: "a1",
      title: "Ocean Memory",
      artistName: "Marie Uwimana",
      category: "Wall Art",
      materials: ["PET bottles", "Fabric scraps"],
      impactScore: 42,
      kgDiverted: 2.5,
    },
    {
      id: "a2",
      title: "E-Waste Signal",
      artistName: "Patrick Nshimiye",
      category: "Installation",
      materials: ["Electronic waste"],
      impactScore: 90,
      kgDiverted: 8.4,
    },
  ],
};

test("POST /api/museum/curation returns deterministic curation plan", async () => {
  clearInMemoryRateLimits();

  const response = await POST(curationRequest(validPayload));
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.plan.totalArtworks, 2);
  assert.equal(body.plan.placements.length, 2);
  assert.match(body.plan.accessibilitySummary, /2 artworks arranged/);
  assert.ok(body.requestId);
  assert.equal(response.headers.get("x-ratelimit-limit"), "30");
});

test("POST /api/museum/curation rejects private or unknown metadata", async () => {
  clearInMemoryRateLimits();

  const response = await POST(
    curationRequest(
      {
        artworks: [
          {
            id: "bad",
            title: "Bad",
            artistName: "Artist",
            category: "Painting",
            materials: ["unknown"],
            artistEmail: "private@example.com",
          },
        ],
      },
      "203.0.113.61"
    )
  );
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.error, "Invalid curation input.");
  assert.equal(body.details["artworks.0.category"], "Unknown artwork category.");
  assert.match(body.details["artworks.0.extraFields"], /artistEmail/);
});

test("POST /api/museum/curation rejects unsafe image URLs", async () => {
  clearInMemoryRateLimits();

  for (const imageUrl of ["ftp://example.com/x.jpg", "file:///C:/secret.txt", "//evil.example/x.jpg"]) {
    const response = await POST(
      curationRequest(
        {
          artworks: [
            {
              id: `bad-url-${imageUrl}`,
              title: "Bad URL",
              artistName: "Artist",
              category: "Wall Art",
              materials: ["PET bottles"],
              imageUrl,
            },
          ],
        },
        `203.0.113.${imageUrl.length}`
      )
    );
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.details["artworks.0.imageUrl"], "imageUrl must be a valid http(s) or site-relative URL.");
  }
});

test("POST /api/museum/curation rejects malformed JSON", async () => {
  clearInMemoryRateLimits();

  const response = await POST(curationRequest("{", "203.0.113.62"));
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.error, "Malformed JSON body.");
});

test("POST /api/museum/curation rate limits repeated requests", async () => {
  clearInMemoryRateLimits();

  let response = await POST(curationRequest(validPayload, "203.0.113.63"));

  for (let index = 0; index < 30; index += 1) {
    response = await POST(curationRequest(validPayload, "203.0.113.63"));
  }

  const body = await response.json();

  assert.equal(response.status, 429);
  assert.match(body.error, /Too many curation requests/);
});
