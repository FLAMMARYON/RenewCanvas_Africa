-- CreateEnum
CREATE TYPE "CommissionRequestStatus" AS ENUM ('submitted', 'assigned', 'accepted', 'rejected', 'cancelled', 'completed');

-- CreateEnum
CREATE TYPE "CommissionSizeCategory" AS ENUM ('small', 'medium', 'large', 'custom');

-- CreateTable
CREATE TABLE "CommissionRequest" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "assignedArtistId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "preferredMaterials" TEXT,
    "budgetCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'RWF',
    "sizeCategory" "CommissionSizeCategory" NOT NULL,
    "dimensions" TEXT,
    "status" "CommissionRequestStatus" NOT NULL DEFAULT 'submitted',
    "adminNotes" TEXT,
    "artistResponseNote" TEXT,
    "assignedAt" TIMESTAMP(3),
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommissionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CommissionRequest_buyerId_idx" ON "CommissionRequest"("buyerId");

-- CreateIndex
CREATE INDEX "CommissionRequest_assignedArtistId_idx" ON "CommissionRequest"("assignedArtistId");

-- CreateIndex
CREATE INDEX "CommissionRequest_status_idx" ON "CommissionRequest"("status");

-- CreateIndex
CREATE INDEX "CommissionRequest_createdAt_idx" ON "CommissionRequest"("createdAt");

-- AddForeignKey
ALTER TABLE "CommissionRequest" ADD CONSTRAINT "CommissionRequest_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionRequest" ADD CONSTRAINT "CommissionRequest_assignedArtistId_fkey" FOREIGN KEY ("assignedArtistId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
