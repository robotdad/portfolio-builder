import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { sanitizeHtml, stripHtml } from '@/lib/sanitize'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const portfolio = await prisma.portfolio.findUnique({
    where: { slug },
  })

  if (!portfolio) {
    return {
      title: 'Portfolio Not Found',
    }
  }

  return {
    title: `${portfolio.name} - ${portfolio.title}`,
    description: stripHtml(portfolio.bio).substring(0, 160),
  }
}

export default async function PortfolioPage({ params }: PageProps) {
  const { slug } = await params
  
  const portfolio = await prisma.portfolio.findUnique({
    where: { slug },
  })

  if (!portfolio) {
    notFound()
  }

  return (
    <div className="portfolio-page" data-theme={portfolio.theme}>
      <header className="portfolio-header">
        <div className="container">
          <h1 className="portfolio-name">{portfolio.name}</h1>
          <p className="portfolio-title">{portfolio.title}</p>
          <div
            className="portfolio-bio prose-content"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(portfolio.bio) }}
          />
        </div>
      </header>

      <main className="container">
        {/* Future: Project gallery will go here */}
      </main>

      <footer className="portfolio-footer">
        <div className="container">
          <p>© {new Date().getFullYear()} {portfolio.name}</p>
        </div>
      </footer>
    </div>
  )
}
