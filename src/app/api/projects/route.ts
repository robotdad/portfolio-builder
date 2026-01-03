import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createProjectSchema } from '@/lib/validations/project'
import { generateSlug } from '@/lib/utils/slug'

// GET /api/projects?categoryId=xxx OR ?portfolioId=xxx&featured=true
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const portfolioId = searchParams.get('portfolioId')
    const featured = searchParams.get('featured')

    let whereClause: Record<string, unknown> = {}

    if (categoryId) {
      whereClause.categoryId = categoryId
    } else if (portfolioId && featured === 'true') {
      // Get featured projects across all categories in portfolio
      whereClause = {
        category: { portfolioId },
        isFeatured: true,
      }
    } else {
      return NextResponse.json(
        { error: 'categoryId or (portfolioId + featured=true) is required', code: 'VALIDATION_ERROR', success: false },
        { status: 400 }
      )
    }

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ data: projects, success: true })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects', code: 'INTERNAL_ERROR', success: false },
      { status: 500 }
    )
  }
}

// POST /api/projects
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = createProjectSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message, code: 'VALIDATION_ERROR', success: false },
        { status: 400 }
      )
    }

    const { categoryId, title, year, venue, role, isFeatured } = validation.data

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found', code: 'NOT_FOUND', success: false },
        { status: 404 }
      )
    }

    // Generate unique slug within category
    const baseSlug = generateSlug(title)
    let slug = baseSlug
    let counter = 2

    while (true) {
      const existing = await prisma.project.findUnique({
        where: { categoryId_slug: { categoryId, slug } },
      })
      if (!existing) break
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Get max order within category
    const maxOrder = await prisma.project.aggregate({
      where: { categoryId },
      _max: { order: true },
    })
    const order = (maxOrder._max.order ?? -1) + 1

    const project = await prisma.project.create({
      data: {
        categoryId,
        title,
        slug,
        year,
        venue,
        role,
        isFeatured: isFeatured ?? false,
        order,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    })

    return NextResponse.json({ data: project, success: true }, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Failed to create project', code: 'INTERNAL_ERROR', success: false },
      { status: 500 }
    )
  }
}
