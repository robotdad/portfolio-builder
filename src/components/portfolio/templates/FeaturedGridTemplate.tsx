'use client'

import { SectionRenderer } from '../SectionRenderer'
import { FeaturedWork } from '../FeaturedWork'
import type { TemplateProps } from './index'

export function FeaturedGridTemplate({
  sections,
  featuredProjects,
  categories,
}: TemplateProps) {
  return (
    <div className="container">
      <SectionRenderer sections={sections} portfolioSlug="" categories={categories} />

      {featuredProjects.length > 0 && (
        <FeaturedWork
          projects={featuredProjects}
          portfolioSlug=""
        />
      )}
    </div>
  )
}
