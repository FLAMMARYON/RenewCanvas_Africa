-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('flutterwave', 'paystack', 'stripe', 'mtn_momo', 'manual_bank');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('requires_action', 'pending', 'paid', 'failed', 'cancelled', 'refunded');

-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM ('pending', 'preparing', 'ready_for_pickup', 'in_transit', 'delivered', 'failed', 'returned');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('pending', 'eligible', 'approved', 'paid', 'failed', 'cancelled');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('email', 'sms', 'whatsapp', 'in_app');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('queued', 'sent', 'failed', 'skipped');

-- CreateEnum
CREATE TYPE "AuctionStatus" AS ENUM ('draft', 'scheduled', 'live', 'ended', 'cancelled', 'settled');

-- CreateEnum
CREATE TYPE "BidStatus" AS ENUM ('active', 'outbid', 'winning', 'rejected', 'cancelled');

-- CreateEnum
CREATE TYPE "ReturnRequestStatus" AS ENUM ('open', 'approved', 'rejected', 'closed');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "termsAcceptedAt" TIMESTAMP(3),
ADD COLUMN "privacyAcceptedAt" TIMESTAMP(3),
ADD COLUMN "deletedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "PaymentTransaction" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "buyerId" TEXT NOT NULL,
  "provider" "PaymentProvider" NOT NULL,
  "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
  "amountCents" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'RWF',
  "providerReference" TEXT,
  "providerCheckoutUrl" TEXT,
  "momoPhone" TEXT,
  "ussdReference" TEXT,
  "idempotencyKey" TEXT NOT NULL,
  "webhookEventId" TEXT,
  "rawProviderPayload" JSONB,
  "failureReason" TEXT,
  "paidAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PaymentTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Refund" (
  "id" TEXT NOT NULL,
  "paymentTransactionId" TEXT NOT NULL,
  "amountCents" INTEGER NOT NULL,
  "reason" TEXT NOT NULL,
  "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
  "providerReference" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Refund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shipment" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "buyerId" TEXT NOT NULL,
  "status" "ShipmentStatus" NOT NULL DEFAULT 'pending',
  "carrier" TEXT,
  "trackingNumber" TEXT,
  "deliveryAddress" JSONB NOT NULL,
  "deliveryFeeCents" INTEGER NOT NULL DEFAULT 0,
  "artistPrepDueAt" TIMESTAMP(3),
  "shippedAt" TIMESTAMP(3),
  "deliveredAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayoutLedger" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "orderItemId" TEXT,
  "artistId" TEXT NOT NULL,
  "status" "PayoutStatus" NOT NULL DEFAULT 'pending',
  "grossCents" INTEGER NOT NULL,
  "platformFeeCents" INTEGER NOT NULL,
  "deliveryCostCents" INTEGER NOT NULL DEFAULT 0,
  "payoutCents" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'RWF',
  "eligibleAt" TIMESTAMP(3) NOT NULL,
  "approvedAt" TIMESTAMP(3),
  "paidAt" TIMESTAMP(3),
  "failedAt" TIMESTAMP(3),
  "failureReason" TEXT,
  "providerReference" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PayoutLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReturnRequest" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "buyerId" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "status" "ReturnRequestStatus" NOT NULL DEFAULT 'open',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ReturnRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "channel" "NotificationChannel" NOT NULL,
  "status" "NotificationStatus" NOT NULL DEFAULT 'queued',
  "templateKey" TEXT NOT NULL,
  "subject" TEXT,
  "body" TEXT NOT NULL,
  "metadata" JSONB,
  "errorMessage" TEXT,
  "sentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationPreference" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
  "smsEnabled" BOOLEAN NOT NULL DEFAULT false,
  "whatsappEnabled" BOOLEAN NOT NULL DEFAULT false,
  "orderUpdates" BOOLEAN NOT NULL DEFAULT true,
  "moderation" BOOLEAN NOT NULL DEFAULT true,
  "auctions" BOOLEAN NOT NULL DEFAULT true,
  "marketing" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Auction" (
  "id" TEXT NOT NULL,
  "artworkId" TEXT NOT NULL,
  "status" "AuctionStatus" NOT NULL DEFAULT 'draft',
  "title" TEXT NOT NULL,
  "startsAt" TIMESTAMP(3) NOT NULL,
  "endsAt" TIMESTAMP(3) NOT NULL,
  "startingBidCents" INTEGER NOT NULL,
  "reserveCents" INTEGER,
  "minIncrementCents" INTEGER NOT NULL DEFAULT 1000,
  "currency" TEXT NOT NULL DEFAULT 'RWF',
  "winnerBidId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Auction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuctionBid" (
  "id" TEXT NOT NULL,
  "auctionId" TEXT NOT NULL,
  "bidderId" TEXT NOT NULL,
  "amountCents" INTEGER NOT NULL,
  "status" "BidStatus" NOT NULL DEFAULT 'active',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuctionBid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VirtualRoomState" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "isPublic" BOOLEAN NOT NULL DEFAULT false,
  "shareToken" TEXT,
  "roomState" JSONB NOT NULL,
  "viewedArtworkIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "VirtualRoomState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "sessionId" TEXT,
  "eventName" TEXT NOT NULL,
  "entityType" TEXT,
  "entityId" TEXT,
  "metadata" JSONB,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsDailyAggregate" (
  "id" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "metric" TEXT NOT NULL,
  "entityType" TEXT,
  "entityId" TEXT,
  "value" INTEGER NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AnalyticsDailyAggregate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityEvent" (
  "id" TEXT NOT NULL,
  "actorId" TEXT,
  "eventType" TEXT NOT NULL,
  "severity" TEXT NOT NULL,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SecurityEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentTransaction_idempotencyKey_key" ON "PaymentTransaction"("idempotencyKey");
CREATE UNIQUE INDEX "PaymentTransaction_webhookEventId_key" ON "PaymentTransaction"("webhookEventId");
CREATE INDEX "PaymentTransaction_orderId_idx" ON "PaymentTransaction"("orderId");
CREATE INDEX "PaymentTransaction_buyerId_idx" ON "PaymentTransaction"("buyerId");
CREATE INDEX "PaymentTransaction_status_idx" ON "PaymentTransaction"("status");
CREATE INDEX "PaymentTransaction_providerReference_idx" ON "PaymentTransaction"("providerReference");
CREATE INDEX "Refund_paymentTransactionId_idx" ON "Refund"("paymentTransactionId");
CREATE INDEX "Refund_status_idx" ON "Refund"("status");
CREATE UNIQUE INDEX "Shipment_orderId_key" ON "Shipment"("orderId");
CREATE INDEX "Shipment_buyerId_idx" ON "Shipment"("buyerId");
CREATE INDEX "Shipment_status_idx" ON "Shipment"("status");
CREATE INDEX "PayoutLedger_orderId_idx" ON "PayoutLedger"("orderId");
CREATE INDEX "PayoutLedger_artistId_idx" ON "PayoutLedger"("artistId");
CREATE INDEX "PayoutLedger_status_idx" ON "PayoutLedger"("status");
CREATE INDEX "PayoutLedger_eligibleAt_idx" ON "PayoutLedger"("eligibleAt");
CREATE INDEX "ReturnRequest_orderId_idx" ON "ReturnRequest"("orderId");
CREATE INDEX "ReturnRequest_buyerId_idx" ON "ReturnRequest"("buyerId");
CREATE INDEX "ReturnRequest_status_idx" ON "ReturnRequest"("status");
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");
CREATE INDEX "Notification_status_idx" ON "Notification"("status");
CREATE INDEX "Notification_channel_idx" ON "Notification"("channel");
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");
CREATE UNIQUE INDEX "NotificationPreference_userId_key" ON "NotificationPreference"("userId");
CREATE INDEX "Auction_artworkId_idx" ON "Auction"("artworkId");
CREATE INDEX "Auction_status_idx" ON "Auction"("status");
CREATE INDEX "Auction_startsAt_idx" ON "Auction"("startsAt");
CREATE INDEX "Auction_endsAt_idx" ON "Auction"("endsAt");
CREATE INDEX "AuctionBid_auctionId_idx" ON "AuctionBid"("auctionId");
CREATE INDEX "AuctionBid_bidderId_idx" ON "AuctionBid"("bidderId");
CREATE INDEX "AuctionBid_status_idx" ON "AuctionBid"("status");
CREATE UNIQUE INDEX "AuctionBid_auctionId_bidderId_amountCents_key" ON "AuctionBid"("auctionId", "bidderId", "amountCents");
CREATE UNIQUE INDEX "VirtualRoomState_shareToken_key" ON "VirtualRoomState"("shareToken");
CREATE INDEX "VirtualRoomState_userId_idx" ON "VirtualRoomState"("userId");
CREATE INDEX "VirtualRoomState_isPublic_idx" ON "VirtualRoomState"("isPublic");
CREATE INDEX "AnalyticsEvent_userId_idx" ON "AnalyticsEvent"("userId");
CREATE INDEX "AnalyticsEvent_eventName_idx" ON "AnalyticsEvent"("eventName");
CREATE INDEX "AnalyticsEvent_entityType_entityId_idx" ON "AnalyticsEvent"("entityType", "entityId");
CREATE INDEX "AnalyticsEvent_occurredAt_idx" ON "AnalyticsEvent"("occurredAt");
CREATE UNIQUE INDEX "AnalyticsDailyAggregate_date_metric_entityType_entityId_key" ON "AnalyticsDailyAggregate"("date", "metric", "entityType", "entityId");
CREATE INDEX "AnalyticsDailyAggregate_date_idx" ON "AnalyticsDailyAggregate"("date");
CREATE INDEX "AnalyticsDailyAggregate_metric_idx" ON "AnalyticsDailyAggregate"("metric");
CREATE INDEX "SecurityEvent_actorId_idx" ON "SecurityEvent"("actorId");
CREATE INDEX "SecurityEvent_eventType_idx" ON "SecurityEvent"("eventType");
CREATE INDEX "SecurityEvent_severity_idx" ON "SecurityEvent"("severity");
CREATE INDEX "SecurityEvent_createdAt_idx" ON "SecurityEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_paymentTransactionId_fkey" FOREIGN KEY ("paymentTransactionId") REFERENCES "PaymentTransaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PayoutLedger" ADD CONSTRAINT "PayoutLedger_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PayoutLedger" ADD CONSTRAINT "PayoutLedger_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PayoutLedger" ADD CONSTRAINT "PayoutLedger_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ReturnRequest" ADD CONSTRAINT "ReturnRequest_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReturnRequest" ADD CONSTRAINT "ReturnRequest_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Auction" ADD CONSTRAINT "Auction_artworkId_fkey" FOREIGN KEY ("artworkId") REFERENCES "Artwork"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AuctionBid" ADD CONSTRAINT "AuctionBid_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuctionBid" ADD CONSTRAINT "AuctionBid_bidderId_fkey" FOREIGN KEY ("bidderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "VirtualRoomState" ADD CONSTRAINT "VirtualRoomState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
