-- CreateEnum
CREATE TYPE "VerificationReviewStatus" AS ENUM ('pending', 'approved', 'rejected', 'more_info_requested');

-- CreateEnum
CREATE TYPE "VerificationEvidenceType" AS ENUM ('material_photo', 'process_photo', 'identity_document', 'note', 'other');

-- CreateTable
CREATE TABLE "VerificationReview" (
    "id" TEXT NOT NULL,
    "artworkId" TEXT NOT NULL,
    "status" "VerificationReviewStatus" NOT NULL DEFAULT 'pending',
    "recommendedAction" TEXT,
    "reviewFlags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "adminNotes" TEXT,
    "artistMessage" TEXT,
    "decidedById" TEXT,
    "decidedAt" TIMESTAMP(3),
    "requestedInfoAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationEvidenceAttachment" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "artworkId" TEXT NOT NULL,
    "uploaderId" TEXT NOT NULL,
    "type" "VerificationEvidenceType" NOT NULL DEFAULT 'other',
    "url" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationEvidenceAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VerificationReview_artworkId_key" ON "VerificationReview"("artworkId");

-- CreateIndex
CREATE INDEX "VerificationReview_status_idx" ON "VerificationReview"("status");

-- CreateIndex
CREATE INDEX "VerificationReview_decidedById_idx" ON "VerificationReview"("decidedById");

-- CreateIndex
CREATE INDEX "VerificationReview_createdAt_idx" ON "VerificationReview"("createdAt");

-- CreateIndex
CREATE INDEX "VerificationEvidenceAttachment_reviewId_idx" ON "VerificationEvidenceAttachment"("reviewId");

-- CreateIndex
CREATE INDEX "VerificationEvidenceAttachment_artworkId_idx" ON "VerificationEvidenceAttachment"("artworkId");

-- CreateIndex
CREATE INDEX "VerificationEvidenceAttachment_uploaderId_idx" ON "VerificationEvidenceAttachment"("uploaderId");

-- CreateIndex
CREATE INDEX "VerificationEvidenceAttachment_createdAt_idx" ON "VerificationEvidenceAttachment"("createdAt");

-- AddForeignKey
ALTER TABLE "VerificationReview" ADD CONSTRAINT "VerificationReview_artworkId_fkey" FOREIGN KEY ("artworkId") REFERENCES "Artwork"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationReview" ADD CONSTRAINT "VerificationReview_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationEvidenceAttachment" ADD CONSTRAINT "VerificationEvidenceAttachment_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "VerificationReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationEvidenceAttachment" ADD CONSTRAINT "VerificationEvidenceAttachment_artworkId_fkey" FOREIGN KEY ("artworkId") REFERENCES "Artwork"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationEvidenceAttachment" ADD CONSTRAINT "VerificationEvidenceAttachment_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
