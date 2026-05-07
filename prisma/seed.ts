import "dotenv/config";
import { createDatabaseClient } from "../src/lib/backend/db";
import { hashPassword } from "../src/lib/backend/auth";

const prisma = createDatabaseClient();
const adminEmail = "hello.renewcanvas.africa@gmail.com";

async function main() {
  const demoPasswordHash = await hashPassword("Password1!");
  const existingContactAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingContactAdmin) {
    await prisma.user.updateMany({
      where: { email: "admin@renewcanvas.africa" },
      data: { email: adminEmail },
    });
  }

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { name: "RenewCanvas Admin", role: "admin", passwordHash: demoPasswordHash },
    create: {
      email: adminEmail,
      name: "RenewCanvas Admin",
      role: "admin",
      passwordHash: demoPasswordHash,
    },
  });

  const artist = await prisma.user.upsert({
    where: { email: "artist@renewcanvas.africa" },
    update: { passwordHash: demoPasswordHash },
    create: {
      email: "artist@renewcanvas.africa",
      name: "Marie Uwimana",
      role: "artist",
      passwordHash: demoPasswordHash,
    },
  });

  await prisma.artistProfile.upsert({
    where: { userId: artist.id },
    update: {
      firstName: "Marie",
      lastName: "Uwimana",
      phone: "+250 788 123 456",
      bio: "Upcycled mixed-media artist from Kigali.",
      location: "Kigali, Rwanda",
      website: "www.marieuwimana.art",
      instagram: "@marieuwimana_art",
      twitter: "@marieuwimana",
      facebook: "marieuwimana.art",
      verificationStatus: "approved",
      specialties: ["Wall Art", "Mixed Media"],
      techniques: ["Assemblage", "Mosaic"],
      preferredMaterials: ["PET bottles", "Fabric scraps"],
      yearsExperience: 5,
      payoutMethod: "MTN Mobile Money",
      payoutAccountName: "Marie Uwimana",
      payoutAccountNumber: "+250 788 123 456",
    },
    create: {
      userId: artist.id,
      firstName: "Marie",
      lastName: "Uwimana",
      phone: "+250 788 123 456",
      bio: "Upcycled mixed-media artist from Kigali.",
      location: "Kigali, Rwanda",
      website: "www.marieuwimana.art",
      instagram: "@marieuwimana_art",
      twitter: "@marieuwimana",
      facebook: "marieuwimana.art",
      verificationStatus: "approved",
      specialties: ["Wall Art", "Mixed Media"],
      techniques: ["Assemblage", "Mosaic"],
      preferredMaterials: ["PET bottles", "Fabric scraps"],
      yearsExperience: 5,
      payoutMethod: "MTN Mobile Money",
      payoutAccountName: "Marie Uwimana",
      payoutAccountNumber: "+250 788 123 456",
    },
  });

  const buyer = await prisma.user.upsert({
    where: { email: "buyer@renewcanvas.africa" },
    update: { passwordHash: demoPasswordHash },
    create: {
      email: "buyer@renewcanvas.africa",
      name: "Amina Buyer",
      role: "buyer",
      passwordHash: demoPasswordHash,
    },
  });

  await prisma.buyerProfile.upsert({
    where: { userId: buyer.id },
    update: {
      firstName: "Amina",
      lastName: "Buyer",
      phone: "+250 788 555 010",
    },
    create: {
      userId: buyer.id,
      firstName: "Amina",
      lastName: "Buyer",
      phone: "+250 788 555 010",
    },
  });

  await prisma.adminProfile.upsert({
    where: { userId: admin.id },
    update: {
      firstName: "RenewCanvas",
      lastName: "Admin",
      title: "Operations Admin",
      phone: "+250 788 555 001",
    },
    create: {
      userId: admin.id,
      firstName: "RenewCanvas",
      lastName: "Admin",
      title: "Operations Admin",
      phone: "+250 788 555 001",
    },
  });

  await prisma.address.upsert({
    where: { seedKey: "buyer.default_delivery" },
    update: {
      userId: buyer.id,
      label: "Default delivery",
      recipientName: "Amina Buyer",
      phone: "+250 788 555 010",
      line1: "KG 123 St, Kimironko",
      city: "Kigali",
      country: "Rwanda",
      isDefault: true,
    },
    create: {
      seedKey: "buyer.default_delivery",
      userId: buyer.id,
      label: "Default delivery",
      recipientName: "Amina Buyer",
      phone: "+250 788 555 010",
      line1: "KG 123 St, Kimironko",
      city: "Kigali",
      country: "Rwanda",
      isDefault: true,
    },
  });

  const artwork = await prisma.artwork.upsert({
    where: { slug: "ocean-waves" },
    update: {
      artistId: artist.id,
      title: "Ocean Waves",
      description: "A wall artwork made from recovered PET bottles and fabric scraps.",
      category: "Wall Art",
      ownerType: "artist",
      status: "listed",
      priceCents: 4_200_000,
      dimensions: "60cm x 80cm",
      kgDiverted: 2.5,
      favouriteCount: 1,
      submittedAt: new Date("2026-04-10T08:00:00.000Z"),
      reviewedAt: new Date("2026-04-11T08:00:00.000Z"),
    },
    create: {
      artistId: artist.id,
      slug: "ocean-waves",
      title: "Ocean Waves",
      description: "A wall artwork made from recovered PET bottles and fabric scraps.",
      category: "Wall Art",
      ownerType: "artist",
      status: "listed",
      priceCents: 4_200_000,
      dimensions: "60cm x 80cm",
      kgDiverted: 2.5,
      favouriteCount: 1,
      submittedAt: new Date("2026-04-10T08:00:00.000Z"),
      reviewedAt: new Date("2026-04-11T08:00:00.000Z"),
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

  await prisma.artwork.upsert({
    where: { slug: "sunset-reflections" },
    update: {
      artistId: artist.id,
      title: "Sunset Reflections",
      description: "A glass and PET wall piece inspired by sunset over Lake Kivu.",
      category: "Wall Art",
      ownerType: "artist",
      status: "submitted",
      priceCents: 3_800_000,
      dimensions: "60cm x 40cm",
      kgDiverted: 2,
      submittedAt: new Date("2026-04-30T10:30:00.000Z"),
    },
    create: {
      artistId: artist.id,
      slug: "sunset-reflections",
      title: "Sunset Reflections",
      description: "A glass and PET wall piece inspired by sunset over Lake Kivu.",
      category: "Wall Art",
      ownerType: "artist",
      status: "submitted",
      priceCents: 3_800_000,
      dimensions: "60cm x 40cm",
      kgDiverted: 2,
      submittedAt: new Date("2026-04-30T10:30:00.000Z"),
      images: {
        create: {
          url: "/placeholder-artwork/sunset-reflections.jpg",
          altText: "Sunset Reflections upcycled artwork",
        },
      },
      materials: {
        createMany: {
          data: [
            { material: "Glass", weightKg: 1.1, source: "Community cleanup", isVerified: true },
            { material: "PET bottles", weightKg: 0.9, source: "School collection", isVerified: true },
          ],
        },
      },
    },
  });

  await prisma.artwork.upsert({
    where: { slug: "renewcanvas-studio-panel" },
    update: {
      artistId: admin.id,
      title: "RenewCanvas Studio Panel",
      description: "Platform-owned artwork created from RenewCanvas studio inventory and community collection materials.",
      category: "Wall Art",
      ownerType: "renewcanvas",
      status: "listed",
      priceCents: 6_200_000,
      dimensions: "75cm x 55cm",
      kgDiverted: 3.1,
      submittedAt: new Date("2026-04-26T12:00:00.000Z"),
      reviewedAt: new Date("2026-04-26T14:00:00.000Z"),
    },
    create: {
      artistId: admin.id,
      slug: "renewcanvas-studio-panel",
      title: "RenewCanvas Studio Panel",
      description: "Platform-owned artwork created from RenewCanvas studio inventory and community collection materials.",
      category: "Wall Art",
      ownerType: "renewcanvas",
      status: "listed",
      priceCents: 6_200_000,
      dimensions: "75cm x 55cm",
      kgDiverted: 3.1,
      submittedAt: new Date("2026-04-26T12:00:00.000Z"),
      reviewedAt: new Date("2026-04-26T14:00:00.000Z"),
      images: {
        create: {
          url: "/placeholder-artwork/studio-panel.jpg",
          altText: "RenewCanvas Studio Panel platform-owned artwork",
        },
      },
      materials: {
        createMany: {
          data: [
            { material: "PET bottles", weightKg: 2, source: "RenewCanvas partner", isVerified: true },
            { material: "Cardboard", weightKg: 1.1, source: "Business donation", isVerified: true },
          ],
        },
      },
    },
  });

  await prisma.wishlistItem.upsert({
    where: { buyerId_artworkId: { buyerId: buyer.id, artworkId: artwork.id } },
    update: {},
    create: {
      buyerId: buyer.id,
      artworkId: artwork.id,
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
