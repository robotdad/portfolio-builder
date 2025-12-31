import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT - Reorder pages
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { portfolioId, pageIds } = body

    if (!portfolioId || !Array.isArray(pageIds)) {
      return NextResponse.json(
        { message: 'Portfolio ID and pageIds array are required' },
        { status: 400 }
      )
    }

    // Verify all pages belong to the portfolio
    const pages = await prisma.page.findMany({
      where: {
        portfolioId,
        id: { in: pageIds },
      },
    })

    if (pages.length !== pageIds.length) {
      return NextResponse.json(
        { message: 'Some pages were not found or do not belong to this portfolio' },
        { status: 400 }
      )
    }

    // Update navOrder for each page
    await Promise.all(
      pageIds.map((id, index) =>
        prisma.page.update({
          where: { id },
          data: { navOrder: index },
        })
      )
    )

    // Fetch updated pages
    const updatedPages = await prisma.page.findMany({
      where: { portfolioId },
      orderBy: { navOrder: 'asc' },
    })

    return NextResponse.json(updatedPages)
  } catch (error) {
    console.error('Failed to reorder pages:', error)
    return NextResponse.json(
      { message: 'Failed to reorder pages' },
      { status: 500 }
    )
  }
}
