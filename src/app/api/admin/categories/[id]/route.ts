import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateCategorySchema } from '@/lib/validations/category'
import { generateSlug } from '@/lib/utils/slug'

// PUT /api/admin/categories/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validation = updateCategorySchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message, code: 'VALIDATION_ERROR', success: false },
        { status: 400 }
      )
    }

    // Verify category exists
    const existing = await prisma.category.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Category not found', code: 'NOT_FOUND', success: false },
        { status: 404 }
      )
    }

    const { name, description, order, featuredImageId, draftContent } = validation.data
    const updateData: Record<string, unknown> = {}

    if (name !== undefined) {
      updateData.name = name
      // Regenerate slug if name changes
      const baseSlug = generateSlug(name)
      let slug = baseSlug
      let counter = 2

      while (true) {
        const existingSlug = await prisma.category.findFirst({
          where: {
            portfolioId: existing.portfolioId,
            slug,
            id: { not: id },
          },
        })
        if (!existingSlug) break
        slug = `${baseSlug}-${counter}`
        counter++
      }
      updateData.slug = slug
    }

    if (description !== undefined) updateData.description = description
    if (order !== undefined) updateData.order = order
    if (featuredImageId !== undefined) updateData.featuredImageId = featuredImageId
    if (draftContent !== undefined) updateData.draftContent = draftContent

    const category = await prisma.category.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json({ data: category, success: true })
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { error: 'Failed to update category', code: 'INTERNAL_ERROR', success: false },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/categories/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await prisma.category.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Category not found', code: 'NOT_FOUND', success: false },
        { status: 404 }
      )
    }

    // Cascade delete handled by Prisma schema
    await prisma.category.delete({
      where: { id },
    })

    return NextResponse.json({ data: null, success: true })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Failed to delete category', code: 'INTERNAL_ERROR', success: false },
      { status: 500 }
    )
  }
}
