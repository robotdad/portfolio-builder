import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { stripHtml } from '@/lib/sanitize'
import { deserializeSections } from '@/lib/serialization'
import { isHeroSection, isGallerySection } from '@/lib/content-schema'
import { Navigation, type NavPage, type NavCategory } from '@/components/portfolio/Navigation'
import { PublicFooter } from '@/components/portfolio/PublicFooter'
import { 
  FeaturedGridTemplate, 
  CleanMinimalTemplate, 
  type TemplateId,
} from '@/components/portfolio/templates'
import type { Metadata } from 'next'

// Force dynamic rendering to avoid build-time database queries
export const dynamic = 'force-dynamic'

// Template component lookup
const TemplateComponents = {
  'featured-grid': FeaturedGridTemplate,
  'clean-minimal': CleanMinimalTemplate,
} as const

// Generate metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  let portfolio
  try {
    portfolio = await prisma.portfolio.findFirst({
      include: { pages: { where: { isHomepage: true }, take: 1 } },
    })
  } catch {
    return { title: 'Portfolio' }
  }

  if (!portfolio) {
    return { title: 'Portfolio' }
  }

  // Get sections from homepage publishedContent only (never show draft on published site)
  const homePage = portfolio.pages[0]
  const sections = deserializeSections(homePage?.publishedContent)
  const heroSection = sections.find(isHeroSection)
  
  const name = heroSection?.name || portfolio.name
  const title = heroSection?.title || portfolio.title
  const bio = heroSection?.bio || portfolio.bio

  return {
    title: `${name} - ${title}`,
    description: stripHtml(bio || '').substring(0, 160),
  }
}

export default async function Home() {
  // Check if a portfolio exists
  let portfolio = null
  try {
    portfolio = await prisma.portfolio.findFirst({
      include: {
        assets: true,
        pages: {
          orderBy: { navOrder: 'asc' },
        },
        // Include profile photo for About section
        profilePhoto: {
          select: {
            url: true,
            thumbnailUrl: true,
            altText: true,
          },
        },
        categories: {
          orderBy: { order: 'asc' },
          include: {
            projects: {
              where: {
                isFeatured: true,
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
  } catch {
    // Database may not be set up yet - redirect to onboarding
    redirect('/welcome/portfolio')
  }
  
  if (!portfolio) {
    // No portfolio exists - redirect to onboarding
    redirect('/welcome/portfolio')
  }

  // Get the homepage (homepage always exists - created atomically with portfolio)
  const homePage = portfolio.pages.find(p => p.isHomepage) || portfolio.pages[0]
  
  // Parse sections from PUBLISHED content only (never show draft on published site)
  // This ensures the live site only shows explicitly published content
  const sections = deserializeSections(homePage?.publishedContent)
  
  // Get hero section for name extraction
  const heroSection = sections.find(isHeroSection)
  const name = heroSection?.name || portfolio.name

  // Collect featured projects from all categories
  const featuredProjects = portfolio.categories.flatMap(category => 
    category.projects.map(project => {
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
        categorySlug: category.slug,
        categoryName: category.name,
      }
    })
  ).sort((a, b) => a.order - b.order).slice(0, 6)

  // Select template based on portfolio's published template setting
  const templateId = (portfolio.publishedTemplate || 'featured-grid') as TemplateId
  const Template = TemplateComponents[templateId] || TemplateComponents['featured-grid']

  // Prepare navigation data
  const navPages: NavPage[] = portfolio.pages
    .filter(p => p.showInNav)
    .map(p => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      isHomepage: p.isHomepage,
      showInNav: p.showInNav,
    }))

  const navCategories: NavCategory[] = portfolio.categories.map(c => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
  }))

  const theme = (portfolio.publishedTheme || 'modern-minimal') as 'modern-minimal' | 'classic-elegant' | 'bold-editorial'

  return (
    <div className="portfolio-page" data-theme={theme}>
      <Navigation
        portfolioSlug=""
        portfolioName={name}
        pages={navPages}
        categories={navCategories}
        theme={theme}
      />
      <main className="portfolio-main">
        <Template
          portfolio={{
            name,
          }}
          sections={sections}
          featuredProjects={featuredProjects}
        />
      </main>
      <PublicFooter portfolioName={name} />
    </div>
  )
}
