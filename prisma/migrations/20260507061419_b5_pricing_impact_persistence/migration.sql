-- CreateTable
CREATE TABLE "PricingRecommendation" (
    "id" TEXT NOT NULL,
    "artworkId" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "methodologyVersion" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'RWF',
    "minCents" INTEGER NOT NULL,
    "maxCents" INTEGER NOT NULL,
    "suggestedCents" INTEGER NOT NULL,
    "confidence" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "factors" JSONB NOT NULL,
    "input" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PricingRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImpactEstimate" (
    "id" TEXT NOT NULL,
    "artworkId" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "methodologyVersion" TEXT NOT NULL,
    "kgDiverted" DECIMAL(65,30) NOT NULL,
    "co2eAvoidedKg" DECIMAL(65,30) NOT NULL,
    "landfillVolumeAvoidedLitres" DECIMAL(65,30) NOT NULL,
    "confidence" TEXT NOT NULL,
    "assumptions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "input" JSONB NOT NULL,
    "result" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImpactEstimate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PricingRecommendation_artworkId_idx" ON "PricingRecommendation"("artworkId");

-- CreateIndex
CREATE INDEX "PricingRecommendation_artistId_idx" ON "PricingRecommendation"("artistId");

-- CreateIndex
CREATE INDEX "PricingRecommendation_createdAt_idx" ON "PricingRecommendation"("createdAt");

-- CreateIndex
CREATE INDEX "ImpactEstimate_artworkId_idx" ON "ImpactEstimate"("artworkId");

-- CreateIndex
CREATE INDEX "ImpactEstimate_artistId_idx" ON "ImpactEstimate"("artistId");

-- CreateIndex
CREATE INDEX "ImpactEstimate_createdAt_idx" ON "ImpactEstimate"("createdAt");

-- AddForeignKey
ALTER TABLE "PricingRecommendation" ADD CONSTRAINT "PricingRecommendation_artworkId_fkey" FOREIGN KEY ("artworkId") REFERENCES "Artwork"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PricingRecommendation" ADD CONSTRAINT "PricingRecommendation_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImpactEstimate" ADD CONSTRAINT "ImpactEstimate_artworkId_fkey" FOREIGN KEY ("artworkId") REFERENCES "Artwork"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImpactEstimate" ADD CONSTRAINT "ImpactEstimate_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
