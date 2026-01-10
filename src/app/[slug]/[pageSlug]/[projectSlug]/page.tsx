import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ProjectDetail } from '@/components/portfolio/ProjectDetail'
import { deserializeSections } from '@/lib/serialization'
import { isHeroSection, isGallerySection } from '@/lib/content-schema'
import type { Metadata } from 'next'


interface PageProps {
  params: Promise<{ slug: string; pageSlug: string; projectSlug: string }>
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, pageSlug, projectSlug } = await params
  
  const project = await prisma.project.findFirst({
    where: {
      slug: projectSlug,
      category: {
        slug: pageSlug,
        portfolio: { slug },
      },
    },
    include: {
      category: {
        include: {
          portfolio: true,
        },
      },
    },
  })

  if (!project) {
    return { title: 'Project Not Found' }
  }

  const portfolio = project.category.portfolio
  const description = project.venue 
    ? `${project.title} at ${project.venue}${project.year ? ` (${project.year})` : ''}`
    : project.title

  return {
    title: `${project.title} - ${portfolio.name}`,
    description,
  }
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug, pageSlug: categorySlug, projectSlug } = await params
  
  // Get portfolio with categories
  const portfolio = await prisma.portfolio.findUnique({
    where: { slug },
    include: {
      pages: {
        orderBy: { navOrder: 'asc' },
      },
      categories: {
        orderBy: { order: 'asc' },
      },
      assets: true,
    },
  })

  if (!portfolio) {
    notFound()
  }

  // Find the category
  const category = portfolio.categories.find(c => c.slug === categorySlug)
  
  if (!category) {
    notFound()
  }

  // Get the project
  const project = await prisma.project.findFirst({
    where: {
      slug: projectSlug,
      categoryId: category.id,
      publishedContent: { not: null }, // Only show published projects
    },
  })

  if (!project) {
    notFound()
  }

  // Get homepage for name extraction
  const homePage = portfolio.pages.find(p => p.isHomepage) || portfolio.pages[0]
  const homePageSections = deserializeSections(homePage?.publishedContent)
  const heroSection = homePageSections.find(isHeroSection)
  const portfolioName = heroSection?.name || portfolio.name

  // Parse project content to extract gallery images
  const projectSections = deserializeSections(project.publishedContent)
  const gallerySection = projectSections.find(isGallerySection)
  
  // Extract gallery images
  const galleryImages = gallerySection?.images?.map((img, index) => ({
    id: img.id || `img-${index}`,
    url: img.imageUrl || '',
    altText: img.altText || '',
    caption: img.caption || '',
  })).filter(img => img.url) || []

  // Filter out gallery section from content (we'll render it separately)
  const contentSections = projectSections.filter(s => s.type !== 'gallery')

  // Serialize content back for SectionRenderer
  const contentForRenderer = contentSections.length > 0 
    ? JSON.stringify(contentSections) 
    : null

  return (
    <ProjectDetail
      portfolio={{
        slug: portfolio.slug,
        name: portfolioName,
        publishedTheme: portfolio.publishedTheme,
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
        galleryImages,
      }}
    />
  )
}
