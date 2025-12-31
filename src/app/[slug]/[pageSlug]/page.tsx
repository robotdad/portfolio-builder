import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { stripHtml } from '@/lib/sanitize'
import { SectionRenderer } from '@/components/portfolio/SectionRenderer'
import { Navigation, type NavPage } from '@/components/portfolio/Navigation'
import { deserializeSections } from '@/lib/serialization'
import { isHeroSection } from '@/lib/content-schema'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string; pageSlug: string }>
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, pageSlug } = await params
  
  const portfolio = await prisma.portfolio.findUnique({
    where: { slug },
    include: {
      pages: {
        where: { slug: pageSlug },
        take: 1,
      },
    },
  })

  if (!portfolio || !portfolio.pages[0]) {
    return {
      title: 'Page Not Found',
    }
  }

  const page = portfolio.pages[0]
  // Use publishedContent for live site, fallback to draftContent for unpublished pages
  const sections = deserializeSections(page.publishedContent || page.draftContent)
  const heroSection = sections.find(isHeroSection)
  
  const name = heroSection?.name || portfolio.name
  const title = page.title

  return {
    title: `${title} - ${name}`,
    description: heroSection?.bio
      ? stripHtml(heroSection.bio).substring(0, 160)
      : `${title} page of ${name}'s portfolio`,
  }
}

export default async function PortfolioSubPage({ params }: PageProps) {
  const { slug, pageSlug } = await params
  
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

  // Find the specific page by slug
  const currentPage = portfolio.pages.find(p => p.slug === pageSlug)
  
  if (!currentPage) {
    notFound()
  }

  // If this page is the homepage, redirect to the base portfolio URL
  // This prevents the homepage from being accessible at two URLs
  if (currentPage.isHomepage) {
    redirect(`/${slug}`)
  }

  // Parse sections from PUBLISHED content (fallback to draft for unpublished)
  const sections = deserializeSections(currentPage.publishedContent || currentPage.draftContent)
  
  // Get hero section from homepage for the name (for footer)
  const homePage = portfolio.pages.find(p => p.isHomepage) || portfolio.pages[0]
  const homePageSections = deserializeSections(homePage?.publishedContent || homePage?.draftContent)
  const heroSection = homePageSections.find(isHeroSection)
  const name = heroSection?.name || portfolio.name

  // Prepare navigation pages (only show pages with published/draft content)
  const navPages: NavPage[] = portfolio.pages
    .filter(p => p.showInNav && (p.publishedContent || p.draftContent))
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
          {sections.length > 0 ? (
            <SectionRenderer sections={sections} />
          ) : (
            <div className="portfolio-empty-page">
              <h1>{currentPage.title}</h1>
              <p>This page is under construction.</p>
            </div>
          )}
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
