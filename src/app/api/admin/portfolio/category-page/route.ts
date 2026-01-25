import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiValidationError, apiInternalError, apiNotFound } from '@/lib/api'

/**
 * GET /api/admin/portfolio/category-page
 * 
 * Fetch category page content (draft and published)
 */
export async function GET() {
  try {
    const portfolio = await prisma.portfolio.findFirst({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        categoryPageDraftContent: true,
        categoryPagePublishedContent: true,
        categoryPageLastPublishedAt: true,
      },
    })

    if (!portfolio) {
      return apiNotFound('Portfolio')
    }

    return apiSuccess(portfolio)
  } catch (error) {
    console.error('Failed to fetch category page:', error)
    return apiInternalError('Failed to fetch category page')
  }
}

/**
 * PUT /api/admin/portfolio/category-page
 * 
 * Update category page draft content
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { draftContent } = body

    // Validate required fields
    if (draftContent === undefined) {
      return apiValidationError('draftContent is required')
    }

    // Validate that draftContent is a string
    if (typeof draftContent !== 'string') {
      return apiValidationError('draftContent must be a string')
    }

    // Get the first portfolio (single-portfolio assumption)
    const existingPortfolio = await prisma.portfolio.findFirst({
      orderBy: { createdAt: 'desc' },
    })

    if (!existingPortfolio) {
      return apiNotFound('Portfolio')
    }

    // Update category page draft content
    const portfolio = await prisma.portfolio.update({
      where: { id: existingPortfolio.id },
      data: {
        categoryPageDraftContent: draftContent,
      },
      select: {
        id: true,
        categoryPageDraftContent: true,
        categoryPagePublishedContent: true,
        categoryPageLastPublishedAt: true,
      },
    })

    return apiSuccess(portfolio)
  } catch (error) {
    console.error('Failed to update category page draft:', error)
    return apiInternalError('Failed to update category page draft')
  }
}
