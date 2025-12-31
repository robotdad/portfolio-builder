import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch the first portfolio (for MVP, we only support one)
export async function GET() {
  try {
    const portfolio = await prisma.portfolio.findFirst({
      orderBy: { createdAt: 'desc' },
      include: { 
        assets: true,
        pages: { orderBy: { navOrder: 'asc' } },
      },
    })
    
    return NextResponse.json(portfolio)
  } catch (error) {
    console.error('Failed to fetch portfolio:', error)
    return NextResponse.json(
      { message: 'Failed to fetch portfolio' },
      { status: 500 }
    )
  }
}

// POST - Create a new portfolio with homepage (atomic)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, slug, title, bio, theme } = body

    // Validate required fields
    if (!slug) {
      return NextResponse.json(
        { message: 'Slug is required' },
        { status: 400 }
      )
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { message: 'Slug can only contain lowercase letters, numbers, and hyphens' },
        { status: 400 }
      )
    }

    // Check if slug is already taken
    const existing = await prisma.portfolio.findUnique({
      where: { slug },
    })

    if (existing) {
      return NextResponse.json(
        { message: 'This URL is already taken. Please choose a different one.' },
        { status: 409 }
      )
    }

    // ATOMIC: Create portfolio WITH homepage in single transaction
    // This ensures no portfolio ever exists without a homepage
    const portfolio = await prisma.portfolio.create({
      data: {
        name: name || '',
        slug,
        title: title || '',
        bio: bio || '',
        theme: theme || 'modern-minimal',
        pages: {
          create: {
            title: 'Home',
            slug: '', // Empty slug = homepage
            navOrder: 0,
            isHomepage: true,
            showInNav: true,
            content: null, // Starts empty, user adds content
          }
        }
      },
      include: { 
        assets: true,
        pages: { orderBy: { navOrder: 'asc' } },
      },
    })

    return NextResponse.json(portfolio, { status: 201 })
  } catch (error) {
    console.error('Failed to create portfolio:', error)
    return NextResponse.json(
      { message: 'Failed to create portfolio' },
      { status: 500 }
    )
  }
}

// PUT - Update existing portfolio settings only (content is stored in pages)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, slug, title, bio, theme } = body

    // Validate required fields
    if (!id || !slug) {
      return NextResponse.json(
        { message: 'ID and slug are required' },
        { status: 400 }
      )
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { message: 'Slug can only contain lowercase letters, numbers, and hyphens' },
        { status: 400 }
      )
    }

    // Check if slug is taken by another portfolio
    const existing = await prisma.portfolio.findFirst({
      where: {
        slug,
        NOT: { id },
      },
    })

    if (existing) {
      return NextResponse.json(
        { message: 'This URL is already taken. Please choose a different one.' },
        { status: 409 }
      )
    }

    // Update portfolio settings only - content lives in Page.content
    const portfolio = await prisma.portfolio.update({
      where: { id },
      data: {
        name: name || '',
        slug,
        title: title || '',
        bio: bio || '',
        theme: theme || 'modern-minimal',
      },
      include: { assets: true },
    })

    return NextResponse.json(portfolio)
  } catch (error) {
    console.error('Failed to update portfolio:', error)
    return NextResponse.json(
      { message: 'Failed to update portfolio' },
      { status: 500 }
    )
  }
}
