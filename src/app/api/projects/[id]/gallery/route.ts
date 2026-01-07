import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { assetId, altText, caption, order } = await request.json()
  
  const galleryImage = await prisma.projectGalleryImage.create({
    data: {
      projectId: id,
      assetId,
      altText: altText || '',
      caption: caption || null,
      order: order || 0,
    },
    include: {
      asset: true,
    },
  })
  
  return NextResponse.json(galleryImage)
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const galleryImages = await prisma.projectGalleryImage.findMany({
    where: { projectId: id },
    include: {
      asset: true,
    },
    orderBy: { order: 'asc' },
  })
  
  return NextResponse.json({ data: galleryImages, success: true })
}
