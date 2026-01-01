import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { addProjectImagesSchema } from '@/lib/validations/project'

// GET /api/projects/[id]/images
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        galleryImages: {
          orderBy: { order: 'asc' },
          include: {
            asset: {
              select: {
                id: true,
                url: true,
                thumbnailUrl: true,
                altText: true,
                caption: true,
                filename: true,
                mimeType: true,
              },
            },
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found', code: 'NOT_FOUND', success: false },
        { status: 404 }
      )
    }

    const images = project.galleryImages.map(gi => ({
      ...gi.asset,
      order: gi.order,
    }))

    return NextResponse.json({ data: images, success: true })
  } catch (error) {
    console.error('Error fetching project images:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project images', code: 'INTERNAL_ERROR', success: false },
      { status: 500 }
    )
  }
}

// POST /api/projects/[id]/images
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validation = addProjectImagesSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message, code: 'VALIDATION_ERROR', success: false },
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

    // Get current max order
    const maxOrder = await prisma.projectGalleryImage.aggregate({
      where: { projectId: id },
      _max: { order: true },
    })
    let nextOrder = (maxOrder._max.order ?? -1) + 1

    // Create gallery image entries (skip duplicates)
    const created = []
    for (const assetId of assetIds) {
      try {
        const galleryImage = await prisma.projectGalleryImage.create({
          data: {
            projectId: id,
            assetId,
            order: nextOrder++,
          },
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
        created.push(galleryImage)
      } catch {
        // Skip duplicates (unique constraint violation)
      }
    }

    // Return updated project with all images
    const updatedProject = await prisma.project.findUnique({
      where: { id },
      include: {
        galleryImages: {
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
        },
      },
    })

    const images = updatedProject!.galleryImages.map(gi => ({
      ...gi.asset,
      order: gi.order,
    }))

    return NextResponse.json({ data: { id, title: project.title, images }, success: true })
  } catch (error) {
    console.error('Error adding project images:', error)
    return NextResponse.json(
      { error: 'Failed to add project images', code: 'INTERNAL_ERROR', success: false },
      { status: 500 }
    )
  }
}
