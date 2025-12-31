import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/pages/[id]/publish
 * 
 * Atomically copies draftContent to publishedContent
 * This makes the draft version live on the public site
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
      },
    })

    if (!page) {
      return NextResponse.json(
        { message: 'Page not found' },
        { status: 404 }
      )
    }

    // Check if there's content to publish
    if (!page.draftContent) {
      return NextResponse.json(
        { message: 'No draft content to publish' },
        { status: 400 }
      )
    }

    // Check if draft differs from published (optimization)
    if (page.draftContent === page.publishedContent) {
      return NextResponse.json({
        message: 'Content is already published',
        alreadyPublished: true,
        page: {
          id: page.id,
          publishedContent: page.publishedContent,
        },
      })
    }

    // Atomically update: copy draft to published
    const updatedPage = await prisma.page.update({
      where: { id },
      data: {
        publishedContent: page.draftContent,
        lastPublishedAt: new Date(),
      },
      select: {
        id: true,
        title: true,
        slug: true,
        draftContent: true,
        publishedContent: true,
        lastPublishedAt: true,
      },
    })

    return NextResponse.json({
      message: 'Page published successfully',
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
