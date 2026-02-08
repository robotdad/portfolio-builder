import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ENTITY_ERRORS } from '@/lib/messages'
import { createTagSchema } from '@/lib/validations/tag'
import { generateSlug } from '@/lib/utils/slug'

// POST /api/admin/tags
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = createTagSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message, code: 'VALIDATION_ERROR', success: false },
        { status: 400 }
      )
    }

    const { portfolioId, type, value, description } = validation.data

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

    // Check for duplicate value within same portfolio + type
    const existingValue = await prisma.tag.findUnique({
      where: { portfolioId_type_value: { portfolioId, type, value } },
    })

    if (existingValue) {
      return NextResponse.json(
        { error: `A ${type} tag with value "${value}" already exists`, code: 'VALIDATION_ERROR', success: false },
        { status: 409 }
      )
    }

    // Generate unique slug within portfolio + type
    const baseSlug = generateSlug(value)
    let slug = baseSlug
    let counter = 2

    while (true) {
      const existing = await prisma.tag.findUnique({
        where: { portfolioId_type_slug: { portfolioId, type, slug } },
      })
      if (!existing) break
      slug = `${baseSlug}-${counter}`
      counter++
    }

    const tag = await prisma.tag.create({
      data: {
        portfolioId,
        type,
        value,
        slug,
        description: description ?? null,
      },
      include: {
        _count: {
          select: { projects: true },
        },
      },
    })

    return NextResponse.json({ data: tag, success: true }, { status: 201 })
  } catch (error) {
    console.error('Error creating tag:', error)
    return NextResponse.json(
      { error: 'Failed to create tag', code: 'INTERNAL_ERROR', success: false },
      { status: 500 }
    )
  }
}
