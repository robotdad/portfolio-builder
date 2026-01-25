import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ENTITY_ERRORS } from '@/lib/messages'

// GET - Fetch a single page
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const page = await prisma.page.findUnique({
      where: { id },
      include: {
        portfolio: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!page) {
      return NextResponse.json(
        { message: ENTITY_ERRORS.PAGE_NOT_FOUND.message },
        { status: 404 }
      )
    }

    return NextResponse.json(page)
  } catch (error) {
    console.error('Failed to fetch page:', error)
    return NextResponse.json(
      { message: 'Failed to fetch page' },
      { status: 500 }
    )
  }
}
