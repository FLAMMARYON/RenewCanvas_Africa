/*
  Warnings:

  - Added the required column `artistId` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `artistName` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "paymentMethod" TEXT NOT NULL DEFAULT 'momo';

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "artistId" TEXT NOT NULL,
ADD COLUMN     "artistName" TEXT NOT NULL,
ADD COLUMN     "artworkSlug" TEXT,
ADD COLUMN     "kgDiverted" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "ownerType" "ArtworkOwnerType" NOT NULL DEFAULT 'artist';

-- CreateIndex
CREATE INDEX "Order_buyerId_idx" ON "Order"("buyerId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_artworkId_idx" ON "OrderItem"("artworkId");

-- CreateIndex
CREATE INDEX "OrderItem_artistId_idx" ON "OrderItem"("artistId");
