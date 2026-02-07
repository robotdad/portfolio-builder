import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ENTITY_ERRORS } from '@/lib/messages'
import { createCategorySchema } from '@/lib/validations/category'
import { generateSlug } from '@/lib/utils/slug'

// POST /api/admin/categories
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = createCategorySchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message, code: 'VALIDATION_ERROR', success: false },
        { status: 400 }
      )
    }

    const { portfolioId, name, description, featuredImageId } = validation.data

    // Verify portfolio exists
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId },
    })

    if (!portfolio) {
      return NextResponse.json(
        { error: ENTITY_ERRORS.PORTFOLIO_NOT_FOUND.message, code: 'NOT_FOUND', success: false },
        { status: 404 }
      )
    }

    // Generate unique slug
    const baseSlug = generateSlug(name)
    let slug = baseSlug
    let counter = 2

    while (true) {
      const existing = await prisma.category.findUnique({
        where: { portfolioId_slug: { portfolioId, slug } },
      })
      if (!existing) break
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Get max order
    const maxOrder = await prisma.category.aggregate({
      where: { portfolioId },
      _max: { order: true },
    })
    const order = (maxOrder._max.order ?? -1) + 1

    const category = await prisma.category.create({
      data: {
        portfolioId,
        name,
        slug,
        description,
        order,
        featuredImageId,
      },
      include: {
        featuredImage: {
          select: {
            id: true,
            url: true,
            thumbnailUrl: true,
            altText: true,
            width: true,
            height: true,
          },
        },
      },
    })

    return NextResponse.json({ data: category, success: true }, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Failed to create category', code: 'INTERNAL_ERROR', success: false },
      { status: 500 }
    )
  }
}
