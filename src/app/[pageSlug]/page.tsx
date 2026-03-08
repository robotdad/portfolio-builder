import { notFound, redirect } from 'next/navigation'
import type { Page, Category, Project } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { stripHtml } from '@/lib/sanitize'
import { SectionRenderer } from '@/components/portfolio/SectionRenderer'
import { CategoryLanding } from '@/components/portfolio/CategoryLanding'


import { deserializeSections } from '@/lib/serialization'
import { isHeroSection, isGallerySection } from '@/lib/content-schema'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ pageSlug: string }>
}

// Type for project with included featuredImage relation
interface ProjectWithFeaturedImage extends Project {
  featuredImage: {
    id: string
    url: string
    thumbnailUrl: string
    altText: string
    width: number
    height: number
  } | null
}

// Helper to determine if slug matches a category or page
async function resolveSlugType(targetSlug: string) {
  const portfolio = await prisma.portfolio.findFirst({
    include: {
      pages: { orderBy: { navOrder: 'asc' } },
      categories: { orderBy: { order: 'asc' } },
    },
  })

  if (!portfolio) return { type: 'not_found' as const, portfolio: null }

  // Check if it's a category first (categories take precedence)
  const category = portfolio.categories.find((c: Category) => c.slug === targetSlug)
  if (category) {
    return { type: 'category' as const, portfolio, category }
  }

  // Check if it's a page
  const page = portfolio.pages.find((p: Page) => p.slug === targetSlug)
  if (page) {
    return { type: 'page' as const, portfolio, page }
  }

  return { type: 'not_found' as const, portfolio }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { pageSlug } = await params
  const result = await resolveSlugType(pageSlug)

  if (result.type === 'not_found' || !result.portfolio) {
    return { title: 'Not Found' }
  }

  const portfolio = result.portfolio

  if (result.type === 'category') {
    return {
      title: `${result.category.name} - ${portfolio.name}`,
      description: result.category.description || `${result.category.name} work by ${portfolio.name}`,
    }
  }

  // Page metadata
  const page = result.page!
  const sections = deserializeSections(page.publishedContent)
  const heroSection = sections.find(isHeroSection)
  const name = heroSection?.name || portfolio.name

  return {
    title: `${page.title} - ${name}`,
    description: heroSection?.bio
      ? stripHtml(heroSection.bio).substring(0, 160)
      : `${page.title} page of ${name}'s portfolio`,
  }
}

export default async function PortfolioSubPage({ params }: PageProps) {
  const { pageSlug } = await params
  
  const portfolio = await prisma.portfolio.findFirst({
    include: {
      assets: true,
      pages: { orderBy: { navOrder: 'asc' } },
      categories: { orderBy: { order: 'asc' } },
    },
  })

  if (!portfolio) {
    notFound()
  }

  // Check if slug matches a category first
  const category = portfolio.categories.find((c: Category) => c.slug === pageSlug)
  
  if (category) {
    // Render category landing page
    return renderCategoryPage(portfolio, category)
  }

  // Check if slug matches a page
  const currentPage = portfolio.pages.find((p: Page) => p.slug === pageSlug)
  
  if (!currentPage) {
    notFound()
  }

  // If this page is the homepage, redirect to the base portfolio URL
  if (currentPage.isHomepage) {
    redirect('/')
  }

  // Render regular page
  return renderPortfolioPage(portfolio, currentPage)
}

// Render category landing page
async function renderCategoryPage(
  portfolio: Awaited<ReturnType<typeof prisma.portfolio.findFirst>> & { 
    pages: Page[]; 
    categories: Category[] 
  },
  category: Category
) {
  // Fetch full category data with publishedContent and featuredImage
  const fullCategory = await prisma.category.findFirst({
    where: { 
      id: category.id,
      portfolioId: portfolio.id,
    },
    include: {
      parent: {
        select: { id: true, name: true, slug: true },
      },
      featuredImage: {
        select: {
          id: true,
          url: true,
          thumbnailUrl: true,
          altText: true,
          width: true,
          height: true,
        },
      },
      children: {
        orderBy: { order: 'asc' },
        include: {
          featuredImage: {
            select: {
              id: true,
              url: true,
              altText: true,
              width: true,
              height: true,
            },
          },
          _count: { select: { projects: true } },
        },
      },
      projects: {
        where: { publishedContent: { not: null } },
        orderBy: { order: 'asc' },
        include: {
          featuredImage: {
            select: {
              id: true,
              url: true,
              thumbnailUrl: true,
              altText: true,
              width: true,
              height: true,
            },
          },
        },
      },
    },
  })

  if (!fullCategory) {
    notFound()
  }

  // Deserialize sections from published content
  const sections = deserializeSections(fullCategory.publishedContent)

  // Get portfolio name from hero section
  const homePage = portfolio.pages.find((p: Page) => p.isHomepage) || portfolio.pages[0]
  const homePageSections = deserializeSections(homePage?.publishedContent)
  const heroSection = homePageSections.find(isHeroSection)
  const portfolioName = heroSection?.name || portfolio.name

  // Parent categories with children always use CategoryLanding (subcategory tiles).
  // SectionRenderer only applies to leaf categories with published content.
  const hasChildren = fullCategory.children.length > 0

  if (!hasChildren && sections.length > 0) {
    // Build a proper page header from category data instead of relying on section ordering.
    // Filter out redundant text/heading sections so content doesn't render twice.
    const cleanedSections = sections
      .filter(s => {
        // Remove text section that duplicates the category description
        if (s.type === 'text' && 'content' in s) {
          const stripped = (s as { content?: string }).content?.replace(/<[^>]*>/g, '').trim()
          if (stripped === fullCategory.description?.trim()) return false
        }
        return true
      })
      .map(s => {
        // Suppress project-grid heading that duplicates the category name
        if (s.type === 'project-grid' && 'heading' in s) {
          const pg = s as { heading?: string }
          if (pg.heading === fullCategory.name) {
            return { ...s, heading: '' }
          }
        }
        return s
      })

    return (
      <>
        <div className="container">
          <header className="category-page-header">
            <h1 className="category-title">{fullCategory.name}</h1>
            {fullCategory.description && (
              <p className="category-description">{fullCategory.description}</p>
            )}
          </header>
        </div>
        <SectionRenderer
          sections={cleanedSections}
          portfolioSlug=""
          categorySlug={fullCategory.slug}
          projects={fullCategory.projects}
        />
      </>
    )
  }

  // Otherwise fall back to existing CategoryLanding component (backward compatibility)
  const projectsWithImages = fullCategory.projects.map((project: ProjectWithFeaturedImage) => {
    // Prefer explicit featuredImage, fallback to first gallery image
    let featuredImageUrl: string | null = null
    let featuredImageAlt: string = project.title
    let featuredImageWidth: number | undefined = undefined
    let featuredImageHeight: number | undefined = undefined
    
    if (project.featuredImage) {
      featuredImageUrl = project.featuredImage.url
      featuredImageAlt = project.featuredImage.altText || project.title
      featuredImageWidth = project.featuredImage.width
      featuredImageHeight = project.featuredImage.height
    } else {
      // Fallback: extract from gallery section in publishedContent
      const projectSections = deserializeSections(project.publishedContent)
      const gallerySection = projectSections.find(isGallerySection)
      const firstImage = gallerySection?.images?.[0]
      if (firstImage) {
        featuredImageUrl = firstImage.imageUrl
        featuredImageAlt = firstImage.altText || project.title
      }
    }
    
    return {
      id: project.id,
      slug: project.slug,
      title: project.title,
      venue: project.venue,
      year: project.year,
      order: project.order,
      featuredImageUrl,
      featuredImageAlt,
      featuredImageWidth,
      featuredImageHeight,
    }
  })

  return (
    <CategoryLanding
      portfolio={{
        name: portfolioName,
        publishedTheme: portfolio.publishedTheme,
      }}
      category={{
        id: fullCategory.id,
        name: fullCategory.name,
        slug: fullCategory.slug,
        description: fullCategory.description,
      }}
      parentCategory={fullCategory.parent ? {
        name: fullCategory.parent.name,
        slug: fullCategory.parent.slug,
      } : undefined}
      projects={projectsWithImages}
      subcategories={fullCategory.children.map(child => ({
        id: child.id,
        name: child.name,
        slug: child.slug,
        featuredImage: child.featuredImage,
        projectCount: child._count.projects,
      }))}
    />
  )
}

// Render regular portfolio page
function renderPortfolioPage(
  portfolio: Awaited<ReturnType<typeof prisma.portfolio.findFirst>> & { 
    pages: Page[]; 
    categories: Category[] 
  },
  currentPage: Page
) {
  // Parse sections from PUBLISHED content only
  const sections = deserializeSections(currentPage.publishedContent)

  // Note: Navigation and footer are provided by the layout
  return (
    <div className="container">
      {sections.length > 0 ? (
        <SectionRenderer sections={sections} portfolioSlug="" />
      ) : (
        <div className="portfolio-empty-page">
          <h1>{currentPage.title}</h1>
          <p>This page is under construction.</p>
        </div>
      )}
    </div>
  )
}
