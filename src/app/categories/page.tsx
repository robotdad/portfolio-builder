import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { stripHtml } from '@/lib/sanitize'
import { deserializeSections } from '@/lib/serialization'
import { Navigation, type NavPage, type NavCategory } from '@/components/portfolio/Navigation'
import { PublicFooter } from '@/components/portfolio/PublicFooter'
import { SectionRenderer } from '@/components/portfolio/SectionRenderer'
import { CategoryLanding } from '@/components/portfolio/CategoryLanding'
import type { Metadata } from 'next'

// Force dynamic rendering to avoid build-time database queries
export const dynamic = 'force-dynamic'

// Generate metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  let portfolio
  try {
    portfolio = await prisma.portfolio.findFirst({
      select: {
        name: true,
        bio: true,
      },
    })
  } catch {
    return { title: 'Work' }
  }

  if (!portfolio) {
    return { title: 'Work' }
  }

  return {
    title: `Work - ${portfolio.name}`,
    description: portfolio.bio ? stripHtml(portfolio.bio).substring(0, 160) : `View all work by ${portfolio.name}`,
  }
}

export default async function CategoriesPage() {
  // Check if a portfolio exists
  let portfolio = null
  try {
    portfolio = await prisma.portfolio.findFirst({
      include: {
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
            _count: {
              select: { projects: true },
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

  // Deserialize sections from PUBLISHED content only (never show draft on published site)
  const sections = deserializeSections(portfolio.categoryPagePublishedContent)

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

  // If no published content, show default category grid (backward compatibility)
  if (sections.length === 0) {
    // Transform categories to match CategoryLanding expected format
    const categoryProjects = portfolio.categories.map(category => ({
      id: category.id,
      slug: category.slug,
      title: category.name,
      venue: null,
      year: null,
      order: category.order,
      featuredImageUrl: category.featuredImage?.url || null,
      featuredImageAlt: category.featuredImage?.altText || category.name,
      featuredImageWidth: category.featuredImage?.width,
      featuredImageHeight: category.featuredImage?.height,
    }))

    return (
      <div className="portfolio-page" data-theme={theme}>
        <Navigation
          portfolioSlug=""
          portfolioName={portfolio.name}
          pages={navPages}
          categories={navCategories}
          theme={theme}
        />
        <main className="portfolio-main">
          <CategoryLanding
            portfolio={{
              name: portfolio.name,
              publishedTheme: portfolio.publishedTheme || 'modern-minimal',
            }}
            category={{
              id: 'all-categories',
              name: 'Work',
              slug: 'categories',
              description: null,
            }}
            projects={categoryProjects}
            portfolioSlug=""
          />
        </main>
        <PublicFooter portfolioName={portfolio.name} />
      </div>
    )
  }

  // Render published sections
  return (
    <div className="portfolio-page" data-theme={theme}>
      <Navigation
        portfolioSlug=""
        portfolioName={portfolio.name}
        pages={navPages}
        categories={navCategories}
        theme={theme}
      />
      <main className="portfolio-main">
        <SectionRenderer
          sections={sections}
          portfolioSlug=""
          categories={portfolio.categories}
        />
      </main>
      <PublicFooter portfolioName={portfolio.name} />
    </div>
  )
}
