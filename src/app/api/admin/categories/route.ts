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

    const { portfolioId, name, description, featuredImageId, parentId } = validation.data

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

    // Validate parentId depth (max 1 level of nesting)
    if (parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: parentId },
        select: { id: true, parentId: true, portfolioId: true },
      })

      if (!parent) {
        return NextResponse.json(
          { error: 'Parent category not found', code: 'NOT_FOUND', success: false },
          { status: 404 }
        )
      }

      if (parent.portfolioId !== portfolioId) {
        return NextResponse.json(
          { error: 'Parent category must belong to the same portfolio', code: 'VALIDATION_ERROR', success: false },
          { status: 400 }
        )
      }

      if (parent.parentId !== null) {
        return NextResponse.json(
          { error: 'Subcategories cannot be nested more than one level deep', code: 'VALIDATION_ERROR', success: false },
          { status: 400 }
        )
      }
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

    // Get max order (scoped to same parent level)
    const maxOrder = await prisma.category.aggregate({
      where: { portfolioId, parentId: parentId ?? null },
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
        parentId: parentId ?? null,
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
        children: {
          orderBy: { order: 'asc' },
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
