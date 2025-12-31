import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { stripHtml } from '@/lib/sanitize'
import { SectionRenderer } from '@/components/portfolio/SectionRenderer'
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
  })

  if (!portfolio) {
    return {
      title: 'Portfolio Not Found',
    }
  }

  // Get name and title from hero section if available, or fall back to legacy fields
  const sections = deserializeSections(portfolio.content)
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
    include: { assets: true },
  })

  if (!portfolio) {
    notFound()
  }

  // Parse sections from content JSON
  const sections = deserializeSections(portfolio.content)
  
  // Check if using section-based content or legacy
  const hasSections = sections.length > 0
  
  // For legacy portfolios without sections, render the old way
  if (!hasSections) {
    return (
      <div className="portfolio-page" data-theme={portfolio.theme}>
        <header className="portfolio-header">
          <div className="container">
            {portfolio.assets?.[0] && (
              <div className="portfolio-profile-image">
                <img
                  src={portfolio.assets[0].url}
                  alt={portfolio.assets[0].altText}
                  width={150}
                  height={150}
                />
              </div>
            )}
            <h1 className="portfolio-name">{portfolio.name}</h1>
            <p className="portfolio-title">{portfolio.title}</p>
            {portfolio.bio && (
              <div
                className="portfolio-bio prose-content"
                dangerouslySetInnerHTML={{ __html: portfolio.bio }}
              />
            )}
          </div>
        </header>

        <main className="container">
          {/* Legacy layout - no sections */}
        </main>

        <footer className="portfolio-footer">
          <div className="container">
            <p>© {new Date().getFullYear()} {portfolio.name}</p>
          </div>
        </footer>
      </div>
    )
  }

  // Section-based rendering
  const heroSection = sections.find(isHeroSection)
  const name = heroSection?.name || portfolio.name

  return (
    <div className="portfolio-page" data-theme={portfolio.theme}>
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
