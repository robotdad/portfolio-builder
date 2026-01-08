-- AlterTable: Add lastPublishedAt field to Portfolio
ALTER TABLE "Portfolio" ADD COLUMN "lastPublishedAt" DATETIME;

-- Backfill existing portfolios with current timestamp
-- This ensures existing sites have a publish timestamp since they already have published settings
UPDATE "Portfolio" SET "lastPublishedAt" = CURRENT_TIMESTAMP WHERE "lastPublishedAt" IS NULL;
