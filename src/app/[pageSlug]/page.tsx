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
  // Get projects for this category
  const projects = await prisma.project.findMany({
    where: { 
      categoryId: category.id,
      publishedContent: { not: null },
    },
    orderBy: { order: 'asc' },
    include: {
      featuredImage: {
        select: {
          id: true,
          url: true,
          thumbnailUrl: true,
          altText: true,
        },
      },
    },
  })

  // Get portfolio name from hero section
  const homePage = portfolio.pages.find((p: Page) => p.isHomepage) || portfolio.pages[0]
  const homePageSections = deserializeSections(homePage?.publishedContent)
  const heroSection = homePageSections.find(isHeroSection)
  const portfolioName = heroSection?.name || portfolio.name

  const projectsWithImages = projects.map((project: ProjectWithFeaturedImage) => {
    // Prefer explicit featuredImage, fallback to first gallery image
    let featuredImageUrl: string | null = null
    let featuredImageAlt: string = project.title
    
    if (project.featuredImage) {
      featuredImageUrl = project.featuredImage.url
      featuredImageAlt = project.featuredImage.altText || project.title
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
    }
  })

  return (
    <CategoryLanding
      portfolio={{
        name: portfolioName,
        publishedTheme: portfolio.publishedTheme,
      }}
      category={{
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
      }}
      projects={projectsWithImages}
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
