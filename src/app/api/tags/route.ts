import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/tags?portfolioId=xxx&type=technique
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const portfolioId = searchParams.get('portfolioId')
    const type = searchParams.get('type')

    if (!portfolioId) {
      return NextResponse.json(
        { error: 'portfolioId is required', code: 'VALIDATION_ERROR', success: false },
        { status: 400 }
      )
    }

    const where: Record<string, unknown> = { portfolioId }
    if (type) {
      where.type = type
    }

    const tags = await prisma.tag.findMany({
      where,
      include: {
        _count: {
          select: { projects: true },
        },
      },
      orderBy: [{ type: 'asc' }, { value: 'asc' }],
    })

    return NextResponse.json({ data: tags, success: true })
  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tags', code: 'INTERNAL_ERROR', success: false },
      { status: 500 }
    )
  }
}
