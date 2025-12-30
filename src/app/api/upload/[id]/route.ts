import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rm } from 'fs/promises'
import path from 'path'

interface RouteParams {
  params: Promise<{ id: string }>
}

// PATCH - Update asset alt text and caption
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const { altText, caption } = body

    // Validate asset exists
    const existing = await prisma.asset.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { message: 'Asset not found' },
        { status: 404 }
      )
    }

    // Build update data - only include fields that were provided
    const updateData: { altText?: string; caption?: string | null } = {}
    
    if (typeof altText === 'string') {
      updateData.altText = altText
    }
    
    if (typeof caption === 'string') {
      updateData.caption = caption || null
    }

    // Update asset
    const asset = await prisma.asset.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(asset)
  } catch (error) {
    console.error('Failed to update asset:', error)
    return NextResponse.json(
      { message: 'Failed to update asset' },
      { status: 500 }
    )
  }
}

// DELETE - Remove asset and its files
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    // Validate asset exists
    const existing = await prisma.asset.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { message: 'Asset not found' },
        { status: 404 }
      )
    }

    // Delete files from disk
    const assetDir = path.join(process.cwd(), 'public/uploads', id)
    try {
      await rm(assetDir, { recursive: true, force: true })
    } catch (fileError) {
      // Log but don't fail if files don't exist
      console.warn('Could not delete asset files:', fileError)
    }

    // Delete from database
    await prisma.asset.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete asset:', error)
    return NextResponse.json(
      { message: 'Failed to delete asset' },
      { status: 500 }
    )
  }
}
