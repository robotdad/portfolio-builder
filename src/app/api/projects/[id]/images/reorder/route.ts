import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { reorderProjectImagesSchema } from '@/lib/validations/project'

// PUT /api/projects/[id]/images/reorder
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validation = reorderProjectImagesSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message, code: 'VALIDATION_ERROR', success: false },
        { status: 400 }
      )
    }

    const { assetIds } = validation.data

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id },
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found', code: 'NOT_FOUND', success: false },
        { status: 404 }
      )
    }

    // Update order for each gallery image
    const updates = assetIds.map((assetId, index) =>
      prisma.projectGalleryImage.updateMany({
        where: { projectId: id, assetId },
        data: { order: index },
      })
    )

    await prisma.$transaction(updates)

    // Return reordered images
    const galleryImages = await prisma.projectGalleryImage.findMany({
      where: { projectId: id },
      orderBy: { order: 'asc' },
      include: {
        asset: {
          select: {
            id: true,
            url: true,
            thumbnailUrl: true,
            altText: true,
          },
        },
      },
    })

    const images = galleryImages.map(gi => ({
      ...gi.asset,
      order: gi.order,
    }))

    return NextResponse.json({ data: images, success: true })
  } catch (error) {
    console.error('Error reordering project images:', error)
    return NextResponse.json(
      { error: 'Failed to reorder project images', code: 'INTERNAL_ERROR', success: false },
      { status: 500 }
    )
  }
}
