/**
 * Seed Gallery Tags
 *
 * Adds sample tags to existing artworks for testing enhanced room matching.
 * Run with: npx tsx prisma/seed-gallery-tags.ts
 *
 * Room Matching Categories:
 * 1. PET Bottle Wing → ["pet", "bottle", "plastic", "recycled plastic"]
 * 2. Women Artists Gallery → ["women", "female", "girl", "she", "her"]
 * 3. Youth & Student Gallery → ["youth", "student", "school", "climate", "children"]
 * 4. Cardboard Pavilion → ["cardboard", "paper", "packaging", "box"]
 * 5. E-Waste Innovation Hall → ["ewaste", "electronic", "circuit", "technology", "computer"]
 * 6. Textile & Fabric Atelier → ["textile", "fabric", "clothing", "thread", "weaving"]
 */

import "dotenv/config";
import { createDatabaseClient } from "../src/lib/backend/db";

const prisma = createDatabaseClient();

/**
 * Sample tag assignments for different artwork types
 */
const tagTemplates = {
  petBottle: ["pet", "bottle", "plastic", "recycled plastic"],
  women: ["women", "female", "artist"],
  youth: ["youth", "student", "school", "climate"],
  cardboard: ["cardboard", "paper", "packaging"],
  ewaste: ["ewaste", "electronic", "circuit", "technology"],
  textile: ["textile", "fabric", "clothing", "weaving"],
  general: ["upcycled", "sustainable", "art", "recycled"],
};

/**
 * Themes for artworks
 */
const themes = [
  "Ocean Conservation",
  "Women Empowerment",
  "Climate Action",
  "Urban Renewal",
  "Digital Age",
  "Cultural Heritage",
  "Nature",
  "Community",
  "Innovation",
  "Tradition",
];

/**
 * Artist locations in Rwanda
 */
const locations = [
  "Kigali",
  "Musanze",
  "Rubavu",
  "Huye",
  "Nyanza",
];

async function main() {
  console.log("🌱 Seeding gallery tags...\n");

  // Fetch existing artworks
  const artworks = await prisma.artwork.findMany({
    select: {
      id: true,
      title: true,
      category: true,
      materials: {
        select: {
          material: true,
        },
      },
      artist: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    take: 50, // Process first 50 artworks
  });

  if (artworks.length === 0) {
    console.log("⚠️  No artworks found. Please seed base artworks first.");
    return;
  }

  console.log(`📦 Found ${artworks.length} artworks to tag\n`);

  let updated = 0;

  for (const artwork of artworks) {
    // Determine tags based on materials and category
    let tags: string[] = [];
    const materialStr = artwork.materials
      .map((m) => m.material.toLowerCase())
      .join(" ");

    // Assign tags based on materials
    if (materialStr.includes("pet") || materialStr.includes("bottle")) {
      tags.push(...tagTemplates.petBottle);
    }
    if (materialStr.includes("cardboard") || materialStr.includes("paper")) {
      tags.push(...tagTemplates.cardboard);
    }
    if (materialStr.includes("electronic") || materialStr.includes("ewaste") || materialStr.includes("circuit")) {
      tags.push(...tagTemplates.ewaste);
    }
    if (materialStr.includes("fabric") || materialStr.includes("textile") || materialStr.includes("clothing")) {
      tags.push(...tagTemplates.textile);
    }

    // Add general tags
    tags.push(...tagTemplates.general);

    // Randomly add women/youth tags (for diversity)
    if (Math.random() > 0.7) {
      tags.push(...tagTemplates.women);
    }
    if (Math.random() > 0.8) {
      tags.push(...tagTemplates.youth);
    }

    // Remove duplicates
    tags = [...new Set(tags)];

    // Assign theme and location
    const theme = themes[Math.floor(Math.random() * themes.length)];
    const artistLocation = locations[Math.floor(Math.random() * locations.length)];

    // Impact score (random 60-95 for established artworks)
    const impactScore = Math.floor(Math.random() * 35) + 60;

    // Update artwork
    await prisma.artwork.update({
      where: { id: artwork.id },
      data: {
        tags,
        theme,
        impactScore,
        artistLocation,
      },
    });

    updated++;
    console.log(`✓ Updated "${artwork.title}" by ${artwork.artist.name}`);
    console.log(`  Tags: ${tags.slice(0, 5).join(", ")}${tags.length > 5 ? ` +${tags.length - 5} more` : ""}`);
    console.log(`  Theme: ${theme}`);
    console.log(`  Location: ${artistLocation}`);
    console.log(`  Impact: ${impactScore}/100\n`);
  }

  console.log(`\n✅ Updated ${updated} artworks with gallery tags!\n`);

  // Show sample room distribution
  console.log("📊 Testing room distribution...\n");

  const petArtworks = await prisma.artwork.count({
    where: {
      tags: {
        hasSome: ["pet", "bottle", "plastic"],
      },
    },
  });

  const womenArtworks = await prisma.artwork.count({
    where: {
      tags: {
        hasSome: ["women", "female"],
      },
    },
  });

  const youthArtworks = await prisma.artwork.count({
    where: {
      tags: {
        hasSome: ["youth", "student", "school"],
      },
    },
  });

  const cardboardArtworks = await prisma.artwork.count({
    where: {
      tags: {
        hasSome: ["cardboard", "paper"],
      },
    },
  });

  const ewasteArtworks = await prisma.artwork.count({
    where: {
      tags: {
        hasSome: ["ewaste", "electronic", "circuit"],
      },
    },
  });

  const textileArtworks = await prisma.artwork.count({
    where: {
      tags: {
        hasSome: ["textile", "fabric", "clothing"],
      },
    },
  });

  console.log("Sample room distribution:");
  console.log(`  🍾 PET Bottle Wing: ${petArtworks} artworks`);
  console.log(`  👩 Women Artists Gallery: ${womenArtworks} artworks`);
  console.log(`  🎓 Youth & Student Gallery: ${youthArtworks} artworks`);
  console.log(`  📦 Cardboard Pavilion: ${cardboardArtworks} artworks`);
  console.log(`  💻 E-Waste Innovation Hall: ${ewasteArtworks} artworks`);
  console.log(`  🧵 Textile & Fabric Atelier: ${textileArtworks} artworks`);

  console.log("\n✨ Seeding complete! Test the gallery at /virtual-room-enhanced\n");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error seeding gallery tags:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
