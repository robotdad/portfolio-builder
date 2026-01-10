import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { VALIDATION_ERRORS, ENTITY_ERRORS } from '@/lib/messages'

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
            slug: true,
          },
        },
      },
    })

    if (!page) {
      return NextResponse.json(
        { message: ENTITY_ERRORS.PAGE_NOT_FOUND },
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

// PUT - Update a page (saves to draftContent)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, slug, isHomepage, showInNav, content, draftContent } = body

    // Get existing page first (needed for partial update logic)
    const existingPage = await prisma.page.findUnique({
      where: { id },
    })

    if (!existingPage) {
      return NextResponse.json(
        { message: ENTITY_ERRORS.PAGE_NOT_FOUND },
        { status: 404 }
      )
    }

    // Title cannot be explicitly cleared (empty string)
    if (title === '') {
      return NextResponse.json(
        { message: 'Title is required' },
        { status: 400 }
      )
    }

    // Use existing values for fields not provided
    const finalTitle = title !== undefined ? title : existingPage.title

    // Validate slug format if provided
    const pageSlug = slug !== undefined ? slug : existingPage.slug
    if (pageSlug && !/^[a-z0-9-]*$/.test(pageSlug)) {
      return NextResponse.json(
        { message: VALIDATION_ERRORS.SLUG_FORMAT },
        { status: 400 }
      )
    }

    // Check if slug is taken by another page in the same portfolio
    if (pageSlug !== existingPage.slug) {
      const slugTaken = await prisma.page.findFirst({
        where: {
          portfolioId: existingPage.portfolioId,
          slug: pageSlug,
          NOT: { id },
        },
      })

      if (slugTaken) {
        return NextResponse.json(
          { message: ENTITY_ERRORS.PAGE_SLUG_TAKEN },
          { status: 409 }
        )
      }
    }

    // If setting this as homepage, unset any existing homepage
    if (isHomepage && !existingPage.isHomepage) {
      await prisma.page.updateMany({
        where: {
          portfolioId: existingPage.portfolioId,
          isHomepage: true,
          NOT: { id },
        },
        data: { isHomepage: false },
      })
    }

    // Determine final draft content
    // Support both 'content' (legacy) and 'draftContent' (new) field names
    let finalDraftContent = existingPage.draftContent
    if (draftContent !== undefined) {
      finalDraftContent = draftContent
    } else if (content !== undefined) {
      // Legacy support: 'content' maps to 'draftContent'
      finalDraftContent = content
    }

    // Update page
    const page = await prisma.page.update({
      where: { id },
      data: {
        title: finalTitle,
        slug: pageSlug,
        isHomepage: isHomepage !== undefined ? isHomepage : existingPage.isHomepage,
        showInNav: showInNav !== undefined ? showInNav : existingPage.showInNav,
        draftContent: finalDraftContent,
      },
    })

    return NextResponse.json(page)
  } catch (error) {
    console.error('Failed to update page:', error)
    return NextResponse.json(
      { message: 'Failed to update page' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a page
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const page = await prisma.page.findUnique({
      where: { id },
    })

    if (!page) {
      return NextResponse.json(
        { message: ENTITY_ERRORS.PAGE_NOT_FOUND },
        { status: 404 }
      )
    }

    // Check if this is the only page - prevent deletion
    const pageCount = await prisma.page.count({
      where: { portfolioId: page.portfolioId },
    })

    if (pageCount <= 1) {
      return NextResponse.json(
        { message: 'Cannot delete the only page. A portfolio must have at least one page.' },
        { status: 400 }
      )
    }

    // Delete the page
    await prisma.page.delete({
      where: { id },
    })

    // If deleted page was homepage, promote next page
    if (page.isHomepage) {
      const nextPage = await prisma.page.findFirst({
        where: { portfolioId: page.portfolioId },
        orderBy: { navOrder: 'asc' },
      })

      if (nextPage) {
        await prisma.page.update({
          where: { id: nextPage.id },
          data: { isHomepage: true, slug: '' }, // Homepage gets empty slug
        })
      }
    }

    return NextResponse.json({ message: 'Page deleted' })
  } catch (error) {
    console.error('Failed to delete page:', error)
    return NextResponse.json(
      { message: 'Failed to delete page' },
      { status: 500 }
    )
  }
}
