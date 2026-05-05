import "dotenv/config";
import { createDatabaseClient } from "../src/lib/backend/db";

const prisma = createDatabaseClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@renewcanvas.africa" },
    update: {},
    create: {
      email: "admin@renewcanvas.africa",
      name: "RenewCanvas Admin",
      role: "admin",
    },
  });

  const artist = await prisma.user.upsert({
    where: { email: "artist@renewcanvas.africa" },
    update: {},
    create: {
      email: "artist@renewcanvas.africa",
      name: "Marie Uwimana",
      role: "artist",
    },
  });

  await prisma.artistProfile.upsert({
    where: { userId: artist.id },
    update: {
      bio: "Upcycled mixed-media artist from Kigali.",
      location: "Kigali, Rwanda",
      verificationStatus: "approved",
      specialties: ["Wall Art", "Mixed Media"],
      preferredMaterials: ["PET bottles", "Fabric scraps"],
    },
    create: {
      userId: artist.id,
      bio: "Upcycled mixed-media artist from Kigali.",
      location: "Kigali, Rwanda",
      verificationStatus: "approved",
      specialties: ["Wall Art", "Mixed Media"],
      preferredMaterials: ["PET bottles", "Fabric scraps"],
    },
  });

  const buyer = await prisma.user.upsert({
    where: { email: "buyer@renewcanvas.africa" },
    update: {},
    create: {
      email: "buyer@renewcanvas.africa",
      name: "Amina Buyer",
      role: "buyer",
    },
  });

  const artwork = await prisma.artwork.upsert({
    where: { slug: "ocean-waves" },
    update: {
      artistId: artist.id,
      title: "Ocean Waves",
      description: "A wall artwork made from recovered PET bottles and fabric scraps.",
      category: "Wall Art",
      status: "listed",
      priceCents: 4_200_000,
      kgDiverted: 2.5,
    },
    create: {
      artistId: artist.id,
      slug: "ocean-waves",
      title: "Ocean Waves",
      description: "A wall artwork made from recovered PET bottles and fabric scraps.",
      category: "Wall Art",
      status: "listed",
      priceCents: 4_200_000,
      kgDiverted: 2.5,
      images: {
        create: {
          url: "/placeholder-artwork/ocean-waves.jpg",
          altText: "Ocean Waves upcycled artwork",
        },
      },
      materials: {
        createMany: {
          data: [
            { material: "PET bottles", weightKg: 1.5, source: "Community cleanup", isVerified: true },
            { material: "Fabric scraps", weightKg: 1, source: "Tailor offcuts", isVerified: true },
          ],
        },
      },
    },
  });

  await prisma.auditLog.upsert({
    where: { seedKey: "backend_foundation.ocean_waves" },
    update: {
      actorId: admin.id,
      entityId: artwork.id,
      metadata: { buyerId: buyer.id },
    },
    create: {
      seedKey: "backend_foundation.ocean_waves",
      actorId: admin.id,
      action: "seed.backend_foundation",
      entity: "artwork",
      entityId: artwork.id,
      metadata: { buyerId: buyer.id },
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
