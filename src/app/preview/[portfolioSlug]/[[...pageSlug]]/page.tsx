import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { SectionRenderer } from '@/components/portfolio/SectionRenderer'
import { Navigation, type NavPage } from '@/components/portfolio/Navigation'
import { deserializeSections } from '@/lib/serialization'
import { isHeroSection } from '@/lib/content-schema'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ 
    portfolioSlug: string
    pageSlug?: string[] 
  }>
}

// Generate metadata for SEO (preview pages shouldn't be indexed)
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { portfolioSlug } = await params
  
  return {
    title: `Preview - ${portfolioSlug}`,
    robots: 'noindex, nofollow', // Don't index preview pages
  }
}

/**
 * Preview Route - Shows draft content in published layout
 * 
 * URL patterns:
 * - /preview/portfolio-slug - Preview homepage
 * - /preview/portfolio-slug/page-slug - Preview specific page
 * 
 * This uses draftContent instead of publishedContent to show
 * what the page will look like before publishing.
 */
export default async function PreviewPage({ params }: PageProps) {
  const { portfolioSlug, pageSlug } = await params
  
  // Get the specific page slug (empty array means homepage)
  const targetPageSlug = pageSlug?.[0] || ''
  
  const portfolio = await prisma.portfolio.findUnique({
    where: { slug: portfolioSlug },
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

  // Find the target page
  let targetPage = portfolio.pages.find(p => p.slug === targetPageSlug)
  
  // If no exact match and looking for homepage, try isHomepage flag
  if (!targetPage && targetPageSlug === '') {
    targetPage = portfolio.pages.find(p => p.isHomepage)
  }
  
  // Fallback to first page
  if (!targetPage) {
    targetPage = portfolio.pages[0]
  }

  if (!targetPage) {
    notFound()
  }

  // Parse sections from DRAFT content (not published)
  const sections = deserializeSections(targetPage.draftContent)
  
  // Get hero section for name extraction
  const heroSection = sections.find(isHeroSection)
  const name = heroSection?.name || portfolio.name

  // Prepare navigation pages (for preview, still show all pages)
  const navPages: NavPage[] = portfolio.pages.map(p => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    isHomepage: p.isHomepage,
    showInNav: p.showInNav,
  }))

  const theme = portfolio.theme as 'modern-minimal' | 'classic-elegant' | 'bold-editorial'

  return (
    <div className="portfolio-page preview-mode" data-theme={portfolio.theme}>
      {/* Preview Banner */}
      <div className="preview-banner">
        <div className="preview-banner-content">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span>Preview Mode</span>
          <span className="preview-banner-hint">This is how your page will look when published</span>
        </div>
        <a href="/admin" className="preview-banner-exit">
          ← Back to Editor
        </a>
      </div>

      {navPages.length > 1 && (
        <Navigation
          portfolioSlug={`preview/${portfolio.slug}`}
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
