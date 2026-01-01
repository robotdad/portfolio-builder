import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { reorderCategoriesSchema } from '@/lib/validations/category'

// PUT /api/categories/reorder
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = reorderCategoriesSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message, code: 'VALIDATION_ERROR', success: false },
        { status: 400 }
      )
    }

    const { categoryIds } = validation.data

    // Verify all categories exist and belong to same portfolio
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, portfolioId: true },
    })

    if (categories.length !== categoryIds.length) {
      return NextResponse.json(
        { error: 'One or more categories not found', code: 'NOT_FOUND', success: false },
        { status: 404 }
      )
    }

    const portfolioIds = [...new Set(categories.map(c => c.portfolioId))]
    if (portfolioIds.length > 1) {
      return NextResponse.json(
        { error: 'All categories must belong to the same portfolio', code: 'VALIDATION_ERROR', success: false },
        { status: 400 }
      )
    }

    // Update order for each category
    const updates = categoryIds.map((id, index) =>
      prisma.category.update({
        where: { id },
        data: { order: index },
        select: { id: true, name: true, order: true },
      })
    )

    const updated = await prisma.$transaction(updates)

    return NextResponse.json({ data: updated, success: true })
  } catch (error) {
    console.error('Error reordering categories:', error)
    return NextResponse.json(
      { error: 'Failed to reorder categories', code: 'INTERNAL_ERROR', success: false },
      { status: 500 }
    )
  }
}
