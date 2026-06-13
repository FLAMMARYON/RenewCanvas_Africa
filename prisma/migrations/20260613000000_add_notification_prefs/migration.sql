-- AlterTable
-- Per-user notification toggles stored as a single JSON blob (all keys default
-- on in application code when null/absent).
ALTER TABLE "User" ADD COLUMN     "notificationPrefs" JSONB;
