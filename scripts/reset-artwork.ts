/**
 * Reset artwork to listed status and cancel pending orders
 * Usage: npx tsx scripts/reset-artwork.ts <artworkId>
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import * as dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const ARTWORK_ID = process.argv[2] || "cmosnsmp900042gtsfwuzdvii";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("DATABASE_URL environment variable is required");
    console.error("Make sure .env.local or .env contains DATABASE_URL");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const prisma = new PrismaClient({
    adapter: new PrismaPg(pool),
  });

  try {
    console.log(`\nResetting artwork: ${ARTWORK_ID}\n`);

    // 1. Find the artwork
    const artwork = await prisma.artwork.findUnique({
      where: { id: ARTWORK_ID },
      select: { id: true, title: true, status: true, slug: true },
    });

    if (!artwork) {
      console.error(`Artwork not found: ${ARTWORK_ID}`);
      process.exit(1);
    }

    console.log(`Found artwork: "${artwork.title}" (${artwork.slug})`);
    console.log(`Current status: ${artwork.status}`);

    // 2. Find pending orders containing this artwork
    const pendingOrderItems = await prisma.orderItem.findMany({
      where: {
        artworkId: ARTWORK_ID,
        order: {
          status: {
            in: ["pending_payment", "paid", "processing"],
          },
        },
      },
      include: {
        order: {
          select: { id: true, status: true, buyerId: true, createdAt: true },
        },
      },
    });

    console.log(`\nFound ${pendingOrderItems.length} pending order(s) to cancel`);

    // 3. Cancel pending orders
    if (pendingOrderItems.length > 0) {
      const orderIds = [...new Set(pendingOrderItems.map((item) => item.order.id))];

      for (const orderId of orderIds) {
        const order = pendingOrderItems.find((item) => item.order.id === orderId)?.order;
        console.log(`  - Cancelling order ${orderId} (status: ${order?.status})`);
      }

      await prisma.order.updateMany({
        where: { id: { in: orderIds } },
        data: { status: "cancelled" },
      });

      // Also cancel any pending payouts for these orders
      await prisma.payoutLedger.updateMany({
        where: {
          orderId: { in: orderIds },
          status: { in: ["pending", "eligible"] },
        },
        data: { status: "cancelled" },
      });

      // Cancel any pending shipments
      await prisma.shipment.updateMany({
        where: {
          orderId: { in: orderIds },
          status: { in: ["pending", "preparing", "ready_for_pickup"] },
        },
        data: { status: "failed" },
      });

      console.log(`Cancelled ${orderIds.length} order(s)`);
    }

    // 4. Reset artwork status to listed
    const updatedArtwork = await prisma.artwork.update({
      where: { id: ARTWORK_ID },
      data: { status: "listed" },
      select: { id: true, title: true, status: true },
    });

    console.log(`\nArtwork status updated to: ${updatedArtwork.status}`);
    console.log("\nDone!");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
