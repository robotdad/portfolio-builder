import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/pages/[id]/publish
 *
 * Publishes the page content and portfolio theme:
 * - Copies draftContent to publishedContent (if changed)
 * - Copies draftTheme to publishedTheme (always)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get the page with current draft content
    const page = await prisma.page.findUnique({
      where: { id },
      select: {
        id: true,
        draftContent: true,
        publishedContent: true,
        portfolioId: true,
      },
    })

    if (!page) {
      return NextResponse.json({ message: 'Page not found' }, { status: 404 })
    }

    if (!page.draftContent) {
      return NextResponse.json({ message: 'No draft content to publish' }, { status: 400 })
    }

    // Always publish the portfolio's theme (copy draftTheme to publishedTheme)
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: page.portfolioId },
      select: { draftTheme: true, publishedTheme: true },
    })

    const themeChanged = portfolio?.draftTheme !== portfolio?.publishedTheme
    
    if (themeChanged) {
      await prisma.portfolio.update({
        where: { id: page.portfolioId },
        data: {
          publishedTheme: portfolio?.draftTheme || 'modern-minimal',
        },
      })
    }

    // Check if content needs publishing
    const contentChanged = page.draftContent !== page.publishedContent

    if (!contentChanged && !themeChanged) {
      return NextResponse.json({
        message: 'Everything is already published',
        alreadyPublished: true,
        page: { id: page.id, publishedContent: page.publishedContent },
      })
    }

    // Publish content if changed
    let updatedPage = page
    if (contentChanged) {
      updatedPage = await prisma.page.update({
        where: { id },
        data: {
          publishedContent: page.draftContent,
          lastPublishedAt: new Date(),
        },
        select: {
          id: true,
          portfolioId: true,
          title: true,
          slug: true,
          draftContent: true,
          publishedContent: true,
          lastPublishedAt: true,
        },
      })
    }

    return NextResponse.json({
      message: 'Published successfully',
      contentPublished: contentChanged,
      themePublished: themeChanged,
      page: updatedPage,
    })
  } catch (error) {
    console.error('Failed to publish page:', error)
    return NextResponse.json(
      { message: 'Failed to publish page' },
      { status: 500 }
    )
  }
}
