import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiCreated, apiValidationError, apiInternalError } from '@/lib/api'

// POST - Create a new portfolio with homepage (atomic)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, title, bio, theme, draftTheme, publishedTheme, draftTemplate, publishedTemplate } = body

    // Resolve theme/template: prefer explicit draft/published fields, fall back to single field, then default
    const resolvedDraftTheme = draftTheme || theme || 'modern-minimal'
    const resolvedPublishedTheme = publishedTheme || theme || 'modern-minimal'
    const resolvedDraftTemplate = draftTemplate || 'featured-grid'
    const resolvedPublishedTemplate = publishedTemplate || 'featured-grid'

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
        title: title || '',
        bio: bio || '',
        draftTheme: resolvedDraftTheme,
        publishedTheme: resolvedPublishedTheme,
        draftTemplate: resolvedDraftTemplate,
        publishedTemplate: resolvedPublishedTemplate,
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
    const { id, name, title, bio, contactEmail, theme, template, profilePhotoId } = body

    // Validate required fields - only id is always required
    if (!id) {
      return apiValidationError('ID is required')
    }

    // Build update data - only include fields that were provided
    const updateData: Record<string, unknown> = {}

    if (name !== undefined) updateData.name = name
    if (title !== undefined) updateData.title = title
    if (bio !== undefined) updateData.bio = bio
    if (contactEmail !== undefined) updateData.contactEmail = contactEmail
    if (theme !== undefined) updateData.draftTheme = theme
    if (template !== undefined) updateData.draftTemplate = template
    
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
