'use client'

import { SectionRenderer } from '../SectionRenderer'
import { FeaturedWork } from '../FeaturedWork'
import type { TemplateProps } from './index'

export function FeaturedGridTemplate({
  portfolio,
  sections,
  featuredProjects,
}: TemplateProps) {
  return (
    <div className="container">
      <SectionRenderer sections={sections} portfolioSlug="" />

      {featuredProjects.length > 0 && (
        <FeaturedWork
          projects={featuredProjects}
          portfolioSlug=""
        />
      )}
    </div>
  )
}
