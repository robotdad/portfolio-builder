-- AlterTable
ALTER TABLE "Portfolio" ADD COLUMN "content" TEXT;

-- CreateTable
CREATE TABLE "Page" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "portfolioId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "navOrder" INTEGER NOT NULL DEFAULT 0,
    "isHomepage" BOOLEAN NOT NULL DEFAULT false,
    "showInNav" BOOLEAN NOT NULL DEFAULT true,
    "content" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Page_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "portfolioId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT NOT NULL,
    "placeholderUrl" TEXT NOT NULL,
    "srcset400" TEXT,
    "srcset800" TEXT,
    "srcset1200" TEXT,
    "srcset1600" TEXT,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "altText" TEXT NOT NULL DEFAULT '',
    "caption" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Asset_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Page_portfolioId_slug_key" ON "Page"("portfolioId", "slug");
