import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/portfolio/publish
 * 
 * Publishes portfolio settings by copying draft → published fields.
 * Updates:
 * - publishedTheme ← draftTheme
 * - publishedTemplate ← draftTemplate
 * - lastPublishedAt ← now()
 */
export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Portfolio ID is required' }, 
        { status: 400 }
      )
    }
    
    // Find the portfolio
    const portfolio = await prisma.portfolio.findUnique({ 
      where: { id },
      include: {
        profilePhoto: true
      }
    })
    
    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' }, 
        { status: 404 }
      )
    }
    
    // Copy draft → published
    const updated = await prisma.portfolio.update({
      where: { id },
      data: {
        publishedTheme: portfolio.draftTheme,
        publishedTemplate: portfolio.draftTemplate,
        lastPublishedAt: new Date()
      },
      include: {
        profilePhoto: true
      }
    })
    
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Publish error:', error)
    return NextResponse.json(
      { error: 'Failed to publish portfolio settings' }, 
      { status: 500 }
    )
  }
}
