import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { SectionRenderer } from '@/components/portfolio/SectionRenderer'
import { Navigation, type NavPage } from '@/components/portfolio/Navigation'
import { CategoryLanding } from '@/components/portfolio/CategoryLanding'
import { ProjectDetail } from '@/components/portfolio/ProjectDetail'
import { deserializeSections } from '@/lib/serialization'
import { isHeroSection, isGallerySection } from '@/lib/content-schema'
import { 
  FeaturedGridTemplate, 
  CleanMinimalTemplate, 
  type TemplateId 
} from '@/components/portfolio/templates'
import type { Metadata } from 'next'

// Template component lookup
const TemplateComponents = {
  'featured-grid': FeaturedGridTemplate,
  'clean-minimal': CleanMinimalTemplate,
} as const

interface PageProps {
  params: Promise<{ 
    pageSlug?: string[] 
  }>
  searchParams: Promise<{ template?: string }>
}

// Generate metadata for SEO (preview pages shouldn't be indexed)
export async function generateMetadata(): Promise<Metadata> {
  const portfolio = await prisma.portfolio.findFirst()
  
  return {
    title: `Preview - ${portfolio?.name || 'Portfolio'}`,
    robots: 'noindex, nofollow',
  }
}

/**
 * Preview Route - Shows draft content in published layout
 * 
 * URL patterns:
 * - /preview - Preview homepage
 * - /preview/page-slug - Preview specific page
 * - /preview/category-slug - Preview category landing
 * - /preview/category-slug/project-slug - Preview project detail
 */
export default async function PreviewPage({ params, searchParams }: PageProps) {
  const { pageSlug } = await params
  const { template: templateOverride } = await searchParams
  
  // Parse URL segments
  const firstSlug = pageSlug?.[0] || ''
  const secondSlug = pageSlug?.[1]
  
  // Fetch portfolio with all related data
  const portfolio = await prisma.portfolio.findFirst({
    include: {
      assets: true,
      pages: {
        orderBy: { navOrder: 'asc' },
      },
      categories: {
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
          projects: {
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
          },
        },
      },
    },
  })

  if (!portfolio) {
    notFound()
  }

  const theme = portfolio.draftTheme as 'modern-minimal' | 'classic-elegant' | 'bold-editorial'
  
  // Prepare navigation data
  const navPages: NavPage[] = portfolio.pages.map(p => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    isHomepage: p.isHomepage,
    showInNav: p.showInNav,
  }))
  
  const navCategories = portfolio.categories.map(c => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
  }))

  // Check if first slug matches a category
  const category = portfolio.categories.find(c => c.slug === firstSlug)
  
  if (category) {
    // If there's a second slug, it's a project
    if (secondSlug) {
      const project = category.projects.find(p => p.slug === secondSlug)
      
      if (!project) {
        notFound()
      }
      
      // Use draftContent for preview, fallback to publishedContent
      const contentToShow = project.draftContent || project.publishedContent
      
      if (!contentToShow) {
        notFound()
      }
      
      // Extract gallery images from content and map to expected format
      const projectSections = deserializeSections(contentToShow)
      const gallerySection = projectSections.find(isGallerySection)
      const galleryImages = (gallerySection?.images || []).map(img => ({
        id: img.id,
        imageUrl: img.imageUrl || '',
        altText: img.altText,
        caption: img.caption,
      }))
      
      return (
        <div className="portfolio-page preview-mode" data-theme={theme}>
          <PreviewBanner />
          <Navigation
            portfolioSlug="preview"
            portfolioName={portfolio.name}
            pages={navPages}
            categories={navCategories}
            theme={theme}
          />
          <ProjectDetail
            portfolio={{
              name: portfolio.name,
              publishedTheme: theme,
            }}
            category={{
              id: category.id,
              name: category.name,
              slug: category.slug,
            }}
            project={{
              id: project.id,
              slug: project.slug,
              title: project.title,
              venue: project.venue,
              year: project.year,
              role: project.role,
              publishedContent: contentToShow,
              galleryImages,
            }}
          />
        </div>
      )
    }
    
    // Category landing page - show all projects in category
    const projectsWithImages = category.projects
      .filter(p => p.draftContent || p.publishedContent) // Has any content
      .map(project => {
        // Prefer explicit featuredImage, fallback to gallery extraction
        let featuredImageUrl: string | null = null
        let featuredImageAlt: string = project.title
        
        if (project.featuredImage) {
          featuredImageUrl = project.featuredImage.url
          featuredImageAlt = project.featuredImage.altText || project.title
        } else {
          const contentToCheck = project.draftContent || project.publishedContent
          if (contentToCheck) {
            const projectSections = deserializeSections(contentToCheck)
            const gallerySection = projectSections.find(isGallerySection)
            const firstImage = gallerySection?.images?.[0]
            if (firstImage) {
              featuredImageUrl = firstImage.imageUrl
              featuredImageAlt = firstImage.altText || project.title
            }
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
      <div className="portfolio-page preview-mode" data-theme={theme}>
        <PreviewBanner />
        <CategoryLanding
          portfolio={{
            name: portfolio.name,
            publishedTheme: theme,
          }}
          category={{
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description,
          }}
          projects={projectsWithImages}
          portfolioSlug="preview"
        />
      </div>
    )
  }

  // Not a category - check for page (or homepage)
  let targetPage = portfolio.pages.find(p => p.slug === firstSlug)
  
  if (!targetPage && firstSlug === '') {
    targetPage = portfolio.pages.find(p => p.isHomepage)
  }
  
  if (!targetPage) {
    targetPage = portfolio.pages[0]
  }

  if (!targetPage) {
    notFound()
  }

  // Use draftContent for preview
  const sections = deserializeSections(targetPage.draftContent)
  
  // Get hero section for name extraction
  const heroSection = sections.find(isHeroSection)
  const name = heroSection?.name || portfolio.name

  // Build featured projects for homepage
  const featuredProjects = portfolio.categories.flatMap(c => 
    c.projects
      .filter(p => p.isFeatured && (p.draftContent || p.publishedContent))
      .map(p => {
        let featuredImageUrl: string | null = null
        let featuredImageAlt: string = p.title
        
        if (p.featuredImage) {
          featuredImageUrl = p.featuredImage.url
          featuredImageAlt = p.featuredImage.altText || p.title
        } else {
          const contentToCheck = p.draftContent || p.publishedContent
          if (contentToCheck) {
            const projectSections = deserializeSections(contentToCheck)
            const gallerySection = projectSections.find(isGallerySection)
            const firstImage = gallerySection?.images?.[0]
            if (firstImage) {
              featuredImageUrl = firstImage.imageUrl
              featuredImageAlt = firstImage.altText || p.title
            }
          }
        }
        
        return {
          id: p.id,
          slug: p.slug,
          title: p.title,
          venue: p.venue,
          year: p.year,
          order: p.order,
          featuredImageUrl,
          featuredImageAlt,
          categorySlug: c.slug,
          categoryName: c.name,
        }
      })
  )

  // Allow query param override for preview modal, otherwise use draft
  const templateId = (templateOverride || portfolio.draftTemplate || 'featured-grid') as TemplateId
  const Template = TemplateComponents[templateId] || TemplateComponents['featured-grid']

  // Homepage uses template component
  if (targetPage.isHomepage) {
    return (
      <div className="portfolio-page preview-mode" data-theme={theme}>
        <PreviewBanner />
        <Navigation
          portfolioSlug="preview"
          portfolioName={name}
          pages={navPages}
          categories={navCategories}
          theme={theme}
        />
        <main className="portfolio-main">
          <Template
            portfolio={{ name }}
            sections={sections}
            featuredProjects={featuredProjects}
          />
        </main>
      </div>
    )
  }

  // Non-homepage pages use SectionRenderer
  return (
    <div className="portfolio-page preview-mode" data-theme={portfolio.draftTheme}>
      <PreviewBanner />

      {(navPages.length > 1 || navCategories.length > 0) && (
        <Navigation
          portfolioSlug="preview"
          portfolioName={name}
          pages={navPages}
          categories={navCategories}
          theme={theme}
        />
      )}
      
      <main className="portfolio-main">
        <div className="container">
          <SectionRenderer sections={sections} portfolioSlug="preview" />
        </div>
      </main>

      <footer className="portfolio-footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} {name}</p>
        </div>
      </footer>
    </div>
  )
}

function PreviewBanner() {
  return (
    <div className="preview-banner">
      <div className="preview-banner-content">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        <span>Preview Mode</span>
        <span className="preview-banner-hint">This is how your page will look when published</span>
      </div>
      <Link href="/admin" className="preview-banner-exit">
        &larr; Back to Editor
      </Link>
    </div>
  )
}
