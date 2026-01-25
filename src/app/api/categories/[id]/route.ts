import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/categories/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        featuredImage: {
          select: {
            id: true,
            url: true,
            thumbnailUrl: true,
            altText: true,
          },
        },
        projects: {
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found', code: 'NOT_FOUND', success: false },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: category, success: true })
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json(
      { error: 'Failed to fetch category', code: 'INTERNAL_ERROR', success: false },
      { status: 500 }
    )
  }
}
