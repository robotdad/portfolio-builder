import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// DELETE /api/projects/[id]/images/[assetId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; assetId: string }> }
) {
  try {
    const { id, assetId } = await params

    // Find and delete the gallery image link
    const galleryImage = await prisma.projectGalleryImage.findUnique({
      where: {
        projectId_assetId: {
          projectId: id,
          assetId,
        },
      },
    })

    if (!galleryImage) {
      return NextResponse.json(
        { error: 'Image not found in project gallery', code: 'NOT_FOUND', success: false },
        { status: 404 }
      )
    }

    await prisma.projectGalleryImage.delete({
      where: { id: galleryImage.id },
    })

    return NextResponse.json({ data: null, success: true })
  } catch (error) {
    console.error('Error removing project image:', error)
    return NextResponse.json(
      { error: 'Failed to remove project image', code: 'INTERNAL_ERROR', success: false },
      { status: 500 }
    )
  }
}
