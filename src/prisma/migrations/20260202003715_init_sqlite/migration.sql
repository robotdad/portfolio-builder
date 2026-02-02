-- CreateTable
CREATE TABLE "Portfolio" (
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

-- CreateTable
CREATE TABLE "Page" (
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

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "portfolioId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "featuredImageId" TEXT,
    "draftContent" TEXT,
    "publishedContent" TEXT,
    "lastPublishedAt" DATETIME,
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

-- CreateTable
CREATE TABLE "ProjectGalleryImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "altText" TEXT NOT NULL DEFAULT '',
    "caption" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProjectGalleryImage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProjectGalleryImage_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AllowedEmail" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Portfolio_profilePhotoId_key" ON "Portfolio"("profilePhotoId");

-- CreateIndex
CREATE UNIQUE INDEX "Page_portfolioId_slug_key" ON "Page"("portfolioId", "slug");

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

-- CreateIndex
CREATE INDEX "ProjectGalleryImage_projectId_order_idx" ON "ProjectGalleryImage"("projectId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectGalleryImage_projectId_assetId_key" ON "ProjectGalleryImage"("projectId", "assetId");

-- CreateIndex
CREATE UNIQUE INDEX "AllowedEmail_email_key" ON "AllowedEmail"("email");

-- CreateIndex
CREATE INDEX "AllowedEmail_email_idx" ON "AllowedEmail"("email");
