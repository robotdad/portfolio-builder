import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Navigation, type NavPage, type NavCategory } from '@/components/portfolio/Navigation'
import { PublicFooter } from '@/components/portfolio/PublicFooter'

// ============================================================================
// Types
// ============================================================================

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

type PortfolioTheme = 'modern-minimal' | 'classic-elegant' | 'bold-editorial'

// ============================================================================
// Data Fetching
// ============================================================================

async function getPortfolioForLayout(slug: string) {
  const portfolio = await prisma.portfolio.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
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
  params,
}: LayoutProps) {
  const { slug } = await params
  const portfolio = await getPortfolioForLayout(slug)

  if (!portfolio) {
    notFound()
  }

  // Prepare navigation data
  const navPages: NavPage[] = portfolio.pages.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    isHomepage: p.isHomepage,
    showInNav: p.showInNav,
  }))

  const navCategories: NavCategory[] = portfolio.categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
  }))

  const theme = (portfolio.publishedTheme || 'modern-minimal') as PortfolioTheme

  return (
    <div className="portfolio-page" data-theme={theme}>
      <Navigation
        portfolioSlug={portfolio.slug}
        portfolioName={portfolio.name}
        pages={navPages}
        categories={navCategories}
        theme={theme}
      />
      <main className="portfolio-main">
        {children}
      </main>
      <PublicFooter portfolioName={portfolio.name} />
    </div>
  )
}
