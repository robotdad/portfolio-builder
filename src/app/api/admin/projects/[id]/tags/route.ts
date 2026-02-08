import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ENTITY_ERRORS } from '@/lib/messages'
import { setProjectTagsSchema } from '@/lib/validations/tag'

// GET /api/admin/projects/[id]/tags
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const project = await prisma.project.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!project) {
      return NextResponse.json(
        { error: ENTITY_ERRORS.PROJECT_NOT_FOUND.message, code: 'NOT_FOUND', success: false },
        { status: 404 }
      )
    }

    const projectTags = await prisma.projectTag.findMany({
      where: { projectId: id },
      include: {
        tag: true,
      },
    })

    const tags = projectTags.map((pt) => pt.tag)

    return NextResponse.json({ data: tags, success: true })
  } catch (error) {
    console.error('Error fetching project tags:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project tags', code: 'INTERNAL_ERROR', success: false },
      { status: 500 }
    )
  }
}

// PUT /api/admin/projects/[id]/tags - Replace all tags for a project
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validation = setProjectTagsSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message, code: 'VALIDATION_ERROR', success: false },
        { status: 400 }
      )
    }

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        category: {
          select: { portfolioId: true },
        },
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: ENTITY_ERRORS.PROJECT_NOT_FOUND.message, code: 'NOT_FOUND', success: false },
        { status: 404 }
      )
    }

    const { tagIds } = validation.data

    // Verify all tags exist and belong to the same portfolio
    if (tagIds.length > 0) {
      const tags = await prisma.tag.findMany({
        where: { id: { in: tagIds } },
        select: { id: true, portfolioId: true },
      })

      if (tags.length !== tagIds.length) {
        return NextResponse.json(
          { error: 'One or more tags not found', code: 'NOT_FOUND', success: false },
          { status: 404 }
        )
      }

      const wrongPortfolio = tags.find((t) => t.portfolioId !== project.category.portfolioId)
      if (wrongPortfolio) {
        return NextResponse.json(
          { error: 'All tags must belong to the same portfolio as the project', code: 'VALIDATION_ERROR', success: false },
          { status: 400 }
        )
      }
    }

    // Replace all: delete existing, create new
    await prisma.$transaction([
      prisma.projectTag.deleteMany({
        where: { projectId: id },
      }),
      ...tagIds.map((tagId) =>
        prisma.projectTag.create({
          data: { projectId: id, tagId },
        })
      ),
    ])

    // Return the updated tags
    const updatedTags = await prisma.projectTag.findMany({
      where: { projectId: id },
      include: { tag: true },
    })

    return NextResponse.json({
      data: updatedTags.map((pt) => pt.tag),
      success: true,
    })
  } catch (error) {
    console.error('Error setting project tags:', error)
    return NextResponse.json(
      { error: 'Failed to set project tags', code: 'INTERNAL_ERROR', success: false },
      { status: 500 }
    )
  }
}
