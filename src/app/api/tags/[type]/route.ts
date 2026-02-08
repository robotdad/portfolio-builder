import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/tags/[type]?portfolioId=xxx - All tags of a type (for index pages)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params
    const { searchParams } = new URL(request.url)
    const portfolioId = searchParams.get('portfolioId')

    if (!portfolioId) {
      return NextResponse.json(
        { error: 'portfolioId is required', code: 'VALIDATION_ERROR', success: false },
        { status: 400 }
      )
    }

    const tags = await prisma.tag.findMany({
      where: { portfolioId, type },
      include: {
        _count: {
          select: { projects: true },
        },
      },
      orderBy: { value: 'asc' },
    })

    return NextResponse.json({ data: tags, success: true })
  } catch (error) {
    console.error('Error fetching tags by type:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tags', code: 'INTERNAL_ERROR', success: false },
      { status: 500 }
    )
  }
}
