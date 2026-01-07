import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; galleryImageId: string }> }
) {
  const { galleryImageId } = await params
  await prisma.projectGalleryImage.delete({
    where: { id: galleryImageId },
  })
  
  return NextResponse.json({ success: true })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; galleryImageId: string }> }
) {
  const { galleryImageId } = await params
  const { altText, caption } = await request.json()
  
  const updated = await prisma.projectGalleryImage.update({
    where: { id: galleryImageId },
    data: {
      altText: altText !== undefined ? altText : undefined,
      caption: caption !== undefined ? caption : undefined,
    },
  })
  
  return NextResponse.json(updated)
}
