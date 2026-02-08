import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ENTITY_ERRORS } from '@/lib/messages'
import { updateTagSchema } from '@/lib/validations/tag'
import { generateSlug } from '@/lib/utils/slug'

// PUT /api/admin/tags/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validation = updateTagSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message, code: 'VALIDATION_ERROR', success: false },
        { status: 400 }
      )
    }

    const existing = await prisma.tag.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: ENTITY_ERRORS.TAG_NOT_FOUND.message, code: 'NOT_FOUND', success: false },
        { status: 404 }
      )
    }

    const { value, description } = validation.data
    const updateData: Record<string, unknown> = {}

    if (value !== undefined) {
      // Check for duplicate value within same portfolio + type
      const duplicate = await prisma.tag.findFirst({
        where: {
          portfolioId: existing.portfolioId,
          type: existing.type,
          value,
          id: { not: id },
        },
      })

      if (duplicate) {
        return NextResponse.json(
          { error: `A ${existing.type} tag with value "${value}" already exists`, code: 'VALIDATION_ERROR', success: false },
          { status: 409 }
        )
      }

      updateData.value = value

      // Regenerate slug when value changes
      const baseSlug = generateSlug(value)
      let slug = baseSlug
      let counter = 2

      while (true) {
        const existingSlug = await prisma.tag.findFirst({
          where: {
            portfolioId: existing.portfolioId,
            type: existing.type,
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

    const tag = await prisma.tag.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: { projects: true },
        },
      },
    })

    return NextResponse.json({ data: tag, success: true })
  } catch (error) {
    console.error('Error updating tag:', error)
    return NextResponse.json(
      { error: 'Failed to update tag', code: 'INTERNAL_ERROR', success: false },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/tags/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await prisma.tag.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: ENTITY_ERRORS.TAG_NOT_FOUND.message, code: 'NOT_FOUND', success: false },
        { status: 404 }
      )
    }

    // Cascade delete handled by Prisma schema (ProjectTag entries removed)
    await prisma.tag.delete({
      where: { id },
    })

    return NextResponse.json({ data: null, success: true })
  } catch (error) {
    console.error('Error deleting tag:', error)
    return NextResponse.json(
      { error: 'Failed to delete tag', code: 'INTERNAL_ERROR', success: false },
      { status: 500 }
    )
  }
}
