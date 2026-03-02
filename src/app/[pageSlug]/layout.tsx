import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Navigation, type NavPage, type NavCategory } from '@/components/portfolio/Navigation'
import { PublicFooter } from '@/components/portfolio/PublicFooter'
import { ScrollToTop } from '@/components/portfolio/ScrollToTop'

// ============================================================================
// Types
// ============================================================================

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{ pageSlug: string }>
}

type PortfolioTheme = 'modern-minimal' | 'classic-elegant' | 'bold-editorial'

// ============================================================================
// Data Fetching
// ============================================================================

async function getPortfolioForLayout() {
  const portfolio = await prisma.portfolio.findFirst({
    select: {
      id: true,
      name: true,
      contactEmail: true,
      publishedTheme: true,
      pages: {
        where: { showInNav: true, publishedContent: { not: null } },
        orderBy: { navOrder: 'asc' },
        select: {
          id: true,
          title: true,
          slug: true,
          isHomepage: true,
          showInNav: true,
        },
      },
      categories: {
        where: { parentId: null },
        orderBy: { order: 'asc' },
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  })

  return portfolio
}

// ============================================================================
// Layout Component
// ============================================================================

export default async function PublicPortfolioLayout({
  children,
}: LayoutProps) {
  const portfolio = await getPortfolioForLayout()

  if (!portfolio) {
    notFound()
  }

  // Prepare navigation data
  const navPages: NavPage[] = portfolio.pages.map((p: { id: string; title: string; slug: string; isHomepage: boolean; showInNav: boolean }) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    isHomepage: p.isHomepage,
    showInNav: p.showInNav,
  }))

  const navCategories: NavCategory[] = portfolio.categories.map((c: { id: string; name: string; slug: string }) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
  }))

  const theme = (portfolio.publishedTheme || 'modern-minimal') as PortfolioTheme

  return (
    <div className="portfolio-page" data-theme={theme}>
      <ScrollToTop />
      <Navigation
        portfolioSlug=""
        portfolioName={portfolio.name}
        pages={navPages}
        categories={navCategories}
        contactEmail={portfolio.contactEmail ?? undefined}
        theme={theme}
      />
      <main className="portfolio-main">
        {children}
      </main>
      <PublicFooter portfolioName={portfolio.name} />
    </div>
  )
}
