import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ENTITY_ERRORS } from '@/lib/messages'
import { updateProjectSchema } from '@/lib/validations/project'
import { generateSlug } from '@/lib/utils/slug'

// PUT /api/admin/projects/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validation = updateProjectSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message, code: 'VALIDATION_ERROR', success: false },
        { status: 400 }
      )
    }

    // Verify project exists
    const existing = await prisma.project.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: ENTITY_ERRORS.PROJECT_NOT_FOUND.message, code: 'NOT_FOUND', success: false },
        { status: 404 }
      )
    }

    const { categoryId, title, year, venue, role, draftContent, publishedContent, isFeatured, order, featuredImageId } = validation.data
    const updateData: Record<string, unknown> = {}

    // Handle category change (moving project)
    if (categoryId !== undefined && categoryId !== existing.categoryId) {
      // Verify new category exists
      const newCategory = await prisma.category.findUnique({
        where: { id: categoryId },
      })
      if (!newCategory) {
        return NextResponse.json(
          { error: ENTITY_ERRORS.CATEGORY_NOT_FOUND.message, code: 'NOT_FOUND', success: false },
          { status: 404 }
        )
      }
      updateData.categoryId = categoryId

      // Regenerate slug for new category scope
      const baseSlug = generateSlug(title ?? existing.title)
      let slug = baseSlug
      let counter = 2

      while (true) {
        const existingSlug = await prisma.project.findFirst({
          where: { categoryId, slug, id: { not: id } },
        })
        if (!existingSlug) break
        slug = `${baseSlug}-${counter}`
        counter++
      }
      updateData.slug = slug
    } else if (title !== undefined && title !== existing.title) {
      // Regenerate slug if title changes (within same category)
      const targetCategoryId = categoryId ?? existing.categoryId
      const baseSlug = generateSlug(title)
      let slug = baseSlug
      let counter = 2

      while (true) {
        const existingSlug = await prisma.project.findFirst({
          where: { categoryId: targetCategoryId, slug, id: { not: id } },
        })
        if (!existingSlug) break
        slug = `${baseSlug}-${counter}`
        counter++
      }
      updateData.slug = slug
    }

    if (title !== undefined) updateData.title = title
    if (year !== undefined) updateData.year = year
    if (venue !== undefined) updateData.venue = venue
    if (role !== undefined) updateData.role = role
    if (draftContent !== undefined) updateData.draftContent = draftContent
    if (publishedContent !== undefined) {
      updateData.publishedContent = publishedContent
      // If publishing content, update timestamp
      if (publishedContent !== null) {
        updateData.lastPublishedAt = new Date()
      }
    }
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured
    if (order !== undefined) updateData.order = order
    if (featuredImageId !== undefined) updateData.featuredImageId = featuredImageId

    const project = await prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            portfolioId: true,
          },
        },
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

    return NextResponse.json({ data: project, success: true })
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { error: 'Failed to update project', code: 'INTERNAL_ERROR', success: false },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/projects/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await prisma.project.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: ENTITY_ERRORS.PROJECT_NOT_FOUND.message, code: 'NOT_FOUND', success: false },
        { status: 404 }
      )
    }

    await prisma.project.delete({
      where: { id },
    })

    return NextResponse.json({ data: null, success: true })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { error: 'Failed to delete project', code: 'INTERNAL_ERROR', success: false },
      { status: 500 }
    )
  }
}
