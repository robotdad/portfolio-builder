import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiValidationError, apiInternalError, apiNotFound } from '@/lib/api'

/**
 * POST /api/portfolio/category-page/publish
 * 
 * Publish category page draft content to live
 * - Copies draftContent → publishedContent
 * - Sets categoryPageLastPublishedAt to now()
 */
export async function POST(request: NextRequest) {
  try {
    // Get the first portfolio (single-portfolio assumption)
    const portfolio = await prisma.portfolio.findFirst({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        categoryPageDraftContent: true,
        categoryPagePublishedContent: true,
      },
    })

    if (!portfolio) {
      return apiNotFound('Portfolio')
    }

    // Validate that there is draft content to publish
    if (!portfolio.categoryPageDraftContent) {
      return apiValidationError('No draft content to publish')
    }

    // Publish the draft content
    const updatedPortfolio = await prisma.portfolio.update({
      where: { id: portfolio.id },
      data: {
        categoryPagePublishedContent: portfolio.categoryPageDraftContent,
        categoryPageLastPublishedAt: new Date(),
      },
      select: {
        id: true,
        categoryPageDraftContent: true,
        categoryPagePublishedContent: true,
        categoryPageLastPublishedAt: true,
      },
    })

    return apiSuccess({
      message: 'Category page published successfully',
      portfolio: updatedPortfolio,
    })
  } catch (error) {
    console.error('Failed to publish category page:', error)
    return apiInternalError('Failed to publish category page')
  }
}
