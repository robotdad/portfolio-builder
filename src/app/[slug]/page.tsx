import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { stripHtml } from '@/lib/sanitize'
import { SectionRenderer } from '@/components/portfolio/SectionRenderer'
import { Navigation, type NavPage } from '@/components/portfolio/Navigation'
import { deserializeSections } from '@/lib/serialization'
import { isHeroSection } from '@/lib/content-schema'
import type { Metadata } from 'next'

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
    description: stripHtml(bio).substring(0, 160),
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

  const theme = portfolio.publishedTheme as 'modern-minimal' | 'classic-elegant' | 'bold-editorial'

  // Section-based rendering with navigation
  return (
    <div className="portfolio-page" data-theme={portfolio.publishedTheme}>
      {navPages.length > 1 && (
        <Navigation
          portfolioSlug={portfolio.slug}
          portfolioName={name}
          pages={navPages}
          theme={theme}
        />
      )}
      <main className="portfolio-main">
        <div className="container">
          <SectionRenderer sections={sections} />
        </div>
      </main>

      <footer className="portfolio-footer">
        <div className="container">
          <p>© {new Date().getFullYear()} {name}</p>
        </div>
      </footer>
    </div>
  )
}
