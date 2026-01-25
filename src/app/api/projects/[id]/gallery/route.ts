import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
