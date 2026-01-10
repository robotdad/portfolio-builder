import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { processImage } from '@/lib/image-processor'
import { saveProcessedImages } from '@/lib/storage/local'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

/**
 * Sanitize filename to prevent path traversal and remove dangerous characters.
 * Preserves the file extension and limits length.
 */
function sanitizeFilename(filename: string): string {
  // Get extension safely
  const lastDot = filename.lastIndexOf('.')
  const ext = lastDot > 0 ? filename.slice(lastDot).toLowerCase() : ''
  const base = lastDot > 0 ? filename.slice(0, lastDot) : filename
  
  // Remove path separators and dangerous characters
  const sanitizedBase = base
    .replace(/[/\\]/g, '_')           // Path separators
    .replace(/\.\./g, '_')            // Parent directory
    .replace(/[<>:"|?*\x00-\x1f]/g, '_')  // Invalid/control chars
    .replace(/^\.+/, '_')             // Leading dots
    .trim()
  
  // Limit length (255 is common filesystem limit)
  const maxBaseLength = 200 // Leave room for extension and uniqueness
  const truncatedBase = sanitizedBase.slice(0, maxBaseLength) || 'unnamed'
  
  return truncatedBase + ext
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const file = formData.get('file') as File | null
    const portfolioId = formData.get('portfolioId') as string | null
    const altText = formData.get('altText') as string | null
    const caption = formData.get('caption') as string | null

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        { message: 'No file provided' },
        { status: 400 }
      )
    }

    if (!portfolioId) {
      return NextResponse.json(
        { message: 'Portfolio ID is required' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { message: 'Invalid file type. Allowed: JPEG, PNG, WebP' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { message: 'File too large. Maximum size: 10MB' },
        { status: 400 }
      )
    }

    // Verify portfolio exists
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId },
    })

    if (!portfolio) {
      return NextResponse.json(
        { message: 'Portfolio not found' },
        { status: 404 }
      )
    }

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Process image (generate variants)
    const processed = await processImage(buffer)

    // Create asset record first to get ID
    const asset = await prisma.asset.create({
      data: {
        portfolioId,
        filename: sanitizeFilename(file.name),
        mimeType: file.type,
        size: file.size,
        width: processed.metadata.width,
        height: processed.metadata.height,
        altText: altText || '',
        caption: caption || null,
        // Temporary URLs - will be updated after saving files
        url: '',
        thumbnailUrl: '',
        placeholderUrl: '',
      },
    })

    // Save files to disk using asset ID
    const urls = await saveProcessedImages(asset.id, processed)

    // Update asset with actual URLs
    const updatedAsset = await prisma.asset.update({
      where: { id: asset.id },
      data: {
        url: urls.url,
        thumbnailUrl: urls.thumbnailUrl,
        placeholderUrl: urls.placeholderUrl,
        srcset400: urls.srcset400,
        srcset800: urls.srcset800,
        srcset1200: urls.srcset1200,
        srcset1600: urls.srcset1600,
      },
    })

    return NextResponse.json(updatedAsset, { status: 201 })
  } catch (error) {
    console.error('Upload failed:', error)
    return NextResponse.json(
      { message: 'Failed to upload image' },
      { status: 500 }
    )
  }
}
