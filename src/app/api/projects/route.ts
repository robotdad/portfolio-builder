import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/projects?categoryId=xxx OR ?portfolioId=xxx&featured=true
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const portfolioId = searchParams.get('portfolioId')
    const featured = searchParams.get('featured')

    let whereClause: Record<string, unknown> = {}

    if (categoryId) {
      whereClause.categoryId = categoryId
    } else if (portfolioId && featured === 'true') {
      // Get featured projects across all categories in portfolio
      whereClause = {
        category: { portfolioId },
        isFeatured: true,
      }
    } else {
      return NextResponse.json(
        { error: 'categoryId or (portfolioId + featured=true) is required', code: 'VALIDATION_ERROR', success: false },
        { status: 400 }
      )
    }

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        featuredImage: {
          select: {
            id: true,
            url: true,
            thumbnailUrl: true,
            altText: true,
          },
        },
      },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ data: projects, success: true })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects', code: 'INTERNAL_ERROR', success: false },
      { status: 500 }
    )
  }
}
