import { prisma } from '@/lib/prisma'
import { apiSuccess, apiInternalError } from '@/lib/api'

// GET - Fetch the first portfolio (for MVP, we only support one)
export async function GET() {
  try {
    const portfolio = await prisma.portfolio.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        assets: true,
        pages: { orderBy: { navOrder: 'asc' } },
        profilePhoto: {
          select: {
            id: true,
            url: true,
            thumbnailUrl: true,
            altText: true,
          },
        },
      },
    })
    
    return apiSuccess(portfolio)
  } catch (error) {
    console.error('Failed to fetch portfolio:', error)
    return apiInternalError('Failed to fetch portfolio')
  }
}
