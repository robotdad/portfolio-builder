import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/tags/[type]/[slug]?portfolioId=xxx - Tag detail + all associated projects (landing pages)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; slug: string }> }
) {
  try {
    const { type, slug } = await params
    const { searchParams } = new URL(request.url)
    const portfolioId = searchParams.get('portfolioId')

    if (!portfolioId) {
      return NextResponse.json(
        { error: 'portfolioId is required', code: 'VALIDATION_ERROR', success: false },
        { status: 400 }
      )
    }

    const tag = await prisma.tag.findUnique({
      where: {
        portfolioId_type_slug: { portfolioId, type, slug },
      },
      include: {
        projects: {
          include: {
            project: {
              include: {
                featuredImage: {
                  select: {
                    id: true,
                    url: true,
                    thumbnailUrl: true,
                    altText: true,
                    width: true,
                    height: true,
                  },
                },
                category: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!tag) {
      return NextResponse.json(
        { error: 'Tag not found', code: 'NOT_FOUND', success: false },
        { status: 404 }
      )
    }

    // Flatten projects from the join table
    const result = {
      ...tag,
      projects: tag.projects.map((pt) => pt.project),
    }

    return NextResponse.json({ data: result, success: true })
  } catch (error) {
    console.error('Error fetching tag detail:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tag', code: 'INTERNAL_ERROR', success: false },
      { status: 500 }
    )
  }
}
