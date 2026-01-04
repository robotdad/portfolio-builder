/*
  Warnings:

  - You are about to drop the column `content` on the `Page` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `Portfolio` table. All the data in the column will be lost.
  - You are about to drop the column `theme` on the `Portfolio` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "portfolioId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "featuredImageId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Category_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Category_featuredImageId_fkey" FOREIGN KEY ("featuredImageId") REFERENCES "Asset" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "categoryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "draftContent" TEXT,
    "publishedContent" TEXT,
    "lastPublishedAt" DATETIME,
    "year" TEXT,
    "venue" TEXT,
    "role" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "featuredImageId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Project_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Project_featuredImageId_fkey" FOREIGN KEY ("featuredImageId") REFERENCES "Asset" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Page" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "portfolioId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "navOrder" INTEGER NOT NULL DEFAULT 0,
    "isHomepage" BOOLEAN NOT NULL DEFAULT false,
    "showInNav" BOOLEAN NOT NULL DEFAULT true,
    "draftContent" TEXT,
    "publishedContent" TEXT,
    "lastPublishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Page_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Page" ("createdAt", "id", "isHomepage", "navOrder", "portfolioId", "showInNav", "slug", "title", "updatedAt") SELECT "createdAt", "id", "isHomepage", "navOrder", "portfolioId", "showInNav", "slug", "title", "updatedAt" FROM "Page";
DROP TABLE "Page";
ALTER TABLE "new_Page" RENAME TO "Page";
CREATE UNIQUE INDEX "Page_portfolioId_slug_key" ON "Page"("portfolioId", "slug");
CREATE TABLE "new_Portfolio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "draftTheme" TEXT NOT NULL DEFAULT 'modern-minimal',
    "publishedTheme" TEXT NOT NULL DEFAULT 'modern-minimal',
    "draftTemplate" TEXT NOT NULL DEFAULT 'featured-grid',
    "publishedTemplate" TEXT NOT NULL DEFAULT 'featured-grid',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "profilePhotoId" TEXT,
    CONSTRAINT "Portfolio_profilePhotoId_fkey" FOREIGN KEY ("profilePhotoId") REFERENCES "Asset" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Portfolio" ("bio", "createdAt", "id", "name", "slug", "title", "updatedAt") SELECT "bio", "createdAt", "id", "name", "slug", "title", "updatedAt" FROM "Portfolio";
DROP TABLE "Portfolio";
ALTER TABLE "new_Portfolio" RENAME TO "Portfolio";
CREATE UNIQUE INDEX "Portfolio_slug_key" ON "Portfolio"("slug");
CREATE UNIQUE INDEX "Portfolio_profilePhotoId_key" ON "Portfolio"("profilePhotoId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Category_portfolioId_order_idx" ON "Category"("portfolioId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Category_portfolioId_slug_key" ON "Category"("portfolioId", "slug");

-- CreateIndex
CREATE INDEX "Project_categoryId_order_idx" ON "Project"("categoryId", "order");

-- CreateIndex
CREATE INDEX "Project_isFeatured_idx" ON "Project"("isFeatured");

-- CreateIndex
CREATE UNIQUE INDEX "Project_categoryId_slug_key" ON "Project"("categoryId", "slug");
