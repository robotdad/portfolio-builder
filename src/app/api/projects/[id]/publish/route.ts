import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ENTITY_ERRORS } from '@/lib/messages'

/**
 * POST /api/projects/[id]/publish
 *
 * Publishes the project content:
 * - Copies draftContent to publishedContent (if changed)
 * - Updates lastPublishedAt timestamp
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get the project with current draft and published content
    const project = await prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        draftContent: true,
        publishedContent: true,
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: ENTITY_ERRORS.PROJECT_NOT_FOUND.message, code: 'NOT_FOUND', success: false },
        { status: 404 }
      )
    }

    // Determine the content to publish
    // Priority: draftContent > publishedContent (use existing if draft is empty)
    const contentToPublish = project.draftContent || project.publishedContent

    if (!contentToPublish) {
      return NextResponse.json(
        { error: 'No content to publish', code: 'NO_CONTENT', success: false },
        { status: 400 }
      )
    }

    // Check if anything needs to change
    const draftNeedsSync = project.draftContent !== contentToPublish
    const publishedNeedsSync = project.publishedContent !== contentToPublish

    if (!draftNeedsSync && !publishedNeedsSync) {
      return NextResponse.json({
        message: 'Content is already in sync',
        alreadyPublished: true,
        success: true,
        data: {
          id: project.id,
          publishedContent: project.publishedContent,
        },
      })
    }

    // Publish content AND ensure draft is synced
    // This guarantees draft is never behind published
    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        draftContent: contentToPublish,
        publishedContent: contentToPublish,
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
      message: 'Published successfully',
      success: true,
      data: updatedProject,
    })
  } catch (error) {
    console.error('Failed to publish project:', error)
    return NextResponse.json(
      { error: 'Failed to publish project', code: 'INTERNAL_ERROR', success: false },
      { status: 500 }
    )
  }
}
