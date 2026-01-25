import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch all pages for a portfolio
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const portfolioId = searchParams.get('portfolioId')

    if (!portfolioId) {
      return NextResponse.json(
        { message: 'Portfolio ID is required' },
        { status: 400 }
      )
    }

    const pages = await prisma.page.findMany({
      where: { portfolioId },
      orderBy: { navOrder: 'asc' },
    })

    return NextResponse.json(pages)
  } catch (error) {
    console.error('Failed to fetch pages:', error)
    return NextResponse.json(
      { message: 'Failed to fetch pages' },
      { status: 500 }
    )
  }
}
