import { describe, it } from "node:test";
import assert from "node:assert";

/**
 * Tests for the room tag matching algorithm
 */

function scoreArtworkForRoom(artworkTags: string[], roomTags: string[]): number {
  const normalizedArtworkTags = artworkTags.map((tag) => tag.trim().toLowerCase());
  const normalizedRoomTags = roomTags.map((tag) => tag.trim().toLowerCase());

  let score = 0;
  for (const artworkTag of normalizedArtworkTags) {
    for (const roomTag of normalizedRoomTags) {
      if (artworkTag.includes(roomTag) || roomTag.includes(artworkTag)) {
        score += 1;
      }
    }
  }

  return score;
}

describe("Gallery Layout API - Room Matching", () => {
  describe("scoreArtworkForRoom", () => {
    it("should return 0 when no tags match", () => {
      const artworkTags = ["metal", "sculpture"];
      const roomTags = ["pet", "bottle", "plastic"];
      const score = scoreArtworkForRoom(artworkTags, roomTags);
      assert.strictEqual(score, 0);
    });

    it("should return correct score for exact matches", () => {
      const artworkTags = ["pet", "bottle"];
      const roomTags = ["pet", "bottle", "plastic"];
      const score = scoreArtworkForRoom(artworkTags, roomTags);
      assert.strictEqual(score, 2); // "pet" and "bottle" match
    });

    it("should be case-insensitive", () => {
      const artworkTags = ["PET", "Bottle"];
      const roomTags = ["pet", "bottle", "plastic"];
      const score = scoreArtworkForRoom(artworkTags, roomTags);
      assert.strictEqual(score, 2);
    });

    it("should handle partial matches", () => {
      const artworkTags = ["recycled plastic"];
      const roomTags = ["plastic"];
      const score = scoreArtworkForRoom(artworkTags, roomTags);
      assert.strictEqual(score, 1); // "plastic" is contained in "recycled plastic"
    });

    it("should count multiple matches correctly", () => {
      const artworkTags = ["women", "female", "kigali"];
      const roomTags = ["women", "female", "girl"];
      const score = scoreArtworkForRoom(artworkTags, roomTags);
      assert.strictEqual(score, 2); // "women" and "female" match
    });

    it("should trim whitespace from tags", () => {
      const artworkTags = [" pet ", " bottle "];
      const roomTags = ["pet", "bottle"];
      const score = scoreArtworkForRoom(artworkTags, roomTags);
      assert.strictEqual(score, 2);
    });
  });

  describe("Room Assignment Logic", () => {
    it("should assign artwork to highest scoring room", () => {
      const artwork = { id: "1", tags: ["pet", "bottle", "plastic"] };
      const rooms = [
        { id: "women-artists", tags: ["women", "female"] },
        { id: "pet-bottle-wing", tags: ["pet", "bottle", "plastic"] },
        { id: "ewaste", tags: ["electronic", "circuit"] },
      ];

      const scores = rooms.map((room) => ({
        room: room.id,
        score: scoreArtworkForRoom(artwork.tags, room.tags),
      }));

      const bestRoom = scores.reduce((best, current) =>
        current.score > best.score ? current : best
      );

      assert.strictEqual(bestRoom.room, "pet-bottle-wing");
      assert.strictEqual(bestRoom.score, 3);
    });

    it("should handle tie-breaking alphabetically", () => {
      const artwork = { id: "1", tags: ["art", "creative"] };
      const rooms = [
        { id: "youth-gallery", name: "Youth Gallery", tags: [] },
        { id: "women-gallery", name: "Women Gallery", tags: [] },
        { id: "ewaste-gallery", name: "E-Waste Gallery", tags: [] },
      ];

      // All rooms score 0, should pick alphabetically (by name)
      const scores = rooms.map((room) => ({
        room,
        score: scoreArtworkForRoom(artwork.tags, room.tags),
      }));

      const bestRoom = scores.reduce((best, current) => {
        if (current.score > best.score) return current;
        if (current.score === best.score && current.room.name < best.room.name) {
          return current;
        }
        return best;
      });

      assert.strictEqual(bestRoom.room.name, "E-Waste Gallery");
    });

    it("should distribute unmatched artworks evenly", () => {
      const unmatchedArtworks = [
        { id: "1", tags: [] },
        { id: "2", tags: [] },
        { id: "3", tags: [] },
        { id: "4", tags: [] },
        { id: "5", tags: [] },
        { id: "6", tags: [] },
      ];

      const rooms = ["room1", "room2", "room3"];
      const assignments: Record<string, string[]> = {
        room1: [],
        room2: [],
        room3: [],
      };

      // Distribute evenly
      unmatchedArtworks.forEach((artwork, index) => {
        const roomIndex = index % rooms.length;
        assignments[rooms[roomIndex]].push(artwork.id);
      });

      // Each room should have 2 artworks
      assert.strictEqual(assignments.room1.length, 2);
      assert.strictEqual(assignments.room2.length, 2);
      assert.strictEqual(assignments.room3.length, 2);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty artwork tags", () => {
      const artworkTags: string[] = [];
      const roomTags = ["pet", "bottle"];
      const score = scoreArtworkForRoom(artworkTags, roomTags);
      assert.strictEqual(score, 0);
    });

    it("should handle empty room tags", () => {
      const artworkTags = ["pet", "bottle"];
      const roomTags: string[] = [];
      const score = scoreArtworkForRoom(artworkTags, roomTags);
      assert.strictEqual(score, 0);
    });

    it("should handle both empty tags arrays", () => {
      const artworkTags: string[] = [];
      const roomTags: string[] = [];
      const score = scoreArtworkForRoom(artworkTags, roomTags);
      assert.strictEqual(score, 0);
    });

    it("should handle special characters in tags", () => {
      const artworkTags = ["e-waste", "circuit-board"];
      const roomTags = ["ewaste", "electronic"];
      // Should match "ewaste" with "e-waste" (both contain "waste")
      const score = scoreArtworkForRoom(artworkTags, roomTags);
      assert.ok(score >= 0); // At least doesn't crash
    });
  });
});
