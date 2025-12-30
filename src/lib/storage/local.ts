import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import type { ProcessedImage } from '../image-processor'

export interface StoredImageUrls {
  url: string          // Display version (800w)
  thumbnailUrl: string // Thumbnail version (400w)
  placeholderUrl: string // Base64 data URI (stored directly, not as file)
  srcset400: string
  srcset800: string
  srcset1200: string
  srcset1600: string
}

const UPLOADS_DIR = 'public/uploads'

/**
 * Save processed images to local filesystem
 * Creates directory structure: public/uploads/[assetId]/
 * Returns relative URLs for each variant
 */
export async function saveProcessedImages(
  assetId: string,
  processed: ProcessedImage
): Promise<StoredImageUrls> {
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
