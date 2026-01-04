'use client'

import { Navigation } from '../Navigation'
import { SectionRenderer } from '../SectionRenderer'
import { FeaturedWork } from '../FeaturedWork'
import { AboutSection } from '../AboutSection'
import type { TemplateProps } from './index'

export function FeaturedGridTemplate({
  portfolio,
  sections,
  featuredProjects,
  navPages,
  navCategories,
  theme,
}: TemplateProps) {
  const currentYear = new Date().getFullYear()
  const showNav = navPages.length > 1 || navCategories.length > 0

  // Determine if About section should show
  const shouldShowAbout = 
    portfolio.showAboutSection === true && 
    portfolio.bio?.trim()

  return (
    <div className="portfolio-page" data-theme={theme}>
      {showNav && (
        <Navigation
          portfolioSlug={portfolio.slug}
          portfolioName={portfolio.name}
          pages={navPages}
          categories={navCategories}
          theme={theme}
        />
      )}

      <main className="portfolio-main">
        <div className="container">
          <SectionRenderer sections={sections} portfolioSlug={portfolio.slug} />

          {/* About Section - between hero and featured work */}
          {shouldShowAbout && (
            <AboutSection
              bio={portfolio.bio!}
              profilePhoto={portfolio.profilePhoto}
              name={portfolio.name}
            />
          )}

          {featuredProjects.length > 0 && (
            <FeaturedWork
              projects={featuredProjects}
              portfolioSlug={portfolio.slug}
            />
          )}
        </div>
      </main>

      <footer className="portfolio-footer">
        <div className="container">
          <p>&copy; {currentYear} {portfolio.name}</p>
        </div>
      </footer>
    </div>
  )
}
