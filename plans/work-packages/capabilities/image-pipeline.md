# Capability: Image Pipeline

A self-contained work package for implementing image upload, processing, and storage.

## Overview

Implement a complete image processing pipeline using Sharp.js that handles upload, optimization, thumbnail generation, and blur placeholder creation. Abstract storage behind a provider interface for local development and S3-compatible production.

## Prerequisites

- Foundation artifacts complete (data-models, api-contracts)
- Prisma schema with Asset model
- Auth system implemented (for protected endpoints)

## Deliverables

1. Storage provider interface
2. Local storage implementation
3. S3 storage implementation
4. Sharp.js image processor
5. Asset upload API route
6. Asset management routes (list, get, update, delete)
7. Blur placeholder generator

---

## 1. Storage Provider Interface

Create `src/lib/storage/types.ts`:

```typescript
export interface StorageProvider {
  /**
   * Upload a file to storage
   * @param buffer - File contents
   * @param path - Storage path (e.g., "sites/abc123/images/photo.webp")
   * @param contentType - MIME type
   * @returns Public URL to access the file
   */
  upload(buffer: Buffer, path: string, contentType: string): Promise<string>;

  /**
   * Delete a file from storage
   * @param path - Storage path
   */
  delete(path: string): Promise<void>;

  /**
   * Delete multiple files
   * @param paths - Array of storage paths
   */
  deleteMany(paths: string[]): Promise<void>;

  /**
   * Get public URL for a stored file
   * @param path - Storage path
   */
  getUrl(path: string): string;

  /**
   * Check if a file exists
   * @param path - Storage path
   */
  exists(path: string): Promise<boolean>;
}

export interface ProcessedImage {
  display: {
    buffer: Buffer;
    width: number;
    height: number;
    format: string;
  };
  thumbnail: {
    buffer: Buffer;
    width: number;
    height: number;
  };
  placeholder: string; // Base64 data URL
  metadata: {
    originalWidth: number;
    originalHeight: number;
    originalSize: number;
    format: string;
    dominantColor?: string;
  };
}
```

---

## 2. Local Storage Implementation

Create `src/lib/storage/local.ts`:

```typescript
import fs from 'fs/promises';
import path from 'path';
import { StorageProvider } from './types';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const PUBLIC_URL_BASE = process.env.UPLOAD_URL_BASE || '/uploads';

export class LocalStorageProvider implements StorageProvider {
  private uploadDir: string;
  private urlBase: string;

  constructor(uploadDir = UPLOAD_DIR, urlBase = PUBLIC_URL_BASE) {
    this.uploadDir = uploadDir;
    this.urlBase = urlBase;
  }

  async upload(
    buffer: Buffer,
    filePath: string,
    contentType: string
  ): Promise<string> {
    const fullPath = path.join(this.uploadDir, filePath);
    const dir = path.dirname(fullPath);

    // Ensure directory exists
    await fs.mkdir(dir, { recursive: true });

    // Write file
    await fs.writeFile(fullPath, buffer);

    return this.getUrl(filePath);
  }

  async delete(filePath: string): Promise<void> {
    const fullPath = path.join(this.uploadDir, filePath);

    try {
      await fs.unlink(fullPath);
    } catch (error) {
      // Ignore if file doesn't exist
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  async deleteMany(paths: string[]): Promise<void> {
    await Promise.all(paths.map((p) => this.delete(p)));
  }

  getUrl(filePath: string): string {
    return `${this.urlBase}/${filePath}`;
  }

  async exists(filePath: string): Promise<boolean> {
    const fullPath = path.join(this.uploadDir, filePath);

    try {
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }
}
```

### Next.js Static File Serving

Create `next.config.js` addition for serving uploads:

```javascript
// next.config.js
module.exports = {
  // ... other config
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/uploads/:path*',
      },
    ];
  },
};
```

Create `src/app/api/uploads/[...path]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

const MIME_TYPES: Record<string, string> = {
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
};

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const filePath = params.path.join('/');
  const fullPath = path.join(UPLOAD_DIR, filePath);

  // Security: Prevent path traversal
  const resolvedPath = path.resolve(fullPath);
  const resolvedUploadDir = path.resolve(UPLOAD_DIR);

  if (!resolvedPath.startsWith(resolvedUploadDir)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  try {
    const buffer = await fs.readFile(fullPath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    return new NextResponse('Not Found', { status: 404 });
  }
}
```

---

## 3. S3 Storage Implementation

Create `src/lib/storage/s3.ts`:

```typescript
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { StorageProvider } from './types';

export class S3StorageProvider implements StorageProvider {
  private client: S3Client;
  private bucket: string;
  private publicUrlBase: string;

  constructor() {
    this.client = new S3Client({
      region: process.env.S3_REGION || 'auto',
      endpoint: process.env.S3_ENDPOINT, // For R2/MinIO
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      },
    });

    this.bucket = process.env.S3_BUCKET!;
    this.publicUrlBase = process.env.S3_PUBLIC_URL!; // CDN URL
  }

  async upload(
    buffer: Buffer,
    filePath: string,
    contentType: string
  ): Promise<string> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: filePath,
        Body: buffer,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000, immutable',
      })
    );

    return this.getUrl(filePath);
  }

  async delete(filePath: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: filePath,
      })
    );
  }

  async deleteMany(paths: string[]): Promise<void> {
    if (paths.length === 0) return;

    // S3 allows up to 1000 objects per delete request
    const chunks = this.chunk(paths, 1000);

    for (const chunk of chunks) {
      await this.client.send(
        new DeleteObjectsCommand({
          Bucket: this.bucket,
          Delete: {
            Objects: chunk.map((key) => ({ Key: key })),
          },
        })
      );
    }
  }

  getUrl(filePath: string): string {
    return `${this.publicUrlBase}/${filePath}`;
  }

  async exists(filePath: string): Promise<boolean> {
    try {
      await this.client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: filePath,
        })
      );
      return true;
    } catch {
      return false;
    }
  }

  private chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
```

**Package required:**
```bash
npm install @aws-sdk/client-s3
```

---

## 4. Storage Factory

Create `src/lib/storage/index.ts`:

```typescript
import { StorageProvider } from './types';
import { LocalStorageProvider } from './local';
import { S3StorageProvider } from './s3';

let storageInstance: StorageProvider | null = null;

export function getStorage(): StorageProvider {
  if (storageInstance) {
    return storageInstance;
  }

  if (process.env.STORAGE_PROVIDER === 's3') {
    storageInstance = new S3StorageProvider();
  } else {
    storageInstance = new LocalStorageProvider();
  }

  return storageInstance;
}

export * from './types';
```

---

## 5. Image Processor

Create `src/lib/images/processor.ts`:

```typescript
import sharp from 'sharp';
import { ProcessedImage } from '@/lib/storage/types';

// Configuration
const DISPLAY_MAX_WIDTH = 1920;
const DISPLAY_QUALITY = 85;
const THUMBNAIL_WIDTH = 400;
const THUMBNAIL_HEIGHT = 300;
const THUMBNAIL_QUALITY = 75;
const PLACEHOLDER_WIDTH = 40;

// Allowed MIME types
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

// Max file size (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function processImage(
  buffer: Buffer,
  mimeType: string
): Promise<ProcessedImage> {
  // Get original metadata
  const metadata = await sharp(buffer).metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error('Could not read image dimensions');
  }

  const originalWidth = metadata.width;
  const originalHeight = metadata.height;
  const originalSize = buffer.length;

  // Process display version
  // - Resize if wider than max
  // - Convert to WebP
  // - Auto-rotate based on EXIF
  // - Strip EXIF data
  let displayPipeline = sharp(buffer)
    .rotate() // Auto-rotate based on EXIF
    .withMetadata({ orientation: undefined }); // Strip EXIF

  if (originalWidth > DISPLAY_MAX_WIDTH) {
    displayPipeline = displayPipeline.resize(DISPLAY_MAX_WIDTH, null, {
      withoutEnlargement: true,
    });
  }

  const displayBuffer = await displayPipeline
    .webp({ quality: DISPLAY_QUALITY })
    .toBuffer();

  const displayMeta = await sharp(displayBuffer).metadata();

  // Process thumbnail
  // - Cover crop to exact dimensions
  // - Convert to WebP
  const thumbnailBuffer = await sharp(buffer)
    .rotate()
    .resize(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, {
      fit: 'cover',
      position: 'center',
    })
    .webp({ quality: THUMBNAIL_QUALITY })
    .toBuffer();

  const thumbnailMeta = await sharp(thumbnailBuffer).metadata();

  // Generate blur placeholder
  // - Tiny version (40px wide)
  // - Heavy blur
  // - Base64 encoded
  const placeholderBuffer = await sharp(buffer)
    .rotate()
    .resize(PLACEHOLDER_WIDTH, null)
    .blur(10)
    .webp({ quality: 20 })
    .toBuffer();

  const placeholder = `data:image/webp;base64,${placeholderBuffer.toString('base64')}`;

  // Extract dominant color (optional)
  let dominantColor: string | undefined;
  try {
    const { dominant } = await sharp(buffer)
      .resize(1, 1)
      .raw()
      .toBuffer({ resolveWithObject: true });

    // dominant is not directly available, use stats instead
    const stats = await sharp(buffer).stats();
    const r = Math.round(stats.channels[0].mean);
    const g = Math.round(stats.channels[1].mean);
    const b = Math.round(stats.channels[2].mean);
    dominantColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  } catch {
    // Ignore if can't extract color
  }

  return {
    display: {
      buffer: displayBuffer,
      width: displayMeta.width!,
      height: displayMeta.height!,
      format: 'webp',
    },
    thumbnail: {
      buffer: thumbnailBuffer,
      width: thumbnailMeta.width!,
      height: thumbnailMeta.height!,
    },
    placeholder,
    metadata: {
      originalWidth,
      originalHeight,
      originalSize,
      format: metadata.format || 'unknown',
      dominantColor,
    },
  };
}

export function validateImage(
  mimeType: string,
  size: number
): { valid: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`,
    };
  }

  if (size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  return { valid: true };
}
```

**Package required:**
```bash
npm install sharp
```

---

## 6. Asset Upload Route

Create `src/app/api/sites/[siteId]/assets/route.ts`:

```typescript
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/auth/middleware';
import { getStorage } from '@/lib/storage';
import {
  processImage,
  validateImage,
  ALLOWED_MIME_TYPES,
} from '@/lib/images/processor';
import { successResponse, errors } from '@/lib/api/response';
import { generateId } from '@/lib/id';

// GET /api/sites/:siteId/assets - List assets
export async function GET(
  request: NextRequest,
  { params }: { params: { siteId: string } }
) {
  return withAuth(request, async (userId) => {
    const { siteId } = params;

    // Verify site ownership
    const site = await prisma.site.findFirst({
      where: { id: siteId, userId },
    });

    if (!site) {
      return errors.notFound('Site');
    }

    // Parse pagination
    const url = new URL(request.url);
    const limit = Math.min(
      parseInt(url.searchParams.get('limit') || '50'),
      100
    );
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Get assets
    const [assets, total] = await Promise.all([
      prisma.asset.findMany({
        where: { siteId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          filename: true,
          mimeType: true,
          size: true,
          thumbnailUrl: true,
          width: true,
          height: true,
          altText: true,
          createdAt: true,
        },
      }),
      prisma.asset.count({ where: { siteId } }),
    ]);

    return successResponse({
      assets: assets.map((a) => ({
        ...a,
        createdAt: a.createdAt.toISOString(),
      })),
      total,
      limit,
      offset,
    });
  });
}

// POST /api/sites/:siteId/assets - Upload asset
export async function POST(
  request: NextRequest,
  { params }: { params: { siteId: string } }
) {
  return withAuth(request, async (userId) => {
    const { siteId } = params;

    // Verify site ownership
    const site = await prisma.site.findFirst({
      where: { id: siteId, userId },
    });

    if (!site) {
      return errors.notFound('Site');
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const altText = formData.get('altText') as string | null;

    if (!file) {
      return errors.validation({ file: ['File is required'] });
    }

    // Validate file
    const validation = validateImage(file.type, file.size);
    if (!validation.valid) {
      return errors.validation({ file: [validation.error!] });
    }

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Process image
    let processed;
    try {
      processed = await processImage(buffer, file.type);
    } catch (error) {
      console.error('Image processing error:', error);
      return errors.validation({ file: ['Failed to process image'] });
    }

    // Generate paths
    const assetId = generateId();
    const basePath = `sites/${siteId}/assets/${assetId}`;
    const displayPath = `${basePath}/display.webp`;
    const thumbnailPath = `${basePath}/thumbnail.webp`;

    // Upload to storage
    const storage = getStorage();

    const [displayUrl, thumbnailUrl] = await Promise.all([
      storage.upload(processed.display.buffer, displayPath, 'image/webp'),
      storage.upload(processed.thumbnail.buffer, thumbnailPath, 'image/webp'),
    ]);

    // Create database record
    const asset = await prisma.asset.create({
      data: {
        id: assetId,
        siteId,
        filename: file.name,
        mimeType: file.type,
        size: file.size,
        displayUrl,
        thumbnailUrl,
        placeholder: processed.placeholder,
        width: processed.display.width,
        height: processed.display.height,
        altText: altText || null,
        metadata: JSON.stringify({
          format: processed.metadata.format,
          aspectRatio: processed.display.width / processed.display.height,
          dominantColor: processed.metadata.dominantColor,
          originalWidth: processed.metadata.originalWidth,
          originalHeight: processed.metadata.originalHeight,
          originalSize: processed.metadata.originalSize,
        }),
      },
    });

    return successResponse(
      {
        id: asset.id,
        filename: asset.filename,
        mimeType: asset.mimeType,
        size: asset.size,
        displayUrl: asset.displayUrl,
        thumbnailUrl: asset.thumbnailUrl,
        placeholder: asset.placeholder,
        width: asset.width,
        height: asset.height,
        altText: asset.altText,
        metadata: JSON.parse(asset.metadata),
        createdAt: asset.createdAt.toISOString(),
      },
      201
    );
  });
}
```

---

## 7. Single Asset Routes

Create `src/app/api/sites/[siteId]/assets/[assetId]/route.ts`:

```typescript
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/auth/middleware';
import { getStorage } from '@/lib/storage';
import { successResponse, errors } from '@/lib/api/response';

// GET /api/sites/:siteId/assets/:assetId
export async function GET(
  request: NextRequest,
  { params }: { params: { siteId: string; assetId: string } }
) {
  return withAuth(request, async (userId) => {
    const { siteId, assetId } = params;

    // Verify site ownership
    const site = await prisma.site.findFirst({
      where: { id: siteId, userId },
    });

    if (!site) {
      return errors.notFound('Site');
    }

    const asset = await prisma.asset.findFirst({
      where: { id: assetId, siteId },
    });

    if (!asset) {
      return errors.notFound('Asset');
    }

    return successResponse({
      id: asset.id,
      filename: asset.filename,
      mimeType: asset.mimeType,
      size: asset.size,
      originalUrl: asset.originalUrl,
      displayUrl: asset.displayUrl,
      thumbnailUrl: asset.thumbnailUrl,
      placeholder: asset.placeholder,
      width: asset.width,
      height: asset.height,
      altText: asset.altText,
      caption: asset.caption,
      metadata: JSON.parse(asset.metadata),
      createdAt: asset.createdAt.toISOString(),
      updatedAt: asset.updatedAt.toISOString(),
    });
  });
}

// PATCH /api/sites/:siteId/assets/:assetId
export async function PATCH(
  request: NextRequest,
  { params }: { params: { siteId: string; assetId: string } }
) {
  return withAuth(request, async (userId) => {
    const { siteId, assetId } = params;

    // Verify site ownership
    const site = await prisma.site.findFirst({
      where: { id: siteId, userId },
    });

    if (!site) {
      return errors.notFound('Site');
    }

    const asset = await prisma.asset.findFirst({
      where: { id: assetId, siteId },
    });

    if (!asset) {
      return errors.notFound('Asset');
    }

    const body = await request.json();
    const { altText, caption, metadata: metadataUpdate } = body;

    // Update metadata if focal point changed
    let newMetadata = JSON.parse(asset.metadata);
    if (metadataUpdate?.focalPoint) {
      newMetadata.focalPoint = metadataUpdate.focalPoint;
    }

    const updated = await prisma.asset.update({
      where: { id: assetId },
      data: {
        altText: altText !== undefined ? altText : asset.altText,
        caption: caption !== undefined ? caption : asset.caption,
        metadata: JSON.stringify(newMetadata),
      },
    });

    return successResponse({
      id: updated.id,
      filename: updated.filename,
      mimeType: updated.mimeType,
      size: updated.size,
      originalUrl: updated.originalUrl,
      displayUrl: updated.displayUrl,
      thumbnailUrl: updated.thumbnailUrl,
      placeholder: updated.placeholder,
      width: updated.width,
      height: updated.height,
      altText: updated.altText,
      caption: updated.caption,
      metadata: JSON.parse(updated.metadata),
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    });
  });
}

// DELETE /api/sites/:siteId/assets/:assetId
export async function DELETE(
  request: NextRequest,
  { params }: { params: { siteId: string; assetId: string } }
) {
  return withAuth(request, async (userId) => {
    const { siteId, assetId } = params;

    // Verify site ownership
    const site = await prisma.site.findFirst({
      where: { id: siteId, userId },
    });

    if (!site) {
      return errors.notFound('Site');
    }

    const asset = await prisma.asset.findFirst({
      where: { id: assetId, siteId },
    });

    if (!asset) {
      return errors.notFound('Asset');
    }

    // Delete files from storage
    const storage = getStorage();
    const basePath = `sites/${siteId}/assets/${assetId}`;

    await storage.deleteMany([
      `${basePath}/display.webp`,
      `${basePath}/thumbnail.webp`,
    ]);

    // Delete database record
    await prisma.asset.delete({ where: { id: assetId } });

    return successResponse({ message: 'Asset deleted successfully' });
  });
}
```

---

## 8. React Hook for Assets

Create `src/hooks/useAssets.ts`:

```typescript
'use client';

import { useState, useCallback } from 'react';

interface Asset {
  id: string;
  filename: string;
  thumbnailUrl: string;
  displayUrl: string;
  placeholder: string;
  width: number;
  height: number;
  altText: string | null;
}

interface UseAssetsOptions {
  siteId: string;
}

export function useAssets({ siteId }: UseAssetsOptions) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const fetchAssets = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/sites/${siteId}/assets`, {
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch assets');
      }

      setAssets(data.data.assets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [siteId]);

  const uploadAsset = useCallback(
    async (file: File, altText?: string): Promise<Asset | null> => {
      setError(null);
      setUploadProgress(0);

      try {
        const formData = new FormData();
        formData.append('file', file);
        if (altText) {
          formData.append('altText', altText);
        }

        // Use XMLHttpRequest for progress tracking
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              setUploadProgress(Math.round((e.loaded / e.total) * 100));
            }
          });

          xhr.addEventListener('load', () => {
            setUploadProgress(null);

            if (xhr.status >= 200 && xhr.status < 300) {
              const data = JSON.parse(xhr.responseText);
              const newAsset = data.data;
              setAssets((prev) => [newAsset, ...prev]);
              resolve(newAsset);
            } else {
              const data = JSON.parse(xhr.responseText);
              reject(new Error(data.error?.message || 'Upload failed'));
            }
          });

          xhr.addEventListener('error', () => {
            setUploadProgress(null);
            reject(new Error('Upload failed'));
          });

          xhr.open('POST', `/api/sites/${siteId}/assets`);
          xhr.withCredentials = true;
          xhr.send(formData);
        });
      } catch (err) {
        setUploadProgress(null);
        const message = err instanceof Error ? err.message : 'Upload failed';
        setError(message);
        return null;
      }
    },
    [siteId]
  );

  const deleteAsset = useCallback(
    async (assetId: string): Promise<boolean> => {
      setError(null);

      try {
        const response = await fetch(
          `/api/sites/${siteId}/assets/${assetId}`,
          {
            method: 'DELETE',
            credentials: 'include',
          }
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error?.message || 'Delete failed');
        }

        setAssets((prev) => prev.filter((a) => a.id !== assetId));
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Delete failed');
        return false;
      }
    },
    [siteId]
  );

  const updateAsset = useCallback(
    async (
      assetId: string,
      updates: { altText?: string; caption?: string }
    ): Promise<boolean> => {
      setError(null);

      try {
        const response = await fetch(
          `/api/sites/${siteId}/assets/${assetId}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
            credentials: 'include',
          }
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error?.message || 'Update failed');
        }

        const data = await response.json();
        setAssets((prev) =>
          prev.map((a) => (a.id === assetId ? data.data : a))
        );
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Update failed');
        return false;
      }
    },
    [siteId]
  );

  return {
    assets,
    isLoading,
    error,
    uploadProgress,
    fetchAssets,
    uploadAsset,
    deleteAsset,
    updateAsset,
  };
}
```

---

## 9. Image Component with Blur Placeholder

Create `src/components/Image.tsx`:

```typescript
'use client';

import { useState } from 'react';
import NextImage from 'next/image';
import { cn } from '@/lib/utils';

interface ImageProps {
  src: string;
  alt: string;
  placeholder?: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
}

export function Image({
  src,
  alt,
  placeholder,
  width,
  height,
  className,
  priority = false,
}: ImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      {/* Blur placeholder */}
      {placeholder && !isLoaded && (
        <img
          src={placeholder}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover scale-110 blur-lg"
        />
      )}

      {/* Main image */}
      <NextImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className={cn(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
}
```

---

## File Structure

```
src/
├── app/
│   └── api/
│       ├── uploads/
│       │   └── [...path]/route.ts  # Local file serving
│       └── sites/
│           └── [siteId]/
│               └── assets/
│                   ├── route.ts         # GET (list), POST (upload)
│                   └── [assetId]/
│                       └── route.ts     # GET, PATCH, DELETE
├── lib/
│   ├── storage/
│   │   ├── index.ts      # Factory
│   │   ├── types.ts      # Interfaces
│   │   ├── local.ts      # Local implementation
│   │   └── s3.ts         # S3 implementation
│   ├── images/
│   │   └── processor.ts  # Sharp.js processing
│   └── id.ts             # ID generation
├── hooks/
│   └── useAssets.ts
└── components/
    └── Image.tsx         # Blur placeholder image
```

---

## Required Packages

```bash
npm install sharp @aws-sdk/client-s3
```

---

## Environment Variables

```env
# .env.local (development)
STORAGE_PROVIDER=local
UPLOAD_DIR=./uploads
UPLOAD_URL_BASE=/uploads

# .env.production (or for S3)
STORAGE_PROVIDER=s3
S3_REGION=auto
S3_ENDPOINT=https://xxx.r2.cloudflarestorage.com  # For R2
S3_ACCESS_KEY_ID=xxx
S3_SECRET_ACCESS_KEY=xxx
S3_BUCKET=portfolio-assets
S3_PUBLIC_URL=https://cdn.example.com
```

---

## Deliverables Checklist

- [ ] StorageProvider interface defined
- [ ] LocalStorageProvider for development
- [ ] S3StorageProvider for production
- [ ] Storage factory with environment switching
- [ ] Sharp.js image processing (resize, WebP, strip EXIF)
- [ ] Thumbnail generation (400x300 cover crop)
- [ ] Blur placeholder generation (40px base64)
- [ ] Dominant color extraction
- [ ] Asset upload endpoint with validation
- [ ] Asset list endpoint with pagination
- [ ] Asset update endpoint (altText, caption, focalPoint)
- [ ] Asset delete endpoint (removes files + record)
- [ ] useAssets hook with upload progress
- [ ] Image component with blur-up loading
- [ ] Local file serving route for development

---

## Testing Checklist

1. **Upload JPEG** - Verify WebP conversion, correct dimensions
2. **Upload PNG** - Verify transparency handled (no alpha in WebP display)
3. **Upload large image** - Verify resize to max 1920px width
4. **Upload small image** - Verify no upscaling
5. **Thumbnail** - Verify 400x300 cover crop, correct aspect
6. **Placeholder** - Verify base64 blur loads instantly
7. **EXIF stripping** - Verify rotated photos display correctly
8. **File too large** - Verify 10MB limit enforced
9. **Invalid type** - Verify only image/* allowed
10. **Delete asset** - Verify files removed from storage
11. **S3 upload** - Test with real S3/R2 credentials
12. **Upload progress** - Verify percentage updates during upload
