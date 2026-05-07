-- CreateEnum
CREATE TYPE "ArtworkOwnerType" AS ENUM ('artist', 'renewcanvas');

-- CreateEnum
CREATE TYPE "MediaUploadStatus" AS ENUM ('pending', 'uploaded', 'failed');

-- AlterTable
ALTER TABLE "Artwork" ADD COLUMN     "dimensions" TEXT,
ADD COLUMN     "favouriteCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "ownerType" "ArtworkOwnerType" NOT NULL DEFAULT 'artist',
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "submittedAt" TIMESTAMP(3),
ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ArtworkImage" ADD COLUMN     "storageKey" TEXT,
ADD COLUMN     "storageProvider" TEXT,
ADD COLUMN     "uploadStatus" "MediaUploadStatus" NOT NULL DEFAULT 'uploaded';

-- CreateIndex
CREATE INDEX "Artwork_artistId_idx" ON "Artwork"("artistId");

-- CreateIndex
CREATE INDEX "Artwork_ownerType_idx" ON "Artwork"("ownerType");

-- CreateIndex
CREATE INDEX "Artwork_status_idx" ON "Artwork"("status");

-- CreateIndex
CREATE INDEX "Artwork_createdAt_idx" ON "Artwork"("createdAt");

-- CreateIndex
CREATE INDEX "ArtworkImage_artworkId_idx" ON "ArtworkImage"("artworkId");
