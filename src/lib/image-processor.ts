import sharp from 'sharp'

export interface ProcessedImage {
  display: Buffer      // 800w WebP
  thumbnail: Buffer    // 400w WebP
  placeholder: string  // data:image/webp;base64,...
  srcset: { w400: Buffer; w800: Buffer; w1200: Buffer; w1600: Buffer }
  metadata: { width: number; height: number; format: string }
}

const SRCSET_WIDTHS = [400, 800, 1200, 1600] as const
const WEBP_QUALITY = 80
const PLACEHOLDER_SIZE = 20

/**
 * Process an image buffer into multiple responsive variants
 * - Generates 4 srcset sizes (400w, 800w, 1200w, 1600w) as WebP
 * - Creates a 20px blur placeholder as base64 data URI
 * - Preserves aspect ratio, skips upscaling
 * - Extracts original dimensions
 */
export async function processImage(buffer: Buffer): Promise<ProcessedImage> {
  const image = sharp(buffer)
  const originalMetadata = await image.metadata()

  if (!originalMetadata.width || !originalMetadata.height) {
    throw new Error('Unable to read image dimensions')
  }

  const originalWidth = originalMetadata.width
  const originalHeight = originalMetadata.height
  const format = originalMetadata.format || 'unknown'

  // Generate srcset variants - skip upscaling
  const srcsetBuffers = await Promise.all(
    SRCSET_WIDTHS.map(async (width) => {
      // Don't upscale - use original if smaller
      const targetWidth = Math.min(width, originalWidth)
      
      const resized = await sharp(buffer)
        .resize(targetWidth, null, {
          withoutEnlargement: true,
          fit: 'inside',
        })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer()

      return { width, buffer: resized }
    })
  )

  // Create blur placeholder (20px wide, base64 data URI)
  const placeholderBuffer = await sharp(buffer)
    .resize(PLACEHOLDER_SIZE, null, {
      withoutEnlargement: true,
      fit: 'inside',
    })
    .webp({ quality: 60 })
    .blur(1)
    .toBuffer()

  const placeholderBase64 = `data:image/webp;base64,${placeholderBuffer.toString('base64')}`

  // Build srcset object
  const srcset = {
    w400: srcsetBuffers.find(s => s.width === 400)!.buffer,
    w800: srcsetBuffers.find(s => s.width === 800)!.buffer,
    w1200: srcsetBuffers.find(s => s.width === 1200)!.buffer,
    w1600: srcsetBuffers.find(s => s.width === 1600)!.buffer,
  }

  return {
    display: srcset.w800,      // 800w as primary display
    thumbnail: srcset.w400,    // 400w as thumbnail
    placeholder: placeholderBase64,
    srcset,
    metadata: {
      width: originalWidth,
      height: originalHeight,
      format,
    },
  }
}
