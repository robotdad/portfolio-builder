import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { VALIDATION_ERRORS, ENTITY_ERRORS } from '@/lib/messages'

// POST - Create a new page
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { portfolioId, title, slug, isHomepage, showInNav, content, draftContent, publishedContent } = body

    // Validate required fields
    if (!portfolioId || !title) {
      return NextResponse.json(
        { message: 'Portfolio ID and title are required' },
        { status: 400 }
      )
    }

    // Generate slug from title if not provided
    const pageSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

    // Validate slug format
    if (pageSlug && !/^[a-z0-9-]*$/.test(pageSlug)) {
      return NextResponse.json(
        { message: VALIDATION_ERRORS.SLUG_FORMAT.message },
        { status: 400 }
      )
    }

    // Check if slug is already taken for this portfolio
    const existing = await prisma.page.findFirst({
      where: {
        portfolioId,
        slug: pageSlug,
      },
    })

    if (existing) {
      return NextResponse.json(
        { message: ENTITY_ERRORS.PAGE_SLUG_TAKEN.message },
        { status: 409 }
      )
    }

    // Get existing pages count and highest navOrder
    const existingPages = await prisma.page.findMany({
      where: { portfolioId },
      orderBy: { navOrder: 'desc' },
      take: 1,
    })
    const navOrder = existingPages.length > 0 ? existingPages[0].navOrder + 1 : 0
    
    // Count existing pages to determine if this should be auto-homepage
    const existingPagesCount = await prisma.page.count({ where: { portfolioId } })
    
    // First page is always homepage, otherwise use provided value
    const shouldBeHomepage = existingPagesCount === 0 ? true : (isHomepage || false)

    // If this is set as homepage, unset any existing homepage
    if (shouldBeHomepage) {
      await prisma.page.updateMany({
        where: { portfolioId, isHomepage: true },
        data: { isHomepage: false },
      })
    }

    // Determine draft content - support both 'content' (legacy) and 'draftContent' (new)
    const finalDraftContent = draftContent || content || null
    
    // Determine published content and timestamp
    const finalPublishedContent = publishedContent !== undefined ? publishedContent : null
    const lastPublishedAt = finalPublishedContent !== null ? new Date() : null

    // Create page with draft and optional published content
    const page = await prisma.page.create({
      data: {
        portfolioId,
        title,
        slug: shouldBeHomepage ? '' : pageSlug, // Homepage gets empty slug
        navOrder,
        isHomepage: shouldBeHomepage,
        showInNav: showInNav !== false,
        draftContent: finalDraftContent,
        publishedContent: finalPublishedContent,
        lastPublishedAt,
      },
    })

    return NextResponse.json(page, { status: 201 })
  } catch (error) {
    console.error('Failed to create page:', error)
    return NextResponse.json(
      { message: 'Failed to create page' },
      { status: 500 }
    )
  }
}
