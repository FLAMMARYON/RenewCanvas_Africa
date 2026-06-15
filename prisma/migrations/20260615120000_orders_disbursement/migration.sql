-- AlterEnum
-- Add the `artist_paid` order status (set after the artist has been disbursed).
ALTER TYPE "OrderStatus" ADD VALUE 'artist_paid';

-- CreateTable
CREATE TABLE "Disbursement" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'RWF',
    "disbursedByAdminId" TEXT NOT NULL,
    "disbursedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Disbursement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Disbursement_orderId_idx" ON "Disbursement"("orderId");

-- CreateIndex
CREATE INDEX "Disbursement_artistId_idx" ON "Disbursement"("artistId");

-- CreateIndex
CREATE INDEX "Disbursement_disbursedByAdminId_idx" ON "Disbursement"("disbursedByAdminId");

-- AddForeignKey
ALTER TABLE "Disbursement" ADD CONSTRAINT "Disbursement_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Disbursement" ADD CONSTRAINT "Disbursement_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Disbursement" ADD CONSTRAINT "Disbursement_disbursedByAdminId_fkey" FOREIGN KEY ("disbursedByAdminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable
-- Mark in-app notifications read/unread.
ALTER TABLE "Notification" ADD COLUMN "readAt" TIMESTAMP(3);

-- CreateTable
-- Global key/value platform settings (maintenance mode, default language, …).
CREATE TABLE "SiteSetting" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("key")
);
