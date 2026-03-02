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
 * - /preview/categories - Preview category list page
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
  
  const navCategories = portfolio.categories
    .filter(c => c.parentId === null)
    .map(c => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
    }))

  // Check for category list page preview (/preview/categories)
  // Must come BEFORE category slug check to avoid conflicts with a category named "categories"
  if (firstSlug === 'categories' && !secondSlug) {
    // Deserialize category page draft content
    const sections = deserializeSections(portfolio.categoryPageDraftContent || '')
    
    // Map categories to format expected by CategoryGridRenderer
    const categoriesWithCount = portfolio.categories.map(c => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      order: c.order,
      featuredImage: c.featuredImage,
      _count: {
        projects: c.projects.length,
      },
    }))
    
    return (
      <div className="portfolio-page preview-mode" data-theme={theme}>
        <PreviewBanner />
        <Navigation
          portfolioSlug="preview"
          portfolioName={portfolio.name}
          pages={navPages}
          categories={navCategories}
          contactEmail={portfolio.contactEmail ?? undefined}
          theme={theme}
        />
        <main className="portfolio-main">
          {sections.length > 0 ? (
            <SectionRenderer 
              sections={sections} 
              portfolioSlug="preview"
              categories={categoriesWithCount}
            />
          ) : (
            <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
              <h2>No Draft Content</h2>
              <p>Create your category list page in the editor to see it here.</p>
            </div>
          )}
        </main>
      </div>
    )
  }

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
      
      // Parse project content - render ALL sections including galleries inline
      const projectSections = deserializeSections(contentToShow)
      
      // Pass ALL sections to renderer (including galleries - they render inline now)
      const contentForRenderer = projectSections.length > 0 
        ? JSON.stringify(projectSections) 
        : null
      
      return (
        <div className="portfolio-page preview-mode" data-theme={theme}>
          <PreviewBanner />
          <Navigation
            portfolioSlug="preview"
            portfolioName={portfolio.name}
            pages={navPages}
            categories={navCategories}
            contactEmail={portfolio.contactEmail ?? undefined}
            theme={theme}
          />
          <main className="portfolio-main">
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
                publishedContent: contentForRenderer,
                galleryImages: [],  // Galleries render inline via SectionRenderer now
              }}
            />
          </main>
        </div>
      )
    }
    
    // Category landing page - show all projects in category
    // Filter to projects with content
    const projectsWithContent = category.projects.filter(p => p.draftContent || p.publishedContent)
    
    // Deserialize sections from draft content
    const categorySections = deserializeSections(category.draftContent || '')
    
    // Parent categories with children always use CategoryLanding (subcategory tiles).
    // SectionRenderer only applies to leaf categories with draft content.
    const hasChildren = category.children.length > 0

    if (!hasChildren && categorySections.length > 0) {
      // Build projects in format expected by SectionRenderer (ProjectWithImage interface)
      const projectsForRenderer = projectsWithContent.map(project => ({
        id: project.id,
        slug: project.slug,
        title: project.title,
        venue: project.venue,
        year: project.year,
        role: project.role,
        order: project.order,
        featuredImage: project.featuredImage,
      }))
      
      return (
        <div className="portfolio-page preview-mode" data-theme={theme}>
          <PreviewBanner />
          <Navigation
            portfolioSlug="preview"
            portfolioName={portfolio.name}
            pages={navPages}
            categories={navCategories}
            contactEmail={portfolio.contactEmail ?? undefined}
            theme={theme}
          />
          <main className="portfolio-main">
            <SectionRenderer
              sections={categorySections}
              portfolioSlug="preview"
              categorySlug={category.slug}
              projects={projectsForRenderer}
            />
          </main>
        </div>
      )
    }
    
    // Fallback to CategoryLanding when no sections exist
    // Build projects with flattened image fields for CategoryLanding
    const projectsWithImages = projectsWithContent.map(project => {
      // Prefer explicit featuredImage, fallback to gallery extraction
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
        featuredImageWidth,
        featuredImageHeight,
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
          subcategories={category.children.map(child => ({
            id: child.id,
            name: child.name,
            slug: child.slug,
            featuredImage: child.featuredImage,
            projectCount: child._count.projects,
          }))}
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
        let featuredImageWidth: number | undefined = undefined
        let featuredImageHeight: number | undefined = undefined
        
        if (p.featuredImage) {
          featuredImageUrl = p.featuredImage.url
          featuredImageAlt = p.featuredImage.altText || p.title
          featuredImageWidth = p.featuredImage.width
          featuredImageHeight = p.featuredImage.height
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
          featuredImageWidth,
          featuredImageHeight,
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
          contactEmail={portfolio.contactEmail ?? undefined}
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
          contactEmail={portfolio.contactEmail ?? undefined}
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
