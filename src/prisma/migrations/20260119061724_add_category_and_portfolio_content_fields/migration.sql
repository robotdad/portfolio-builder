/*
  Warnings:

  - You are about to drop the column `slug` on the `Portfolio` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Category" ADD COLUMN "draftContent" TEXT;
ALTER TABLE "Category" ADD COLUMN "lastPublishedAt" DATETIME;
ALTER TABLE "Category" ADD COLUMN "publishedContent" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Portfolio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "bio" TEXT,
    "draftTheme" TEXT NOT NULL DEFAULT 'modern-minimal',
    "publishedTheme" TEXT NOT NULL DEFAULT 'modern-minimal',
    "draftTemplate" TEXT NOT NULL DEFAULT 'featured-grid',
    "publishedTemplate" TEXT NOT NULL DEFAULT 'featured-grid',
    "lastPublishedAt" DATETIME,
    "categoryPageDraftContent" TEXT,
    "categoryPagePublishedContent" TEXT,
    "categoryPageLastPublishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "profilePhotoId" TEXT,
    CONSTRAINT "Portfolio_profilePhotoId_fkey" FOREIGN KEY ("profilePhotoId") REFERENCES "Asset" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Portfolio" ("bio", "createdAt", "draftTemplate", "draftTheme", "id", "lastPublishedAt", "name", "profilePhotoId", "publishedTemplate", "publishedTheme", "title", "updatedAt") SELECT "bio", "createdAt", "draftTemplate", "draftTheme", "id", "lastPublishedAt", "name", "profilePhotoId", "publishedTemplate", "publishedTheme", "title", "updatedAt" FROM "Portfolio";
DROP TABLE "Portfolio";
ALTER TABLE "new_Portfolio" RENAME TO "Portfolio";
CREATE UNIQUE INDEX "Portfolio_profilePhotoId_key" ON "Portfolio"("profilePhotoId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
