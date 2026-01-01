import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { SiteImage, PageSummary, ImagesApiResponse } from '@/lib/types/image-picker'

/**
 * GET /api/images
 * 
 * Returns all images for a portfolio with source metadata.
 * 
 * Query params:
 * - portfolioId: string (required)
 * - pageId?: string (filter by page - currently filters by category/project association)
 * - search?: string (search filename, alt text)
 * - minWidth?: number
 * - minHeight?: number
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const portfolioId = searchParams.get('portfolioId')
    const search = searchParams.get('search')?.toLowerCase()
    const categoryId = searchParams.get('categoryId')
    const minWidth = searchParams.get('minWidth') ? parseInt(searchParams.get('minWidth')!) : undefined
    const minHeight = searchParams.get('minHeight') ? parseInt(searchParams.get('minHeight')!) : undefined

    if (!portfolioId) {
      return NextResponse.json(
        { error: 'Portfolio ID is required', code: 'VALIDATION_ERROR', success: false },
        { status: 400 }
      )
    }

    // Build where clause for assets
    const whereClause: Record<string, unknown> = {
      portfolioId,
    }

    if (minWidth) {
      whereClause.width = { gte: minWidth }
    }
    if (minHeight) {
      whereClause.height = { gte: minHeight }
    }

    // Fetch all assets with their relationships
    const assets = await prisma.asset.findMany({
      where: whereClause,
      include: {
        categoriesFeatured: {
          select: {
            id: true,
            name: true,
          },
        },
        projectsFeatured: {
          select: {
            id: true,
            title: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        projectGalleries: {
          include: {
            project: {
              select: {
                id: true,
                title: true,
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Transform assets to SiteImage format
    let images: SiteImage[] = assets.map((asset) => {
      // Determine source based on relationships
      let source: SiteImage['source'] = {
        pageId: 'uncategorized',
        pageTitle: 'Uncategorized',
        sectionType: 'content' as const,
      }

      // Check if used as category featured image
      if (asset.categoriesFeatured.length > 0) {
        const cat = asset.categoriesFeatured[0]
        source = {
          pageId: cat.id,
          pageTitle: cat.name,
          sectionType: 'featured' as const,
        }
      }
      // Check if used as project featured image
      else if (asset.projectsFeatured.length > 0) {
        const proj = asset.projectsFeatured[0]
        source = {
          pageId: proj.category?.id || proj.id,
          pageTitle: proj.title,
          sectionType: 'featured' as const,
        }
      }
      // Check if used in project gallery
      else if (asset.projectGalleries.length > 0) {
        const gallery = asset.projectGalleries[0]
        source = {
          pageId: gallery.project.category?.id || gallery.project.id,
          pageTitle: gallery.project.title,
          sectionType: 'gallery' as const,
        }
      }

      return {
        id: asset.id,
        url: asset.url,
        thumbnailUrl: asset.thumbnailUrl,
        filename: asset.filename,
        source,
        meta: {
          width: asset.width,
          height: asset.height,
          uploadedAt: asset.createdAt.toISOString(),
          fileSize: asset.size,
          alt: asset.altText || undefined,
        },
      }
    })

    // Apply category filter
    if (categoryId) {
      images = images.filter((img) => img.source.pageId === categoryId)
    }

    // Apply search filter
    if (search) {
      images = images.filter((img) => {
        const searchableText = [
          img.filename,
          img.meta.alt,
          img.source.pageTitle,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        return searchableText.includes(search)
      })
    }

    // Get unique pages/categories for filter dropdown
    const pageMap = new Map<string, { title: string; count: number }>()
    
    images.forEach((img) => {
      const existing = pageMap.get(img.source.pageId)
      if (existing) {
        existing.count++
      } else {
        pageMap.set(img.source.pageId, {
          title: img.source.pageTitle,
          count: 1,
        })
      }
    })

    const pages: PageSummary[] = Array.from(pageMap.entries())
      .map(([id, data]) => ({
        id,
        title: data.title,
        imageCount: data.count,
      }))
      .sort((a, b) => a.title.localeCompare(b.title))

    const response: ImagesApiResponse = {
      images,
      totalCount: images.length,
      pages,
    }

    return NextResponse.json({ data: response, success: true })
  } catch (error) {
    console.error('Error fetching images:', error)
    return NextResponse.json(
      { error: 'Failed to fetch images', code: 'INTERNAL_ERROR', success: false },
      { status: 500 }
    )
  }
}
