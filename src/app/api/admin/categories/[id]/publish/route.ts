import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiValidationError, apiInternalError, apiNotFound } from '@/lib/api'

/**
 * POST /api/admin/categories/[id]/publish
 * 
 * Publish category landing page draft content to live
 * - Copies draftContent → publishedContent
 * - Sets lastPublishedAt to now()
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get category with draft and published content
    const category = await prisma.category.findUnique({
      where: { id },
      select: {
        id: true,
        draftContent: true,
        publishedContent: true,
      },
    })

    if (!category) {
      return apiNotFound('Category')
    }

    // Validate that there is draft content to publish
    if (!category.draftContent) {
      return apiValidationError('No draft content to publish')
    }

    // Publish the draft content
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        publishedContent: category.draftContent,
        lastPublishedAt: new Date(),
      },
      select: {
        id: true,
        draftContent: true,
        publishedContent: true,
        lastPublishedAt: true,
      },
    })

    return apiSuccess({
      message: 'Published successfully',
      data: updatedCategory,
    })
  } catch (error) {
    console.error('Failed to publish category landing page:', error)
    return apiInternalError('Failed to publish category landing page')
  }
}
