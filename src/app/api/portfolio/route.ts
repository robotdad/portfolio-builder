import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { VALIDATION_ERRORS } from '@/lib/messages'
import { apiSuccess, apiCreated, apiValidationError, apiConflict, apiInternalError } from '@/lib/api'

// GET - Fetch the first portfolio (for MVP, we only support one)
export async function GET() {
  try {
    const portfolio = await prisma.portfolio.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        assets: true,
        pages: { orderBy: { navOrder: 'asc' } },
        profilePhoto: {
          select: {
            id: true,
            url: true,
            thumbnailUrl: true,
            altText: true,
          },
        },
      },
    })
    
    return apiSuccess(portfolio)
  } catch (error) {
    console.error('Failed to fetch portfolio:', error)
    return apiInternalError('Failed to fetch portfolio')
  }
}

// POST - Create a new portfolio with homepage (atomic)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, slug, title, bio, theme } = body

    // Validate required fields
    if (!slug) {
      return apiValidationError('Slug is required')
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return apiValidationError(VALIDATION_ERRORS.SLUG_FORMAT)
    }

    // Check if slug is already taken
    const existing = await prisma.portfolio.findUnique({
      where: { slug },
    })

    if (existing) {
      return apiConflict(VALIDATION_ERRORS.SLUG_TAKEN)
    }

    // Create initial hero section content
    const initialContent = JSON.stringify({
      sections: [{
        id: crypto.randomUUID(),
        type: 'hero',
        name: name || 'Your Name',
        title: title || 'Your Professional Title',
        bio: '<p>Welcome to my portfolio. Edit this section to tell your story.</p>',
        profileImageUrl: null,
        resumeUrl: null,
        showResumeLink: false,
      }]
    })

    // ATOMIC: Create portfolio WITH homepage in single transaction
    // This ensures no portfolio ever exists without a homepage
    const portfolio = await prisma.portfolio.create({
      data: {
        name: name || '',
        slug,
        title: title || '',
        bio: bio || '',
        draftTheme: theme || 'modern-minimal',
        publishedTheme: theme || 'modern-minimal',
        // showAboutSection defaults to true via schema
        pages: {
          create: {
            title: 'Home',
            slug: '', // Empty slug = homepage
            navOrder: 0,
            isHomepage: true,
            showInNav: true,
            // Draft/Publish: New portfolios start with draft content only
            // Content is not published until explicit publish action
            draftContent: initialContent,
            publishedContent: initialContent, // Also publish initially so site works immediately
            lastPublishedAt: new Date(),
          }
        }
      },
      include: {
        assets: true,
        pages: { orderBy: { navOrder: 'asc' } },
        profilePhoto: {
          select: {
            id: true,
            url: true,
            thumbnailUrl: true,
            altText: true,
          },
        },
      },
    })

    return apiCreated(portfolio)
  } catch (error) {
    console.error('Failed to create portfolio:', error)
    return apiInternalError('Failed to create portfolio')
  }
}

// PUT - Update existing portfolio settings only (content is stored in pages)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, slug, title, bio, theme, template, showAboutSection, profilePhotoId } = body

    // Validate required fields - only id is always required
    if (!id) {
      return apiValidationError('ID is required')
    }

    // If slug is being updated, validate it
    if (slug !== undefined) {
      // Validate slug format
      if (!/^[a-z0-9-]+$/.test(slug)) {
        return apiValidationError(VALIDATION_ERRORS.SLUG_FORMAT)
      }

      // Check if slug is taken by another portfolio
      const existing = await prisma.portfolio.findFirst({
        where: {
          slug,
          NOT: { id },
        },
      })

      if (existing) {
        return apiConflict(VALIDATION_ERRORS.SLUG_TAKEN)
      }
    }

    // Build update data - only include fields that were provided
    const updateData: Record<string, unknown> = {}

    if (name !== undefined) updateData.name = name
    if (slug !== undefined) updateData.slug = slug
    if (title !== undefined) updateData.title = title
    if (bio !== undefined) updateData.bio = bio
    if (theme !== undefined) updateData.draftTheme = theme
    if (template !== undefined) updateData.draftTemplate = template
    if (showAboutSection !== undefined) updateData.showAboutSection = showAboutSection
    
    // Handle profilePhotoId - can be set to null to remove, or to a valid asset ID
    if (profilePhotoId !== undefined) {
      updateData.profilePhotoId = profilePhotoId
    }

    // Update portfolio settings only - content lives in Page.draftContent/publishedContent
    const portfolio = await prisma.portfolio.update({
      where: { id },
      data: updateData,
      include: {
        assets: true,
        profilePhoto: {
          select: {
            id: true,
            url: true,
            thumbnailUrl: true,
            altText: true,
          },
        },
      },
    })

    return apiSuccess(portfolio)
  } catch (error) {
    console.error('Failed to update portfolio:', error)
    return apiInternalError('Failed to update portfolio')
  }
}
