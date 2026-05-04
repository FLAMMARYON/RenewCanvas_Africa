import assert from "node:assert/strict";
import test from "node:test";
import {
  curateMuseum,
  validateCurationInput,
  type CurationArtworkInput,
} from "../../src/lib/ml/curator";

const sampleArtworks: CurationArtworkInput[] = [
  {
    id: "a-wall-1",
    title: "Ocean Memory",
    artistName: "Marie Uwimana",
    category: "Wall Art",
    materials: ["PET bottles", "Fabric scraps"],
    impactScore: 42,
    kgDiverted: 2.5,
    mlTags: ["blue", "coastal"],
  },
  {
    id: "a-sculpture-1",
    title: "Bottle Cap Guardian",
    artistName: "Claudine Mukiza",
    category: "Sculpture",
    materials: ["Bottle caps"],
    impactScore: 55,
    kgDiverted: 3.2,
  },
  {
    id: "a-impact-1",
    title: "E-Waste Signal",
    artistName: "Patrick Nshimiye",
    category: "Installation",
    materials: ["Electronic waste"],
    impactScore: 90,
    kgDiverted: 8.4,
  },
  {
    id: "a-jewelry-1",
    title: "Paper Halo",
    artistName: "Alice Uwase",
    category: "Jewelry",
    materials: ["Paper"],
    impactScore: 14,
    kgDiverted: 0.7,
  },
];

test("validateCurationInput accepts public artwork metadata", () => {
  const result = validateCurationInput({ artworks: sampleArtworks });

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.value.artworks.length, 4);
    assert.equal(result.value.artworks[0].materials[0], "PET bottles");
  }
});

test("validateCurationInput rejects malformed and private metadata", () => {
  const result = validateCurationInput({
    sessionUserId: "private-user",
    artworks: [
      {
        id: "bad-1",
        title: "Bad Listing",
        artistName: "Artist",
        category: "Painting",
        materials: ["unknown"],
        imageUrl: "javascript:alert(1)",
        artistEmail: "private@example.com",
        impactScore: 101,
      },
    ],
  });

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.match(result.errors.extraFields, /sessionUserId/);
    assert.equal(result.errors["artworks.0.category"], "Unknown artwork category.");
    assert.equal(result.errors["artworks.0.materials"], "All materials must be known recyclable material types.");
    assert.equal(result.errors["artworks.0.imageUrl"], "imageUrl must be a valid http(s) or site-relative URL.");
    assert.match(result.errors["artworks.0.extraFields"], /artistEmail/);
    assert.equal(result.errors["artworks.0.impactScore"], "impactScore must be a number from 0 to 100.");
  }
});

test("validateCurationInput rejects unsafe image URL schemes", () => {
  for (const imageUrl of ["ftp://example.com/x.jpg", "file:///C:/secret.txt", "//evil.example/x.jpg", "not-a-url"]) {
    const result = validateCurationInput({
      artworks: [
        {
          id: `bad-${imageUrl}`,
          title: "Bad URL",
          artistName: "Artist",
          category: "Wall Art",
          materials: ["PET bottles"],
          imageUrl,
        },
      ],
    });

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.errors["artworks.0.imageUrl"], "imageUrl must be a valid http(s) or site-relative URL.");
    }
  }
});

test("validateCurationInput accepts http, https, and site-relative image URLs", () => {
  for (const imageUrl of ["https://example.com/x.jpg", "http://example.com/x.jpg", "/images/artworks/x.jpg"]) {
    const result = validateCurationInput({
      artworks: [
        {
          id: `good-${imageUrl}`,
          title: "Good URL",
          artistName: "Artist",
          category: "Wall Art",
          materials: ["PET bottles"],
          imageUrl,
        },
      ],
    });

    assert.equal(result.ok, true);
  }
});

test("validateCurationInput rejects empty and excessive batches", () => {
  const empty = validateCurationInput({ artworks: [] });
  const excessive = validateCurationInput({
    artworks: Array.from({ length: 501 }, (_, index) => ({
      id: `art-${index}`,
      title: `Artwork ${index}`,
      artistName: "Artist",
      category: "Wall Art",
      materials: ["PET bottles"],
    })),
  });

  assert.equal(empty.ok, false);
  assert.equal(excessive.ok, false);
  if (!empty.ok) assert.match(empty.errors.artworks, /At least one/);
  if (!excessive.ok) assert.match(excessive.errors.artworks, /No more than 500/);
});

test("curateMuseum is deterministic from the same inputs", () => {
  const first = curateMuseum({ artworks: sampleArtworks });
  const second = curateMuseum({ artworks: [...sampleArtworks].reverse() });

  assert.deepEqual(second, first);
  assert.equal(first.totalArtworks, 4);
  assert.match(first.accessibilitySummary, /4 artworks arranged/);
});

test("curateMuseum arranges by type, material, and impact metadata", () => {
  const plan = curateMuseum({ artworks: sampleArtworks });
  const highImpactRoom = plan.rooms.find((room) => room.grouping === "impact");
  const materialRoom = plan.rooms.find((room) => room.grouping === "material");
  const typeRoom = plan.rooms.find((room) => room.grouping === "type");
  const impactPlacement = plan.placements.find((placement) => placement.artworkId === "a-impact-1");

  assert.ok(highImpactRoom);
  assert.ok(materialRoom);
  assert.ok(typeRoom);
  assert.equal(impactPlacement?.wallSide, "floor");
  assert.match(impactPlacement?.arrangementExplanation ?? "", /impact grouping/);
});

test("curateMuseum paginates large themes into stable room slots", () => {
  const artworks: CurationArtworkInput[] = Array.from({ length: 10 }, (_, index) => ({
    id: `pet-${index.toString().padStart(2, "0")}`,
    title: `PET Work ${index}`,
    artistName: "Artist",
    category: "Wall Art",
    materials: ["PET bottles"],
    impactScore: index,
  }));

  const plan = curateMuseum({ artworks });

  assert.equal(plan.rooms.length, 2);
  assert.equal(plan.placements.filter((placement) => placement.roomId === plan.rooms[0].id).length, 8);
  assert.equal(plan.placements.filter((placement) => placement.roomId === plan.rooms[1].id).length, 2);
  assert.equal(plan.rooms[0].wingIndex, 0);
});
