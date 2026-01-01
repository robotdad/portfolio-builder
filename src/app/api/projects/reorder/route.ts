import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { reorderProjectsSchema } from '@/lib/validations/project'

// PUT /api/projects/reorder
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = reorderProjectsSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message, code: 'VALIDATION_ERROR', success: false },
        { status: 400 }
      )
    }

    const { projectIds } = validation.data

    // Verify all projects exist and belong to same category
    const projects = await prisma.project.findMany({
      where: { id: { in: projectIds } },
      select: { id: true, categoryId: true },
    })

    if (projects.length !== projectIds.length) {
      return NextResponse.json(
        { error: 'One or more projects not found', code: 'NOT_FOUND', success: false },
        { status: 404 }
      )
    }

    const categoryIds = [...new Set(projects.map(p => p.categoryId))]
    if (categoryIds.length > 1) {
      return NextResponse.json(
        { error: 'All projects must belong to the same category', code: 'CATEGORY_MISMATCH', success: false },
        { status: 400 }
      )
    }

    // Update order for each project
    const updates = projectIds.map((id, index) =>
      prisma.project.update({
        where: { id },
        data: { order: index },
        select: { id: true, title: true, order: true },
      })
    )

    const updated = await prisma.$transaction(updates)

    return NextResponse.json({ data: updated, success: true })
  } catch (error) {
    console.error('Error reordering projects:', error)
    return NextResponse.json(
      { error: 'Failed to reorder projects', code: 'INTERNAL_ERROR', success: false },
      { status: 500 }
    )
  }
}
