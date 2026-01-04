import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { stripHtml } from '@/lib/sanitize'
import { deserializeSections } from '@/lib/serialization'
import { isHeroSection, isGallerySection } from '@/lib/content-schema'
import { 
  FeaturedGridTemplate, 
  CleanMinimalTemplate, 
  type TemplateId,
  type NavPage 
} from '@/components/portfolio/templates'
import type { Metadata } from 'next'

// Template component lookup
const TemplateComponents = {
  'featured-grid': FeaturedGridTemplate,
  'clean-minimal': CleanMinimalTemplate,
} as const

interface PageProps {
  params: Promise<{ slug: string }>
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const portfolio = await prisma.portfolio.findUnique({
    where: { slug },
    include: { pages: { where: { isHomepage: true }, take: 1 } },
  })

  if (!portfolio) {
    return {
      title: 'Portfolio Not Found',
    }
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

export default async function PortfolioPage({ params }: PageProps) {
  const { slug } = await params
  
  const portfolio = await prisma.portfolio.findUnique({
    where: { slug },
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

  // Get the homepage (homepage always exists - created atomically with portfolio)
  const homePage = portfolio.pages.find(p => p.isHomepage) || portfolio.pages[0]
  
  // Parse sections from PUBLISHED content only (never show draft on published site)
  // This ensures the live site only shows explicitly published content
  const sections = deserializeSections(homePage?.publishedContent)
  
  // Get hero section for name extraction
  const heroSection = sections.find(isHeroSection)
  const name = heroSection?.name || portfolio.name

  // Prepare navigation pages (only show pages that have published content)
  const navPages: NavPage[] = portfolio.pages
    .filter(p => p.showInNav && p.publishedContent)
    .map(p => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      isHomepage: p.isHomepage,
      showInNav: p.showInNav,
    }))

  // Prepare categories for navigation
  const navCategories = portfolio.categories.map(c => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
  }))

  // Collect featured projects from all categories
  const featuredProjects = portfolio.categories.flatMap(category => 
    category.projects.map(project => {
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
        categorySlug: category.slug,
        categoryName: category.name,
      }
    })
  ).sort((a, b) => a.order - b.order).slice(0, 6)

  const theme = portfolio.publishedTheme as 'modern-minimal' | 'classic-elegant' | 'bold-editorial'

  // Select template based on portfolio's published template setting
  const templateId = (portfolio.publishedTemplate || 'featured-grid') as TemplateId
  const Template = TemplateComponents[templateId] || TemplateComponents['featured-grid']

  // Prepare profile photo for template (if exists)
  const profilePhoto = portfolio.profilePhoto ? {
    url: portfolio.profilePhoto.url,
    thumbnailUrl: portfolio.profilePhoto.thumbnailUrl,
    altText: portfolio.profilePhoto.altText || undefined,
  } : null

  return (
    <Template
      portfolio={{
        slug: portfolio.slug,
        name,
        bio: portfolio.bio || null,
        profilePhoto,
        showAboutSection: portfolio.showAboutSection ?? true,
      }}
      sections={sections}
      featuredProjects={featuredProjects}
      navPages={navPages}
      navCategories={navCategories}
      theme={theme}
    />
  )
}
