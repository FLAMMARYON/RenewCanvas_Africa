-- CreateTable
CREATE TABLE "WishlistItem" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "artworkId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WishlistItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WishlistItem_buyerId_idx" ON "WishlistItem"("buyerId");

-- CreateIndex
CREATE INDEX "WishlistItem_artworkId_idx" ON "WishlistItem"("artworkId");

-- CreateIndex
CREATE UNIQUE INDEX "WishlistItem_buyerId_artworkId_key" ON "WishlistItem"("buyerId", "artworkId");

-- AddForeignKey
ALTER TABLE "WishlistItem" ADD CONSTRAINT "WishlistItem_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WishlistItem" ADD CONSTRAINT "WishlistItem_artworkId_fkey" FOREIGN KEY ("artworkId") REFERENCES "Artwork"("id") ON DELETE CASCADE ON UPDATE CASCADE;
