'use client'

import { SectionRenderer } from '../SectionRenderer'
import { FeaturedWork } from '../FeaturedWork'
import { AboutSection } from '../AboutSection'
import type { TemplateProps } from './index'

export function FeaturedGridTemplate({
  portfolio,
  sections,
  featuredProjects,
}: TemplateProps) {
  // Determine if About section should show
  const shouldShowAbout = 
    portfolio.showAboutSection === true && 
    portfolio.bio?.trim()

  return (
    <div className="container">
      <SectionRenderer sections={sections} portfolioSlug="" />

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
          portfolioSlug=""
        />
      )}
    </div>
  )
}
