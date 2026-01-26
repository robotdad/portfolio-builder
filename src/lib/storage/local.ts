import { mkdir, writeFile, rm } from 'fs/promises'
import path from 'path'
import type { ProcessedImage } from '../image-processor'
import type { StorageAdapter, StoredImageUrls } from './types'

const UPLOADS_DIR = 'public/uploads'

/**
 * Validate asset ID to prevent path traversal attacks.
 */
function validateAssetId(assetId: string): void {
  if (!assetId || 
      assetId.includes('..') || 
      assetId.includes('/') || 
      assetId.includes('\\') ||
      assetId.startsWith('.')) {
    throw new Error('Invalid asset ID')
  }
}

/**
 * Save processed images to local filesystem.
 * Creates directory structure: public/uploads/[assetId]/
 */
async function saveProcessedImages(
  assetId: string,
  processed: ProcessedImage
): Promise<StoredImageUrls> {
  validateAssetId(assetId)
  
  // Create asset directory
  const assetDir = path.join(process.cwd(), UPLOADS_DIR, assetId)
  await mkdir(assetDir, { recursive: true })

  // Save all variants
  const savePromises = [
    writeFile(path.join(assetDir, 'display.webp'), processed.display),
    writeFile(path.join(assetDir, 'thumbnail.webp'), processed.thumbnail),
    writeFile(path.join(assetDir, 'w400.webp'), processed.srcset.w400),
    writeFile(path.join(assetDir, 'w800.webp'), processed.srcset.w800),
    writeFile(path.join(assetDir, 'w1200.webp'), processed.srcset.w1200),
    writeFile(path.join(assetDir, 'w1600.webp'), processed.srcset.w1600),
  ]

  await Promise.all(savePromises)

  // Return relative URLs (from /public)
  const baseUrl = `/uploads/${assetId}`

  return {
    url: `${baseUrl}/display.webp`,
    thumbnailUrl: `${baseUrl}/thumbnail.webp`,
    placeholderUrl: processed.placeholder, // Base64 data URI, not a file path
    srcset400: `${baseUrl}/w400.webp`,
    srcset800: `${baseUrl}/w800.webp`,
    srcset1200: `${baseUrl}/w1200.webp`,
    srcset1600: `${baseUrl}/w1600.webp`,
  }
}

/**
 * Delete all files for an asset (idempotent - succeeds even if not exists).
 */
async function deleteAssetFiles(assetId: string): Promise<void> {
  validateAssetId(assetId)
  const assetDir = path.join(process.cwd(), UPLOADS_DIR, assetId)
  await rm(assetDir, { recursive: true, force: true })
}

/**
 * Delete ALL files in the uploads directory (for full reset).
 * Returns count of deleted asset directories.
 */
async function deleteAllFiles(): Promise<number> {
  const uploadsDir = path.join(process.cwd(), UPLOADS_DIR)
  
  try {
    const { readdir } = await import('fs/promises')
    const entries = await readdir(uploadsDir, { withFileTypes: true })
    const directories = entries.filter(e => e.isDirectory())
    
    await Promise.all(
      directories.map(dir => 
        rm(path.join(uploadsDir, dir.name), { recursive: true, force: true })
      )
    )
    
    return directories.length
  } catch (err) {
    // Directory doesn't exist - nothing to delete
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return 0
    }
    throw err
  }
}

export const localStorageAdapter: StorageAdapter = {
  saveProcessedImages,
  deleteAssetFiles,
  deleteAllFiles,
}
