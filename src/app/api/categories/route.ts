import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/categories?portfolioId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const portfolioId = searchParams.get('portfolioId')
    const includeProjects = searchParams.get('includeProjects') === 'true'

    if (!portfolioId) {
      return NextResponse.json(
        { error: 'portfolioId is required', code: 'VALIDATION_ERROR', success: false },
        { status: 400 }
      )
    }

    const categories = await prisma.category.findMany({
      where: { portfolioId },
      include: {
        featuredImage: {
          select: {
            id: true,
            url: true,
            thumbnailUrl: true,
            altText: true,
          },
        },
        _count: {
          select: { projects: true },
        },
        ...(includeProjects && {
          projects: {
            select: {
              id: true,
              title: true,
              draftContent: true,
              publishedContent: true,
            },
            orderBy: { order: 'asc' },
          },
        }),
      },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ data: categories, success: true })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories', code: 'INTERNAL_ERROR', success: false },
      { status: 500 }
    )
  }
}
