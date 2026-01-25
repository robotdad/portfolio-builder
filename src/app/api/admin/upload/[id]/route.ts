import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rm } from 'fs/promises'
import path from 'path'

// CUID format: 25 alphanumeric characters (e.g., "clrk8z1234567abcdefghij")
const VALID_ID_PATTERN = /^[a-z0-9]{20,30}$/i

function isValidAssetId(id: string): boolean {
  return VALID_ID_PATTERN.test(id)
}

interface RouteParams {
  params: Promise<{ id: string }>
}

// PATCH - Update asset alt text and caption
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    // Validate ID format to prevent path traversal
    if (!isValidAssetId(id)) {
      return NextResponse.json(
        { message: 'Invalid asset ID format' },
        { status: 400 }
      )
    }

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

    // Validate ID format to prevent path traversal
    if (!isValidAssetId(id)) {
      return NextResponse.json(
        { message: 'Invalid asset ID format' },
        { status: 400 }
      )
    }

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

    // Construct path with additional safety check
    const uploadsDir = path.resolve(process.cwd(), 'public/uploads')
    const assetDir = path.resolve(uploadsDir, id)
    
    // Ensure resolved path is still within uploads directory (defense in depth)
    if (!assetDir.startsWith(uploadsDir)) {
      return NextResponse.json(
        { message: 'Invalid asset path' },
        { status: 400 }
      )
    }
    
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
